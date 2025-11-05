// E2E test demonstrating automated click handling for plotting moves

import { test, expect } from '@playwright/test';
import {
  gotoWithTestMode,
  setupGame,
  getGameState,
  getFirstShip,
  clickShip,
  clickHex,
  selectShip,
  getShipCoordinates,
  getButtonCoordinates,
  clickButton,
} from './helpers';

test.describe('Automated Click Handling for Plot Phase', () => {
  test('should capture screenshot while plotting a move for selected ship', async ({ page }) => {
    // Navigate to the game with test mode enabled
    await gotoWithTestMode(page);

    // Setup game with 2 players
    await setupGame(page, 2);

    // Verify we're in the game
    const state = await getGameState(page);
    expect(state.screen).toBe('gameplay');
    expect(state.currentPhase).toBe('Plot');

    // Get the first ship
    const ship = await getFirstShip(page);
    expect(ship).toBeTruthy();
    console.log(`First ship: ${ship.id} at position (${ship.position.q}, ${ship.position.r})`);

    // Select the ship by clicking on it
    await clickShip(page, ship.id);

    // Wait a bit for UI to update
    await page.waitForTimeout(300);

    // Verify the ship is selected
    const stateAfterSelection = await getGameState(page);
    expect(stateAfterSelection.selectedShipId).toBe(ship.id);

    // Take screenshot with ship selected (showing reachable hexes)
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/plot-selected-ship.png',
      fullPage: false 
    });

    // Calculate a target hex to plot to (move in the direction of current velocity)
    const targetQ = ship.position.q + ship.velocity.q;
    const targetR = ship.position.r + ship.velocity.r;

    console.log(`Plotting move to hex (${targetQ}, ${targetR})`);

    // Click on a hex to plot the move (coasting - same velocity)
    await clickHex(page, targetQ, targetR);

    // Wait for plot to be processed
    await page.waitForTimeout(300);

    // Verify the move was plotted
    const stateAfterPlot = await getGameState(page);
    expect(stateAfterPlot.plottedMoves).toBeTruthy();
    const plottedMove = stateAfterPlot.plottedMoves.get(ship.id);
    expect(plottedMove).toBeTruthy();
    console.log(`Plotted move: velocity (${plottedMove.newVelocity.q}, ${plottedMove.newVelocity.r}), thrust used: ${plottedMove.thrustUsed}`);

    // Take screenshot with the plotted move showing
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/plot-move-plotted.png',
      fullPage: false 
    });

    // Verify the ship is still selected
    expect(stateAfterPlot.selectedShipId).toBe(ship.id);
  });

  test('should allow clicking UI buttons to interact with plot phase', async ({ page }) => {
    await gotoWithTestMode(page);
    await setupGame(page, 2);

    const ship = await getFirstShip(page);
    await clickShip(page, ship.id);
    await page.waitForTimeout(200);

    // Get button coordinates to verify they're available
    const coastButton = await getButtonCoordinates(page, 'coast');
    expect(coastButton).toBeTruthy();
    console.log(`Coast button at (${coastButton.x}, ${coastButton.y})`);

    const toggleButton = await getButtonCoordinates(page, 'toggleHighlight');
    expect(toggleButton).toBeTruthy();
    console.log(`Toggle highlight button at (${toggleButton.x}, ${toggleButton.y})`);

    // Click the coast button to plot a coasting move
    await clickButton(page, 'coast');
    await page.waitForTimeout(200);

    // Verify a move was plotted
    const state = await getGameState(page);
    expect(state.plottedMoves).toBeTruthy();
    const plottedMove = state.plottedMoves.get(ship.id);
    expect(plottedMove).toBeTruthy();
    
    // Verify it's a coast (velocity unchanged)
    expect(plottedMove.newVelocity.q).toBe(ship.velocity.q);
    expect(plottedMove.newVelocity.r).toBe(ship.velocity.r);
    expect(plottedMove.thrustUsed).toBe(0);

    await page.screenshot({ 
      path: 'tests/e2e/screenshots/plot-coast-move.png',
      fullPage: false 
    });
  });

  test('should demonstrate full plot workflow with screenshots', async ({ page }) => {
    await gotoWithTestMode(page);
    
    // Screenshot 1: Initial configuration screen
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/workflow-01-config.png',
      fullPage: false 
    });

    await setupGame(page, 2);

    // Screenshot 2: Game started in plot phase
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/workflow-02-plot-phase.png',
      fullPage: false 
    });

    const ship = await getFirstShip(page);
    
    // Screenshot 3: Ship selected
    await clickShip(page, ship.id);
    await page.waitForTimeout(300);
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/workflow-03-ship-selected.png',
      fullPage: false 
    });

    // Screenshot 4: Move plotted
    await clickButton(page, 'coast');
    await page.waitForTimeout(300);
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/workflow-04-move-plotted.png',
      fullPage: false 
    });

    // Deselect ship
    await selectShip(page, null);
    await page.waitForTimeout(200);

    // Plot remaining ships
    const state = await getGameState(page);
    const allShips = state.ships;
    
    for (let i = 1; i < allShips.length; i++) {
      const currentShip = allShips[i];
      if (!currentShip.destroyed) {
        await clickShip(page, currentShip.id);
        await page.waitForTimeout(200);
        await clickButton(page, 'coast');
        await page.waitForTimeout(200);
        await selectShip(page, null);
        await page.waitForTimeout(100);
      }
    }

    // Screenshot 5: All ships plotted
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/workflow-05-all-plotted.png',
      fullPage: false 
    });
  });
});
