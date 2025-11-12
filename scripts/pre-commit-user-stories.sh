#!/bin/bash
# Pre-commit hook to run user story E2E tests
# This ensures all gameplay changes are validated with visual testing

set -e

echo "Running user story E2E tests..."

# Install Playwright if not already installed
if ! npx playwright --version > /dev/null 2>&1; then
  echo "Installing Playwright..."
  npx playwright install chromium
fi

# Run user story tests
npm run test:e2e -- tests/e2e/user-stories

# Check exit code
if [ $? -eq 0 ]; then
  echo "✓ User story tests passed"
  exit 0
else
  echo "✗ User story tests failed"
  echo "Please review the test output and fix any issues before committing."
  exit 1
fi
