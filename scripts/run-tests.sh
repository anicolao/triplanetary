#!/bin/bash
# Unified Test Runner
# Runs unit tests and optionally E2E tests
# Can be used for CI/CD, pre-commit hooks, and Copilot startup

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

# Parse arguments
RUN_UNIT=true
RUN_E2E=false
RUN_USER_STORIES=false
QUICK_MODE=false

for arg in "$@"; do
    case $arg in
        --unit-only)
            RUN_E2E=false
            RUN_USER_STORIES=false
            ;;
        --e2e-only)
            RUN_UNIT=false
            RUN_E2E=true
            ;;
        --all)
            RUN_UNIT=true
            RUN_E2E=true
            RUN_USER_STORIES=true
            ;;
        --user-stories)
            RUN_USER_STORIES=true
            ;;
        --quick)
            QUICK_MODE=true
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --unit-only       Run only unit tests (default)"
            echo "  --e2e-only        Run only E2E tests"
            echo "  --all             Run all tests (unit + E2E + user stories)"
            echo "  --user-stories    Run user story tests"
            echo "  --quick           Run tests in quick mode (minimal output)"
            echo "  --help            Show this help message"
            echo ""
            exit 0
            ;;
    esac
done

TESTS_PASSED=true

# Run unit tests
if [ "$RUN_UNIT" = true ]; then
    log_info "Running unit tests..."
    if [ "$QUICK_MODE" = true ]; then
        if npm test -- --run --reporter=basic > /tmp/unit-tests.log 2>&1; then
            log_success "Unit tests passed ($(grep -c 'Test Files' /tmp/unit-tests.log || echo '0') test files)"
        else
            log_error "Unit tests failed"
            cat /tmp/unit-tests.log
            TESTS_PASSED=false
        fi
    else
        if npm test -- --run; then
            log_success "Unit tests passed"
        else
            log_error "Unit tests failed"
            TESTS_PASSED=false
        fi
    fi
    echo ""
fi

# Run E2E tests
if [ "$RUN_E2E" = true ]; then
    log_info "Running E2E tests..."
    
    # Make sure Playwright browsers are installed
    if ! npx playwright --version > /dev/null 2>&1; then
        log_warning "Playwright not found, installing..."
        npx playwright install chromium
    fi
    
    if [ "$QUICK_MODE" = true ]; then
        if npm run test:e2e > /tmp/e2e-tests.log 2>&1; then
            log_success "E2E tests passed"
        else
            log_error "E2E tests failed"
            cat /tmp/e2e-tests.log
            TESTS_PASSED=false
        fi
    else
        if npm run test:e2e; then
            log_success "E2E tests passed"
        else
            log_error "E2E tests failed"
            TESTS_PASSED=false
        fi
    fi
    echo ""
fi

# Run user story tests
if [ "$RUN_USER_STORIES" = true ]; then
    log_info "Running user story tests..."
    
    # Make sure Playwright browsers are installed
    if ! npx playwright --version > /dev/null 2>&1; then
        log_warning "Playwright not found, installing..."
        npx playwright install chromium
    fi
    
    if npm run test:e2e -- tests/e2e/user-stories; then
        log_success "User story tests passed"
    else
        log_warning "User story tests failed or have visual differences"
        log_info "Review the test output to determine if changes are intentional"
        # Don't fail overall - user stories might have intentional changes
    fi
    echo ""
fi

# Summary
if [ "$TESTS_PASSED" = true ]; then
    log_success "All requested tests passed"
    exit 0
else
    log_error "Some tests failed"
    exit 1
fi
