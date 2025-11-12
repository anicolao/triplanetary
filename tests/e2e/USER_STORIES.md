# User Story E2E Testing System

## Overview

The user story testing system provides comprehensive end-to-end validation of gameplay workflows with automated screenshot capture and comparison. Each user story represents a complete user journey through the game, documenting and validating both functionality and visual appearance.

## Purpose

- **Regression Testing**: Detect unintended changes to gameplay and UI
- **Documentation**: Provide visual documentation of game features and workflows
- **Quality Assurance**: Ensure all gameplay modifications are thoroughly tested
- **Visual Validation**: Catch subtle UI and rendering issues that unit tests might miss

## Directory Structure

```
tests/e2e/user-stories/
├── basic-gameplay-flow/           # Example user story
│   ├── README.md                   # Story description and steps
│   ├── basic-gameplay-flow.spec.ts # Test implementation
│   ├── expected/                   # Baseline screenshots
│   │   ├── 01-initial-config.png
│   │   ├── 02-player-added.png
│   │   └── ...
│   └── actual/                     # Generated screenshots (gitignored)
│       ├── 01-initial-config.png
│       └── ...
├── ship-combat/                    # Another user story
│   ├── README.md
│   ├── ship-combat.spec.ts
│   ├── expected/
│   └── actual/
└── ...
```

## Creating a New User Story

### 1. Create Directory Structure

```bash
mkdir -p tests/e2e/user-stories/my-story/{expected,actual}
```

### 2. Write README.md

Document the user story with:
- **Description**: What workflow this story covers
- **Steps**: Each significant action and expected result
- **Screenshots**: Name and purpose of each screenshot
- **Success Criteria**: What constitutes a passing test

Example format:

```markdown
# User Story: My Feature

## Description
Brief description of what this user story tests.

## Steps

### Step 1: Initial Action
**Action:** What the user does
**Expected:** What should happen

![Step 1 Description](expected/01-step-name.png)

### Step 2: Next Action
**Action:** Next user action
**Expected:** Expected result

![Step 2 Description](expected/02-step-name.png)

## Success Criteria
- Specific criteria for success
- Visual elements that must be present
- State changes that must occur
```

### 3. Write Test Spec

Create `my-story.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import {
  gotoWithTestMode,
  getGameState,
  clickButton,
  // ... other helpers
} from '../../helpers';

const STORY_PATH = 'tests/e2e/user-stories/my-story';

test.describe('User Story: My Feature', () => {
  test('should complete the workflow', async ({ page }) => {
    // Step 1
    await gotoWithTestMode(page);
    await page.screenshot({ 
      path: `${STORY_PATH}/actual/01-step-name.png` 
    });
    
    // Verify state
    const state = await getGameState(page);
    expect(state.screen).toBe('configuration');
    
    // Step 2
    await clickButton(page, 'addPlayer');
    await page.waitForTimeout(200);
    await page.screenshot({ 
      path: `${STORY_PATH}/actual/02-next-step.png` 
    });
    
    // ... more steps
    
    console.log('✓ User Story: My Feature completed successfully');
  });
});
```

### 4. Run and Establish Baseline

```bash
# Run the test to generate screenshots
npm run test:e2e -- tests/e2e/user-stories/my-story

# Review the screenshots in actual/
# If they look correct, copy them to expected/
cp tests/e2e/user-stories/my-story/actual/*.png \
   tests/e2e/user-stories/my-story/expected/

# Commit the expected screenshots
git add tests/e2e/user-stories/my-story/expected/
git commit -m "Add baseline screenshots for my-story user story"
```

## Screenshot Best Practices

### Naming Convention
Use numbered prefixes for sequential steps:
- `01-initial-state.png`
- `02-action-performed.png`
- `03-result-shown.png`

### Timing
Add appropriate waits after actions:
```typescript
await clickButton(page, 'addPlayer');
await page.waitForTimeout(200); // Wait for UI to update
await page.screenshot({ path: '...' });
```

### What to Capture
- Initial states
- After each significant user action
- State transitions between phases
- Error states and validations
- Final results

### Consistency
- Use `fullPage: false` for consistent viewport captures
- Take screenshots at stable points (no animations in progress)
- Ensure test mode is enabled for reproducible state

