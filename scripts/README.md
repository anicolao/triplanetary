# Triplanetary Scripts

This directory contains automation scripts for consistent initialization, testing, and maintenance of the Triplanetary project.

## Overview

The script system provides:
- **Automated startup** for Copilot sessions and CI/CD pipelines
- **Environment verification** to catch configuration issues early
- **Dependency management** with security scanning and update detection
- **Unified test execution** across unit, E2E, and user story tests
- **Self-maintenance** capabilities for detecting and addressing infrastructure gaps

## Core Scripts

### copilot-startup.sh

**Purpose:** Main orchestration script for complete project initialization

**Usage:**
```bash
./scripts/copilot-startup.sh
```

**What it does:**
1. ✓ Verifies environment (Node.js 20+, npm, git, configs)
2. ✓ Checks dependencies for security issues and updates
3. ✓ Installs dependencies with `npm ci`
4. ✓ Builds project (TypeScript + Vite)
5. ✓ Installs Playwright browsers
6. ✓ Runs unit tests to validate baseline

**Exit codes:**
- `0`: Success - all critical tasks completed
- `1`: Failure - one or more critical tasks failed

**When to use:**
- Start of every Copilot session
- CI/CD pipeline initialization
- Setting up new development environments
- After major changes to validate system health

---

### verify-environment.sh

**Purpose:** Validates all required tools and configurations are present

**Usage:**
```bash
./scripts/verify-environment.sh
```

**Checks performed:**
- Node.js version ≥20
- npm installation
- git installation and repository status
- package.json and configuration files
- Disk space availability

**Exit codes:**
- `0`: All checks passed
- `1`: One or more checks failed

**When to use:**
- Troubleshooting startup issues
- Validating new development environments
- CI/CD environment setup verification

---

### check-dependencies.sh

**Purpose:** Comprehensive dependency security and update checking

**Usage:**
```bash
./scripts/check-dependencies.sh
```

**Checks performed:**
- Security vulnerabilities (`npm audit`)
- Outdated packages (`npm outdated`)
- package-lock.json integrity
- Deprecated packages
- Node.js version compatibility

**Exit codes:**
- `0`: Checks passed (may include non-blocking warnings)

**Output:**
- Logs warnings for issues found
- Provides actionable commands to fix issues
- Suggests creating upgrade PRs when needed

**When to use:**
- Before adding new dependencies
- Periodic maintenance checks
- After major Node.js/npm updates
- When security alerts are received

**Self-Maintenance:**
This script implements the project's self-maintenance strategy by:
1. Detecting outdated dependencies and security issues
2. Providing clear remediation steps
3. Recommending when to create upgrade PRs
4. Not blocking startup for non-critical issues

---

### run-tests.sh

**Purpose:** Unified test runner supporting multiple test suites and modes

**Usage:**
```bash
./scripts/run-tests.sh [OPTIONS]
```

**Options:**
- `--unit-only` - Run only unit tests (default)
- `--e2e-only` - Run only E2E tests
- `--all` - Run all tests (unit + E2E + user stories)
- `--user-stories` - Run user story tests
- `--quick` - Quick mode with minimal output
- `--help` - Show usage information

**Examples:**
```bash
# Default: unit tests only
./scripts/run-tests.sh

# All test suites
./scripts/run-tests.sh --all

# E2E tests with minimal output
./scripts/run-tests.sh --e2e-only --quick

# User stories only
./scripts/run-tests.sh --user-stories
```

**Exit codes:**
- `0`: All requested tests passed
- `1`: One or more tests failed

**When to use:**
- Validating changes before commit
- CI/CD test execution
- Pre-deployment verification
- Selective test execution during development

---

### install-hooks.sh

**Purpose:** Installs git hooks for the project

**Usage:**
```bash
./scripts/install-hooks.sh
```

**What it does:**
- Installs pre-commit hook that runs user story tests
- Makes hooks executable
- Provides usage instructions

**Pre-commit hook behavior:**
- Runs user story E2E tests before each commit
- Compares screenshots with baselines
- Blocks commit if tests fail or screenshots differ
- Can be skipped with `git commit --no-verify`

**When to use:**
- Initial project setup
- After cloning the repository
- When hooks are accidentally removed

---

### pre-commit-user-stories.sh

**Purpose:** Pre-commit hook implementation for user story validation

**Usage:**
```bash
./scripts/pre-commit-user-stories.sh
```

**What it does:**
- Installs Playwright if not present
- Runs user story E2E tests
- Validates visual regressions

**Note:** This script is automatically called by the git pre-commit hook. Don't run directly unless testing the hook behavior.

---

## Integration Patterns

### CI/CD Pipeline

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      # Option 1: Complete startup
      - name: Initialize and Validate
        run: ./scripts/copilot-startup.sh
      
      # Option 2: Individual steps
      - name: Verify Environment
        run: ./scripts/verify-environment.sh
      
      - name: Check Dependencies
        run: ./scripts/check-dependencies.sh
      
      - name: Build
        run: npm ci && npm run build
      
      - name: Test
        run: ./scripts/run-tests.sh --all
