// E2E tests for turn management UI

import { test, expect } from '@playwright/test';

test.describe('Turn Management UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display turn management UI after starting game', async ({ page }) => {
    // Add a player
    const canvas = page.locator('#game-canvas');
    await canvas.click({ position: { x: 640, y: 250 } });
    
    // Start game
    await canvas.click({ position: { x: 640, y: 350 } });
    
    // Wait for gameplay screen to load
    await page.waitForTimeout(500);
    
    // Take screenshot to verify turn UI is displayed
    await expect(page).toHaveScreenshot('turn-ui-initial.png', {
      maxDiffPixels: 100,
    });
  });

  test('should advance to next phase when clicking next phase button', async ({ page }) => {
    // Setup: Add player and start game
    const canvas = page.locator('#game-canvas');
    await canvas.click({ position: { x: 640, y: 250 } });
    await canvas.click({ position: { x: 640, y: 350 } });
    await page.waitForTimeout(500);
    
    // Click the next phase button (top right area)
    await canvas.click({ position: { x: 1180, y: 150 } });
    await page.waitForTimeout(200);
    
    // Verify phase changed (visual test)
    await expect(page).toHaveScreenshot('turn-ui-after-next-phase.png', {
      maxDiffPixels: 100,
    });
  });

  test('should cycle through all phases', async ({ page }) => {
    // Setup
    const canvas = page.locator('#game-canvas');
    await canvas.click({ position: { x: 640, y: 250 } });
    await canvas.click({ position: { x: 640, y: 350 } });
    await page.waitForTimeout(500);
    
    // Click through phases multiple times
    for (let i = 0; i < 5; i++) {
      await canvas.click({ position: { x: 1180, y: 150 } });
      await page.waitForTimeout(100);
    }
    
    // Should have cycled back to Plot phase (or next turn)
    await expect(page).toHaveScreenshot('turn-ui-after-cycle.png', {
      maxDiffPixels: 100,
    });
  });

  test('should display correct player colors in turn UI', async ({ page }) => {
    // Add two players with different colors
    const canvas = page.locator('#game-canvas');
    await canvas.click({ position: { x: 640, y: 250 } }); // Add player 1
    await canvas.click({ position: { x: 640, y: 330 } }); // Add player 2
    
    // Start game
    await canvas.click({ position: { x: 640, y: 420 } });
    await page.waitForTimeout(500);
    
    // Verify player 1 color is shown
    await expect(page).toHaveScreenshot('turn-ui-player-1.png', {
      maxDiffPixels: 100,
    });
  });

  test('should increment round counter after all players have taken turns', async ({ page }) => {
    // Setup with one player for simplicity
    const canvas = page.locator('#game-canvas');
    await canvas.click({ position: { x: 640, y: 250 } });
    await canvas.click({ position: { x: 640, y: 350 } });
    await page.waitForTimeout(500);
    
    // Cycle through all phases to end turn
    for (let i = 0; i < 5; i++) {
      await canvas.click({ position: { x: 1180, y: 150 } });
      await page.waitForTimeout(100);
    }
    
    // Round should have incremented
    await expect(page).toHaveScreenshot('turn-ui-round-2.png', {
      maxDiffPixels: 100,
    });
  });
});
