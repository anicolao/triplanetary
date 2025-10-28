// E2E test for celestial body rendering

import { test, expect } from '@playwright/test';

test.describe('Celestial Body Rendering', () => {
  test('should display celestial bodies on the gameplay screen', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Add a player
    await page.locator('text=Add Player').click();
    
    // Wait a bit for the player to be added
    await page.waitForTimeout(500);

    // Start the game
    await page.locator('text=Start Game').click();
    
    // Wait for the gameplay screen to render
    await page.waitForTimeout(1000);

    // Take a screenshot of the gameplay screen with celestial bodies
    await page.screenshot({ path: 'tests/e2e/screenshots/celestial-bodies-gameplay.png' });

    // Verify the canvas is present
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
