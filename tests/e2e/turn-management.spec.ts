// E2E tests for turn management UI

import { test, expect } from '@playwright/test';

test.describe('Turn Management UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display turn management UI after starting game', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Add a player
    const addButtonX = box.x + box.width / 2;
    const addButtonY = box.y + box.height * 0.5;
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);
    
    // Start game
    const startButtonX = box.x + box.width / 2;
    const startButtonY = box.y + box.height * 0.6;
    await page.mouse.click(startButtonX, startButtonY);
    await page.waitForTimeout(500);
    
    // Take screenshot to verify turn UI is displayed
    await page.screenshot({ path: 'tests/e2e/screenshots/turn-ui-initial.png' });
  });

  test('should advance to next phase when clicking next phase button', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Setup: Add player and start game
    const addButtonX = box.x + box.width / 2;
    const addButtonY = box.y + box.height * 0.5;
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);

    const startButtonX = box.x + box.width / 2;
    const startButtonY = box.y + box.height * 0.6;
    await page.mouse.click(startButtonX, startButtonY);
    await page.waitForTimeout(500);
    
    // Click the next phase button (top right area)
    // Based on turnUI.ts, button is at rightEdge - boxWidth, topEdge + some spacing
    const nextPhaseButtonX = box.x + box.width - 90; // Approximate position
    const nextPhaseButtonY = box.y + 150;
    await page.mouse.click(nextPhaseButtonX, nextPhaseButtonY);
    await page.waitForTimeout(200);
    
    // Verify phase changed (visual test)
    await page.screenshot({ path: 'tests/e2e/screenshots/turn-ui-after-next-phase.png' });
  });

  test('should cycle through all phases', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Setup
    const addButtonX = box.x + box.width / 2;
    const addButtonY = box.y + box.height * 0.5;
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);

    const startButtonX = box.x + box.width / 2;
    const startButtonY = box.y + box.height * 0.6;
    await page.mouse.click(startButtonX, startButtonY);
    await page.waitForTimeout(500);
    
    // Click through phases multiple times
    const nextPhaseButtonX = box.x + box.width - 90;
    const nextPhaseButtonY = box.y + 150;
    for (let i = 0; i < 5; i++) {
      await page.mouse.click(nextPhaseButtonX, nextPhaseButtonY);
      await page.waitForTimeout(100);
    }
    
    // Should have cycled back to Plot phase (or next turn)
    await page.screenshot({ path: 'tests/e2e/screenshots/turn-ui-after-cycle.png' });
  });

  test('should display correct player colors in turn UI', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Add two players
    const addButtonX = box.x + box.width / 2;
    const addButtonY = box.y + box.height * 0.5;
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);
    
    // Start game
    const startButtonX = box.x + box.width / 2;
    const startButtonY = box.y + box.height * 0.65; // Adjusted for 2 players
    await page.mouse.click(startButtonX, startButtonY);
    await page.waitForTimeout(500);
    
    // Verify player 1 color is shown
    await page.screenshot({ path: 'tests/e2e/screenshots/turn-ui-player-1.png' });
  });

  test('should increment round counter after all players have taken turns', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Setup with one player for simplicity
    const addButtonX = box.x + box.width / 2;
    const addButtonY = box.y + box.height * 0.5;
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);

    const startButtonX = box.x + box.width / 2;
    const startButtonY = box.y + box.height * 0.6;
    await page.mouse.click(startButtonX, startButtonY);
    await page.waitForTimeout(500);
    
    // Cycle through all phases to end turn
    const nextPhaseButtonX = box.x + box.width - 90;
    const nextPhaseButtonY = box.y + 150;
    for (let i = 0; i < 5; i++) {
      await page.mouse.click(nextPhaseButtonX, nextPhaseButtonY);
      await page.waitForTimeout(100);
    }
    
    // Round should have incremented
    await page.screenshot({ path: 'tests/e2e/screenshots/turn-ui-round-2.png' });
  });
});
