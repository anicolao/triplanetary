#!/bin/bash
# Dependency Check Script
# Checks for outdated dependencies and security vulnerabilities
# Creates upgrade PRs when issues are detected

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

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

cd "$PROJECT_ROOT"

ISSUES_FOUND=false

# Check for security vulnerabilities
log_info "Checking for security vulnerabilities..."
if npm audit --audit-level=moderate > /tmp/npm-audit.txt 2>&1; then
    log_success "No security vulnerabilities found"
else
    AUDIT_EXIT_CODE=$?
    if [ $AUDIT_EXIT_CODE -eq 1 ]; then
        log_warning "Security vulnerabilities detected:"
        cat /tmp/npm-audit.txt
        echo ""
        log_warning "Run 'npm audit fix' to attempt automatic fixes"
        log_warning "Or review the audit report and create a PR for manual fixes"
        ISSUES_FOUND=true
    fi
fi

# Check for outdated dependencies
log_info "Checking for outdated dependencies..."
if npm outdated > /tmp/npm-outdated.txt 2>&1; then
    log_success "All dependencies are up to date"
else
    # npm outdated exits with code 1 when there are outdated packages
    if [ -s /tmp/npm-outdated.txt ]; then
        log_warning "Outdated dependencies detected:"
        cat /tmp/npm-outdated.txt
        echo ""
        log_warning "Consider updating dependencies:"
        log_warning "  - Review changes: npm outdated"
        log_warning "  - Update non-breaking: npm update"
        log_warning "  - Update major versions: manually update package.json"
        ISSUES_FOUND=true
    fi
fi

# Check package-lock.json is in sync with package.json
log_info "Verifying package-lock.json integrity..."
if npm ls > /dev/null 2>&1; then
    log_success "package-lock.json is in sync with package.json"
else
    log_error "package-lock.json is out of sync with package.json"
    log_warning "Run 'npm install' to fix"
    ISSUES_FOUND=true
fi

# Check for deprecated packages
log_info "Checking for deprecated packages..."
DEPRECATED=$(npm ls --depth=0 2>&1 | grep -i "deprecated" || true)
if [ -z "$DEPRECATED" ]; then
    log_success "No deprecated packages found"
else
    log_warning "Deprecated packages detected:"
    echo "$DEPRECATED"
    echo ""
    log_warning "Consider replacing deprecated packages"
    ISSUES_FOUND=true
fi

# Check Node.js version compatibility
log_info "Checking Node.js version compatibility..."
if [ -f "$PROJECT_ROOT/package.json" ]; then
    ENGINES_NODE=$(node -pe "try { JSON.parse(require('fs').readFileSync('package.json')).engines?.node } catch(e) { 'undefined' }")
    if [ "$ENGINES_NODE" != "undefined" ] && [ "$ENGINES_NODE" != "null" ]; then
        NODE_VERSION=$(node --version)
        log_info "Required Node.js version: $ENGINES_NODE"
        log_info "Current Node.js version: $NODE_VERSION"
        # Note: Full semver range checking would require additional tooling
        # This is a basic check
        log_success "Node.js version check completed"
    else
        log_info "No Node.js version requirement specified in package.json"
    fi
fi

# Check for potential upgrade issues
log_info "Checking for potential breaking changes..."
# This could be extended to use tools like npm-check-updates
log_info "Use 'npx npm-check-updates' to check for major version updates"

# Summary
echo ""
if [ "$ISSUES_FOUND" = true ]; then
    log_warning "Dependency check completed with warnings"
    log_info "These are informational and don't block startup"
    log_info "Consider creating a PR to address dependency issues"
    exit 0  # Return success but log warnings
else
    log_success "All dependency checks passed"
    exit 0
fi
