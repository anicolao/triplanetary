# Triplanetary Startup Guide

This guide explains how to use the automated startup system for consistent initialization across Copilot sessions, CI/CD pipelines, and development environments.

## Quick Start

### For Copilot Sessions

```bash
./scripts/copilot-startup.sh
```

This single command performs complete initialization:
1. ✓ Verifies environment (Node.js 20+, npm, git, configs)
2. ✓ Checks dependencies for security issues and updates
3. ✓ Installs dependencies with `npm ci`
4. ✓ Builds project (TypeScript + Vite)
5. ✓ Installs Playwright browsers
6. ✓ Runs unit tests to validate baseline

**Expected time:** 1-2 minutes (first run may take longer due to browser downloads)

### For Local Development

```bash
# Clone repository
git clone https://github.com/anicolao/triplanetary.git
cd triplanetary

# Complete initialization
./scripts/copilot-startup.sh

# Install git hooks (optional but recommended)
./scripts/install-hooks.sh

# Start development server
npm run dev
```

## Script Reference

### Main Startup Script

**Command:** `./scripts/copilot-startup.sh`

**Purpose:** Complete automated initialization for Copilot sessions

**Output Example:**
```
╔═══════════════════════════════════════════════════════════════╗
║           Triplanetary Copilot Startup Script                 ║
║  Ensuring consistent initialization for Copilot sessions      ║
╚═══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1: Environment Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ Checking Node.js...
✓ Node.js is installed: v20.19.5
✓ Node.js version is 20 or higher (required)
...
```

**Exit Codes:**
- `0` - Success, ready for development
- `1` - Critical failure, review errors

---

### Environment Verification

**Command:** `./scripts/verify-environment.sh`

**Purpose:** Validates all required tools are installed and configured

**What it checks:**
- Node.js version ≥20
- npm availability
- git installation
- Git repository status
- Required config files
- Disk space

**Use when:**
- Troubleshooting startup issues
- Setting up new environment
- Validating CI/CD environment

---

### Dependency Check

**Command:** `./scripts/check-dependencies.sh`

**Purpose:** Security scanning and dependency update detection

**What it checks:**
- Security vulnerabilities (npm audit)
- Outdated packages (npm outdated)
- package-lock.json integrity
- Deprecated packages

**Output Example:**
```
ℹ Checking for security vulnerabilities...
✓ No security vulnerabilities found

ℹ Checking for outdated dependencies...
⚠ Outdated dependencies detected:
Package    Current  Wanted  Latest  Location
vite       7.1.11   7.2.2   7.2.2   node_modules/vite

⚠ Consider updating dependencies:
⚠   - Review changes: npm outdated
⚠   - Update non-breaking: npm update
```

**Use when:**
- Before adding dependencies
- Periodic maintenance (quarterly)
- After security alerts
- Before major releases

---

### Test Runner

**Command:** `./scripts/run-tests.sh [OPTIONS]`

**Purpose:** Unified test execution with multiple modes

**Options:**
```bash
--unit-only       # Run only unit tests (default)
--e2e-only        # Run only E2E tests
--all             # Run all tests (unit + E2E + user stories)
--user-stories    # Run user story tests
--quick           # Quick mode with minimal output
--help            # Show usage information
```

**Examples:**
```bash
# Quick unit test run
./scripts/run-tests.sh

# Full test suite
./scripts/run-tests.sh --all

# E2E tests only
./scripts/run-tests.sh --e2e-only

# Quick validation
./scripts/run-tests.sh --quick
```

**Use when:**
- Before committing changes
- During development iterations
- CI/CD pipeline execution
- Pre-deployment validation

---

## Common Workflows

### Daily Development

```bash
# Morning: validate environment
./scripts/verify-environment.sh

# Before starting work: run tests
./scripts/run-tests.sh --unit-only

# During work: make changes, iterate
npm run dev

# Before commit: full validation
./scripts/run-tests.sh --all

# Commit (pre-commit hook runs user stories automatically)
git commit -m "feat: add new feature"
```

### Periodic Maintenance

```bash
# Check for dependency updates (monthly/quarterly)
./scripts/check-dependencies.sh

# If updates available:
npm outdated                    # Review changes
npm update                      # Update non-breaking
# Or manually update package.json for major versions

# Validate changes
npm ci
npm run build
./scripts/run-tests.sh --all

# Commit updates
git commit -m "chore: update dependencies"
```

### Troubleshooting

```bash
# Environment issues?
./scripts/verify-environment.sh

# Dependency problems?
./scripts/check-dependencies.sh
npm audit
npm ls

# Test failures?
./scripts/run-tests.sh --unit-only
npm test -- --reporter=verbose

# Build issues?
npm ci
rm -rf node_modules package-lock.json
npm install
npm run build
```

### CI/CD Integration

See `.github/workflows/copilot-ci.yml` for examples. Three patterns:

**Pattern 1: Complete Automated Startup**
```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: '20'
  - run: ./scripts/copilot-startup.sh
```

