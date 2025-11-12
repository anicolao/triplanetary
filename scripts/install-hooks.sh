#!/bin/bash
# Script to install git hooks for the project

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "Installing git hooks..."

# Create pre-commit hook
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash
# Pre-commit hook for Triplanetary project
# Runs user story E2E tests to validate gameplay changes

# Run user story tests
./scripts/pre-commit-user-stories.sh

exit $?
EOF

# Make hook executable
chmod +x "$HOOKS_DIR/pre-commit"

echo "✓ Pre-commit hook installed successfully"
echo ""
echo "The hook will run user story E2E tests before each commit."
echo "To skip the hook temporarily, use: git commit --no-verify"