### Embedding in README
- Embed screenshots using markdown image syntax: `![Description](expected/01-step.png)`
- Use descriptive alt text for each image
- Place the image immediately after the step's action and expected result

## Screenshot Comparison

The screenshot comparison system uses byte-by-byte comparison with configurable tolerance:

```typescript
import { compareScreenshots, validateUserStory } from '../../screenshot-compare';

// Compare individual screenshots
const result = compareScreenshots(
  'actual/01-step.png',
  'expected/01-step.png',
  0.001 // 0.1% tolerance
);

// Validate entire user story
const allMatch = validateUserStory('tests/e2e/user-stories/my-story');
```

### Tolerance Settings
- **0.0**: Exact match required (may be too strict)
- **0.001**: 0.1% difference allowed (recommended default)
- **0.01**: 1% difference allowed (for animations or timestamps)

## Pre-Commit Hook

The pre-commit hook automatically runs user story tests before each commit:

### Installation
```bash
./scripts/install-hooks.sh
```

### Behavior
- Runs all tests in `tests/e2e/user-stories/`
- Compares screenshots with baselines
- Blocks commit if tests fail or screenshots differ
- Allows commit on first run (no baseline yet)

### Skipping the Hook
When needed (e.g., work in progress):
```bash
git commit --no-verify
```

### Updating Baselines
When intentional changes affect screenshots:
```bash
# Run tests to generate new screenshots
npm run test:e2e -- tests/e2e/user-stories

# Review changes
# If correct, update baselines:
cp tests/e2e/user-stories/*/actual/*.png \
   tests/e2e/user-stories/*/expected/

# Commit updated baselines
git add tests/e2e/user-stories/*/expected/
git commit -m "Update user story baselines for [feature/fix]"
```

## Running User Story Tests

### All User Stories
```bash
npm run test:e2e -- tests/e2e/user-stories
```

### Specific Story
```bash
npm run test:e2e -- tests/e2e/user-stories/basic-gameplay-flow
```

### With Browser Visible
```bash
npm run test:e2e -- tests/e2e/user-stories --headed
```

### Debug Mode
```bash
npm run test:e2e -- tests/e2e/user-stories --debug
```

## Integration with Development Workflow

### When to Create User Stories
- **New Features**: Any new gameplay feature should have a user story
- **Major Changes**: Significant modifications to existing features
- **Bug Fixes**: Complex bugs that affected user workflows
- **UI Changes**: Any changes to user interface or interactions

### Required for Commits
Per project guidelines, every modification to gameplay **must** be tested in a user story test. This ensures:
- Feature completeness
- No regressions
- Visual consistency
- Documentation of changes

### Review Process
1. Implement feature
2. Create/update user story test
3. Generate screenshots
4. Review screenshots for correctness
5. Commit expected screenshots
6. Pre-commit hook validates
7. Submit for code review with visual evidence

## Troubleshooting

### Screenshots Don't Match
1. Run test locally to see actual screenshots
2. Compare actual vs expected visually
3. Check for timing issues (add waits)
4. Verify test mode is enabled
5. If change is intentional, update baseline

### First Run Issues
On first run, expected screenshots don't exist:
- Tests will pass with a warning
- Review actual screenshots
- Copy to expected/ if correct

### Flaky Tests
If screenshots vary between runs:
- Add longer waits after actions
- Disable animations during tests
- Use test API instead of clicking
- Increase comparison tolerance temporarily

### Hook Prevents Commit
If the pre-commit hook blocks your commit:
- Review test output for failures
- Fix issues or update baselines
- Use `--no-verify` only if necessary
- Never commit with failing user stories

## Maintenance

### Regular Tasks
- Review and update user stories when features change
- Keep baselines up-to-date with UI changes
- Remove obsolete user stories for deprecated features
- Add stories for new features before merging

### Best Practices
- Keep stories focused and atomic
- Document why screenshots changed in commits
- Review visual changes carefully
- Maintain good test coverage across all features

## Example User Stories

The repository includes these example user stories:
- `basic-gameplay-flow`: Complete game setup and turn cycle
- (More to be added as features are developed)

Refer to these examples when creating new user stories.

## Future Enhancements

Potential improvements to the system:
- Visual diff generation for failed comparisons
- Pixel-by-pixel comparison with highlighting
- Automatic baseline updates via CLI flag
- Integration with CI/CD for screenshot artifacts
- Parallel test execution for faster runs