```

### Local Development Workflow

```bash
# Initial setup
git clone <repository>
cd triplanetary
./scripts/copilot-startup.sh
./scripts/install-hooks.sh

# Daily work
./scripts/run-tests.sh --unit-only  # Quick validation
# Make changes...
./scripts/run-tests.sh --all         # Full validation before commit

# Periodic maintenance
./scripts/check-dependencies.sh      # Check for updates
```

### Copilot Session Start

```bash
# Always run at session start
./scripts/copilot-startup.sh

# Proceed with development after successful startup
```

## Extending the System

### Adding a New Script

1. **Create the script:**
   ```bash
   touch scripts/my-new-script.sh
   chmod +x scripts/my-new-script.sh
   ```

2. **Follow the template:**
   ```bash
   #!/bin/bash
   # Brief description of what the script does
   
   set -e  # Exit on error
   
   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
   PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
   
   # Use consistent logging (see existing scripts)
   # ... your logic here ...
   
   exit 0  # or 1 on failure
   ```

3. **Integrate if needed:**
   - Add to `copilot-startup.sh` if it's an initialization step
   - Add to `run-tests.sh` if it's a test category
   - Document in this README

4. **Test thoroughly:**
   ```bash
   ./scripts/my-new-script.sh
   # Test in clean environment
   # Test failure scenarios
   ```

### Adding New Test Categories

To add a new test category to `run-tests.sh`:

1. Add argument parsing:
   ```bash
   --my-tests)
       RUN_MY_TESTS=true
       ;;
   ```

2. Add execution logic:
   ```bash
   if [ "$RUN_MY_TESTS" = true ]; then
       log_info "Running my tests..."
       if npm run test:my-tests; then
           log_success "My tests passed"
       else
           log_error "My tests failed"
           TESTS_PASSED=false
       fi
   fi
   ```

3. Update help text and documentation

### Adding Environment Checks

To add new checks to `verify-environment.sh`:

1. Add check logic:
   ```bash
   log_info "Checking my-tool..."
   if command -v my-tool &> /dev/null; then
       log_success "my-tool is installed"
   else
       log_error "my-tool is not installed"
       ALL_CHECKS_PASSED=false
   fi
   ```

2. Test the check in various environments

## Maintenance

### Regular Maintenance Tasks

**Quarterly:**
- Review all scripts for updates needed
- Check if new dependencies require environment checks
- Validate scripts in clean environments
- Update version requirements if needed

**When Adding Dependencies:**
- Run `./scripts/check-dependencies.sh`
- Address security warnings
- Update documentation if new tools required

**When Upgrading Tools:**
- Update version checks in `verify-environment.sh`
- Test all scripts with new versions
- Update CI/CD workflows
- Document breaking changes

### Troubleshooting

**Startup fails:**
```bash
# Run individual components to isolate issue
./scripts/verify-environment.sh
./scripts/check-dependencies.sh
node --version
npm ls
```

**Tests fail:**
```bash
# Run with verbose output
./scripts/run-tests.sh --unit-only
npm test -- --reporter=verbose
npm run test:e2e -- --debug
```

**Dependency issues:**
```bash
# Check for problems
./scripts/check-dependencies.sh
npm audit
npm outdated

# Fix issues
npm audit fix
npm update
```

## Design Philosophy

The script system is designed with these principles:

1. **Fail Fast:** Catch issues early with comprehensive checks
2. **Clear Feedback:** Use colored output and clear messages
3. **Modularity:** Each script has a single responsibility
4. **Composability:** Scripts can be used independently or together
5. **CI/CD Ready:** Exit codes and output suitable for automation
6. **Self-Documenting:** Scripts include helpful messages and usage info
7. **Self-Maintaining:** Detect and report infrastructure issues automatically

## Output Format

All scripts use consistent logging:

- 🔵 `ℹ` - Informational messages (blue)
- ✅ `✓` - Success indicators (green)
- ⚠️ `⚠` - Warnings, non-blocking issues (yellow)
- ❌ `✗` - Errors, blocking issues (red)

Section headers use ASCII box drawing for clear visual separation.

## Error Codes

Standard exit codes used across all scripts:

- `0` - Success (may include non-blocking warnings)
- `1` - Failure (critical error occurred)

Scripts that run multiple tasks may succeed overall even if some non-critical tasks fail (e.g., dependency warnings don't block startup).

## Future Enhancements

Potential additions to the script system:

- **Performance benchmarking** script for tracking build/test times
- **Code quality** checks (linting, formatting validation)
- **Bundle size** analysis and tracking
- **Docker** environment support
- **Database migration** runner (if needed in future)
- **Automated PR creation** for dependency updates

## Contributing

When modifying scripts:

1. Maintain consistent style and error handling
2. Use the established logging functions
3. Test in clean environments
4. Update this README
5. Update `.github/copilot-instructions.md` if user-facing changes
6. Ensure scripts remain executable (`chmod +x`)

## License

These scripts are part of the Triplanetary project and are licensed under the Apache License 2.0.
