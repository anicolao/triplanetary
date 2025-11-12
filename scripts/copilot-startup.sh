#!/bin/bash
# Copilot Startup Script
# This script orchestrates all startup tasks for Copilot sessions
# to ensure consistent initialization across all runs.

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Track overall success
OVERALL_SUCCESS=true

# Change to project root
cd "$PROJECT_ROOT"

# Banner
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Triplanetary Copilot Startup Script                 ║${NC}"
echo -e "${BLUE}║  Ensuring consistent initialization for Copilot sessions      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Verify Environment
log_section "Step 1: Environment Verification"
if bash "$SCRIPT_DIR/verify-environment.sh"; then
    log_success "Environment verification passed"
else
    log_error "Environment verification failed"
    OVERALL_SUCCESS=false
fi

# Step 2: Check and Update Dependencies
log_section "Step 2: Dependency Management"
if bash "$SCRIPT_DIR/check-dependencies.sh"; then
    log_success "Dependencies are up to date"
else
    log_warning "Dependency check completed with warnings (non-critical)"
fi

# Step 3: Install Dependencies
log_section "Step 3: Installing Dependencies"
log_info "Running: npm ci"
if npm ci; then
    log_success "Dependencies installed successfully"
else
    log_error "Failed to install dependencies"
    OVERALL_SUCCESS=false
fi

# Step 4: Build Project
log_section "Step 4: Building Project"
log_info "Running: npm run build"
if npm run build; then
    log_success "Build completed successfully"
else
    log_error "Build failed"
    OVERALL_SUCCESS=false
fi

# Step 5: Install Playwright Browsers
log_section "Step 5: Playwright Browser Setup"
log_info "Installing Playwright browsers..."
if npx playwright install chromium; then
    log_success "Playwright browsers installed"
else
    log_error "Failed to install Playwright browsers"
    OVERALL_SUCCESS=false
fi

# Step 6: Run Tests
log_section "Step 6: Running Tests"
if bash "$SCRIPT_DIR/run-tests.sh"; then
    log_success "All tests passed"
else
    log_warning "Some tests failed (review output above)"
    # Note: We don't set OVERALL_SUCCESS=false here because existing
    # test failures might be unrelated to the startup process
fi

# Summary
echo ""
log_section "Startup Summary"
if [ "$OVERALL_SUCCESS" = true ]; then
    log_success "All critical startup tasks completed successfully"
    echo ""
    log_info "The project is ready for development."
    log_info "You can now:"
    log_info "  - Start dev server: npm run dev"
    log_info "  - Run tests: npm test"
    log_info "  - Run E2E tests: npm run test:e2e"
    echo ""
    exit 0
else
    log_error "Some critical startup tasks failed"
    echo ""
    log_warning "Please review the errors above and fix them before proceeding."
    echo ""
    exit 1
fi
