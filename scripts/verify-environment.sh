#!/bin/bash
# Environment Verification Script
# Validates that all required tools and environment settings are available

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

ALL_CHECKS_PASSED=true

# Check Node.js
log_info "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "Node.js is installed: $NODE_VERSION"
    
    # Extract major version number
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 20 ]; then
        log_success "Node.js version is 20 or higher (required)"
    else
        log_error "Node.js version must be 20 or higher (found: $NODE_VERSION)"
        ALL_CHECKS_PASSED=false
    fi
else
    log_error "Node.js is not installed"
    ALL_CHECKS_PASSED=false
fi

# Check npm
log_info "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_success "npm is installed: $NPM_VERSION"
else
    log_error "npm is not installed"
    ALL_CHECKS_PASSED=false
fi

# Check git
log_info "Checking git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    log_success "git is installed: $GIT_VERSION"
else
    log_error "git is not installed"
    ALL_CHECKS_PASSED=false
fi

# Check if we're in a git repository
log_info "Checking git repository..."
cd "$PROJECT_ROOT"
if git rev-parse --git-dir > /dev/null 2>&1; then
    log_success "Inside a git repository"
else
    log_error "Not inside a git repository"
    ALL_CHECKS_PASSED=false
fi

# Check package.json exists
log_info "Checking package.json..."
if [ -f "$PROJECT_ROOT/package.json" ]; then
    log_success "package.json found"
else
    log_error "package.json not found"
    ALL_CHECKS_PASSED=false
fi

# Check tsconfig.json exists
log_info "Checking tsconfig.json..."
if [ -f "$PROJECT_ROOT/tsconfig.json" ]; then
    log_success "tsconfig.json found"
else
    log_error "tsconfig.json not found"
    ALL_CHECKS_PASSED=false
fi

# Check available disk space
log_info "Checking disk space..."
AVAILABLE_SPACE=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
log_info "Available disk space: $AVAILABLE_SPACE"

# Check if Playwright config exists
log_info "Checking Playwright configuration..."
if [ -f "$PROJECT_ROOT/playwright.config.ts" ]; then
    log_success "playwright.config.ts found"
else
    log_error "playwright.config.ts not found"
    ALL_CHECKS_PASSED=false
fi

# Check if vitest config exists
log_info "Checking Vitest configuration..."
if [ -f "$PROJECT_ROOT/vitest.config.ts" ]; then
    log_success "vitest.config.ts found"
else
    log_error "vitest.config.ts not found"
    ALL_CHECKS_PASSED=false
fi

# Check environment variables (if any are required)
# Add checks here for any required environment variables

# Final result
echo ""
if [ "$ALL_CHECKS_PASSED" = true ]; then
    log_success "All environment checks passed"
    exit 0
else
    log_error "Some environment checks failed"
    exit 1
fi
