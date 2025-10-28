// E2E test for celestial body rendering

import { test, expect } from '@playwright/test';

test.describe('Celestial Body Rendering', () => {
  test('should display celestial bodies on the gameplay screen', async ({ page }) => {
    // Navigate to the app (baseURL is configured in playwright.config.ts)
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Add a player by clicking the Add Player button
    const addPlayerButton = page.locator('text=Add Player');
    await addPlayerButton.waitFor({ state: 'visible' });
    await addPlayerButton.click();
    
    // Wait for the Start Game button to become enabled (indicates player was added)
    const startGameButton = page.locator('text=Start Game');
    await startGameButton.waitFor({ state: 'visible' });

    // Start the game
    await startGameButton.click();
    
    // Wait for the canvas to be present (gameplay screen)
    const canvas = page.locator('canvas');
    await canvas.waitFor({ state: 'visible' });
    
    // Give a moment for rendering to complete
    await page.waitForTimeout(500);

    // Take a screenshot of the gameplay screen with celestial bodies
    await page.screenshot({ path: 'tests/e2e/screenshots/celestial-bodies-gameplay.png' });

    // Verify the canvas is present
    await expect(canvas).toBeVisible();
  });
});