**Pattern 2: Modular with Individual Steps**
```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
  - run: ./scripts/verify-environment.sh
  - run: ./scripts/check-dependencies.sh
  - run: npm ci && npm run build
  - run: ./scripts/run-tests.sh --all
```

**Pattern 3: Security-Focused**
```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
  - run: npm ci
  - run: ./scripts/check-dependencies.sh
  - run: npm audit
```

## Self-Maintenance

The system automatically detects infrastructure gaps and issues:

### Security Vulnerabilities

When `check-dependencies.sh` finds security issues:

```bash
# Review the report
./scripts/check-dependencies.sh

# Attempt automatic fixes
npm audit fix

# Manual fixes if needed
npm audit fix --force  # May introduce breaking changes

# Test thoroughly
./scripts/run-tests.sh --all

# Create PR
git checkout -b security/fix-vulnerabilities
git commit -m "security: fix dependency vulnerabilities"
git push origin security/fix-vulnerabilities
```

### Outdated Dependencies

When dependencies are outdated:

```bash
# Check what's outdated
npm outdated

# Non-breaking updates
npm update

# Major version updates (review changelogs first!)
# Edit package.json manually, then:
npm install

# Test everything
./scripts/run-tests.sh --all

# Create PR
git checkout -b upgrade/dependencies-$(date +%Y%m%d)
git commit -m "chore: update dependencies"
git push origin upgrade/dependencies-$(date +%Y%m%d)
```

### Tool Upgrades

When upgrading Node.js, npm, or other tools:

1. Update `scripts/verify-environment.sh` version checks
2. Test all scripts with new version
3. Update `.github/workflows/` Node.js versions
4. Update documentation
5. Create PR with upgrade notes

## Best Practices

### When to Run Startup Script

**Always run:**
- Start of Copilot session
- After cloning repository
- After major changes to build system
- When switching between branches with different dependencies

**Consider running:**
- After pulling changes from main
- After long periods of inactivity
- When encountering unexpected errors

### When to Run Individual Scripts

**verify-environment.sh:**
- Setting up new machine
- Troubleshooting startup failures
- Validating CI/CD environment

**check-dependencies.sh:**
- Before adding dependencies
- Quarterly maintenance
- After security alerts

**run-tests.sh:**
- Before every commit
- During development iterations
- Pre-deployment validation

### Performance Tips

**Quick validation during development:**
```bash
./scripts/run-tests.sh --unit-only --quick
```

**Skip Playwright install if already installed:**
```bash
# Check if installed
npx playwright --version

# If yes, skip Step 5 in copilot-startup.sh
# by commenting it out temporarily
```

**Use npm cache:**
```bash
# CI/CD: use setup-node with cache
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

## Extending the System

### Adding a New Check

Edit `scripts/verify-environment.sh`:

```bash
log_info "Checking my-tool..."
if command -v my-tool &> /dev/null; then
    MY_TOOL_VERSION=$(my-tool --version)
    log_success "my-tool is installed: $MY_TOOL_VERSION"
else
    log_error "my-tool is not installed"
    ALL_CHECKS_PASSED=false
fi
```

### Adding a New Test Suite

Edit `scripts/run-tests.sh`:

```bash
# In argument parsing
--my-tests)
    RUN_MY_TESTS=true
    ;;

# In execution
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

### Creating a Custom Workflow

```bash
#!/bin/bash
# scripts/my-workflow.sh

set -e

# Reuse existing scripts
./scripts/verify-environment.sh
./scripts/check-dependencies.sh

# Custom logic
echo "Running custom workflow..."
# ... your code here ...

exit 0
```

## FAQ

**Q: How long does startup take?**
A: 1-2 minutes typically. First run may take 3-4 minutes due to Playwright browser downloads.

**Q: Can I skip steps?**
A: Yes, but not recommended. For quick iteration, use `./scripts/run-tests.sh --unit-only` instead of full startup.

**Q: What if startup fails?**
A: Run individual scripts to identify the issue:
```bash
./scripts/verify-environment.sh    # Check prerequisites
./scripts/check-dependencies.sh    # Check dependencies
```

**Q: Should I run startup on every git pull?**
A: Not necessary unless dependencies changed. Check if `package-lock.json` was modified.

**Q: How do I update the scripts?**
A: Scripts are version-controlled. Pull latest changes, test in a clean environment, then commit updates.

**Q: Can I use these in Docker?**
A: Yes! Add to your Dockerfile:
```dockerfile
COPY scripts/ /app/scripts/
RUN chmod +x /app/scripts/*.sh
RUN /app/scripts/copilot-startup.sh
```

**Q: What about Windows?**
A: Scripts are bash-based. Use Git Bash, WSL, or create PowerShell equivalents.

## Support

For issues or questions:
1. Check script output for error messages
2. Run individual scripts to isolate problems
3. Review `scripts/README.md` for detailed documentation
4. Check `.github/copilot-instructions.md` for integration patterns
5. Create an issue in the repository with:
   - Output of failed script
   - Environment details (`node --version`, `npm --version`)
   - Steps to reproduce

## License

These scripts are part of the Triplanetary project and are licensed under the Apache License 2.0.
