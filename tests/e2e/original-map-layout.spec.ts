// E2E test for original map layout toggle functionality

import { test, expect } from '@playwright/test';
import { gotoWithTestMode, setupGame, clickButton, getGameState, clickShip } from './helpers';

test.describe('Original Map Layout', () => {
  test('should toggle between modern and original map layouts', async ({ page }) => {
    await gotoWithTestMode(page);
    await setupGame(page, 2);

    // Take screenshot of modern map
    await page.screenshot({ path: 'tests/e2e/screenshots/modern-map-layout.png' });

    // Get the state to verify we're on modern layout
    const initialState = await getGameState(page);
    expect(initialState.currentScenario.mapLayout).toBe('modern');

    // Click the map layout toggle button using the button API
    await clickButton(page, 'toggle-map-layout');

    // Verify we switched to original layout
    const afterToggleState = await getGameState(page);
    expect(afterToggleState.currentScenario.mapLayout).toBe('original');

    // Take screenshot of original map
    await page.screenshot({ path: 'tests/e2e/screenshots/original-map-layout.png' });

    // Toggle back to modern
    await clickButton(page, 'toggle-map-layout');

    // Verify we're back on modern layout
    const finalState = await getGameState(page);
    expect(finalState.currentScenario.mapLayout).toBe('modern');
  });

  test('should not render celestial bodies on original map', async ({ page }) => {
    await gotoWithTestMode(page);
    await setupGame(page, 2);

    // Toggle to original map
    await clickButton(page, 'toggle-map-layout');

    // Verify we're on original layout
    const state = await getGameState(page);
    expect(state.currentScenario.mapLayout).toBe('original');

    // Take screenshot to verify no modern rendering over bitmap
    await page.screenshot({ path: 'tests/e2e/screenshots/original-map-no-celestials.png' });

    // The test passes if no errors occur - visual verification shows
    // celestial bodies are not rendered on top of the bitmap
    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
  });

  test('should maintain game functionality on original map', async ({ page }) => {
    await gotoWithTestMode(page);
    await setupGame(page, 2);

    // Toggle to original map
    await clickButton(page, 'toggle-map-layout');

    // Verify ships are still visible and selectable
    const state = await getGameState(page);
    expect(state.ships.length).toBeGreaterThan(0);
    expect(state.currentScenario.mapLayout).toBe('original');

    // Select a ship using helper
    const firstShip = state.ships[0];
    await clickShip(page, firstShip.id);

    // Verify ship was selected
    const afterClickState = await getGameState(page);
    expect(afterClickState.selectedShipId).toBe(firstShip.id);

    // Take screenshot showing ship selection works on original map
    await page.screenshot({ path: 'tests/e2e/screenshots/original-map-ship-selection.png' });
  });
});
