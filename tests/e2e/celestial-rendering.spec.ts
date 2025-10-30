// E2E test for celestial body rendering

import { test, expect } from '@playwright/test';

test.describe('Celestial Body Rendering', () => {
  test('should display celestial bodies on the gameplay screen', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for canvas to be ready
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();

    // Get canvas dimensions
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Add a player by clicking the Add Player button (centered horizontally, middle of screen)
    const addButtonX = box.x + box.width / 2;
    const addButtonY = box.y + box.height * 0.5;
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);

    // Click Start Game button (below Add Player button)
    const startButtonX = box.x + box.width / 2;
    const startButtonY = box.y + box.height * 0.6;
    await page.mouse.click(startButtonX, startButtonY);
    
    // Give a moment for rendering to complete
    await page.waitForTimeout(500);

    // Take a screenshot of the gameplay screen with celestial bodies
    await page.screenshot({ path: 'tests/e2e/screenshots/celestial-bodies-gameplay.png' });

    // Verify the canvas is still present
    await expect(canvas).toBeVisible();
  });
});
