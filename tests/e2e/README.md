# E2E Test Automation Guide

## Overview

This directory contains end-to-end tests for the Triplanetary game using Playwright. The tests use a custom Test Automation API that enables precise interaction with the game canvas and game state.

## Test Automation API

The Test Automation API is automatically enabled when the game is loaded with the `?testMode=true` URL parameter. It exposes functions through `window.testAPI` that allow tests to:

1. Access and manipulate game state
2. Get screen coordinates for game elements (ships, hexes, buttons)
3. Programmatically interact with the game

### Enabling Test Mode

To enable the Test API, load the game with the test mode URL parameter:

```javascript
await page.goto('http://localhost:5173/?testMode');
// or
await page.goto('http://localhost:5173/?testMode=true');
```

Or use the helper function:

```javascript
import { gotoWithTestMode } from './helpers';
await gotoWithTestMode(page);
```

### Available Test API Functions

#### State Access
- `testAPI.getState()` - Returns the current Redux game state

#### Game Control
- `testAPI.addPlayer()` - Adds a player to the game
- `testAPI.startGame()` - Starts the game
- `testAPI.selectShip(shipId)` - Selects a ship by ID
- `testAPI.plotMove(shipId, velocity, thrustUsed)` - Plots a move for a ship
- `testAPI.clearPlot(shipId)` - Clears a plotted move for a ship
- `testAPI.nextPhase()` - Advances to the next game phase
- `testAPI.nextTurn()` - Advances to the next turn

#### Coordinate Helpers
- `testAPI.getShipScreenCoordinates(shipId)` - Returns `{x, y}` screen coordinates for a ship
- `testAPI.getHexScreenCoordinates(q, r)` - Returns `{x, y}` screen coordinates for a hex
- `testAPI.getButtonCoordinates(buttonName)` - Returns `{x, y, width, height}` for a UI button

#### Layout Information
- `testAPI.getHexLayout()` - Returns the current hex layout configuration
- `testAPI.getCanvasWidth()` - Returns the canvas width
- `testAPI.getCanvasHeight()` - Returns the canvas height

### Button Names

The following button names are supported by `getButtonCoordinates`:

- Configuration screen: `'addPlayer'`, `'startGame'`
- Gameplay screen: `'nextPhase'`, `'coast'`, `'undo'`, `'confirm'`, `'toggleHighlight'`

## Helper Functions

The `helpers.ts` file provides convenient wrapper functions for common test operations:

### Setup Helpers
```javascript
import { gotoWithTestMode, setupGame } from './helpers';

// Navigate to game with test mode
await gotoWithTestMode(page);

// Setup a game with 2 players
await setupGame(page, 2);
```

### Interaction Helpers
```javascript
import { clickShip, clickHex, clickButton } from './helpers';

// Click on a ship by ID
await clickShip(page, 'ship-1');

// Click on a hex at coordinates
await clickHex(page, 5, 3);

// Click on a button by name
await clickButton(page, 'coast');
```

### State Helpers
```javascript
import { getGameState, getFirstShip, getAllShips } from './helpers';

// Get current game state
const state = await getGameState(page);

// Get the first ship
const ship = await getFirstShip(page);

// Get all ships
const ships = await getAllShips(page);
```

## Example Test

Here's a complete example that demonstrates plotting a move for a ship:

```javascript
import { test, expect } from '@playwright/test';
import {
  gotoWithTestMode,
  setupGame,
  getFirstShip,
  clickShip,
  clickButton,
  getGameState,
} from './helpers';

test('should plot a move for a ship', async ({ page }) => {
  // Setup
  await gotoWithTestMode(page);
  await setupGame(page, 2);

  // Get and select a ship
  const ship = await getFirstShip(page);
  await clickShip(page, ship.id);

  // Plot a coasting move
  await clickButton(page, 'coast');

  // Verify the move was plotted
  const state = await getGameState(page);
  const plottedMove = state.plottedMoves.get(ship.id);
  expect(plottedMove).toBeTruthy();

  // Take a screenshot
  await page.screenshot({ path: 'tests/e2e/screenshots/plotted-move.png' });
});
```

## Running E2E Tests

Before running the tests, make sure Playwright browsers are installed:

```bash
npx playwright install chromium
```

Then run the tests:

```bash
npm run test:e2e
```

To run a specific test file:

```bash
npx playwright test tests/e2e/automated-plot-test.spec.ts
```

To run tests in headed mode (with browser visible):

```bash
npx playwright test --headed
```

## Screenshots

Tests can capture screenshots at any point using Playwright's screenshot API:

```javascript
await page.screenshot({ 
  path: 'tests/e2e/screenshots/my-screenshot.png',
  fullPage: false 
});
```

Screenshots are automatically captured on test failure.

## Troubleshooting

### Test API not available

If `testAPI` is undefined, make sure:
1. You're loading the page with `?testMode=true` parameter
2. You've waited for the canvas to load: `await page.waitForSelector('canvas#game-canvas')`
3. You've waited for initialization: `await page.waitForTimeout(200)`

### Canvas clicks not working

If canvas clicks aren't registering:
1. Use the coordinate helpers to get exact positions
2. Verify the element exists at the expected coordinates
3. Add a small delay after clicks: `await page.waitForTimeout(100)`

### Test timing issues

If tests are flaky:
1. Increase wait timeouts for state changes
2. Use `waitForCondition` helper for complex state checks
3. Add explicit waits after game actions
