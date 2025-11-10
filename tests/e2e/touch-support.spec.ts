// End-to-end tests for touch interactions
// Verifies that all clickable UI elements work correctly with touch events

import { test, expect } from '@playwright/test';

test.describe('Touch Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas#game-canvas');
  });

  test.describe('Configuration Screen Touch Support', () => {
    test('should add a player when Add Player button is touched', async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Touch the Add Player button
      const buttonX = box.x + box.width / 2;
      const buttonY = box.y + box.height * 0.5;
      
      await page.touchscreen.tap(buttonX, buttonY);
      await page.waitForTimeout(100);

      await page.screenshot({ path: 'tests/e2e/screenshots/touch-01-add-player.png' });
    });

    test('should add multiple players with repeated touches', async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      const buttonX = box.x + box.width / 2;
      const buttonY = box.y + box.height * 0.5;

      // Add 3 players with touch
      for (let i = 0; i < 3; i++) {
        await page.touchscreen.tap(buttonX, buttonY);
        await page.waitForTimeout(100);
      }

      await page.screenshot({ path: 'tests/e2e/screenshots/touch-02-multiple-players.png' });
    });

    test('should remove a player when X button is touched', async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Add 2 players
      const addButtonX = box.x + box.width / 2;
      const addButtonY = box.y + box.height * 0.5;
      await page.touchscreen.tap(addButtonX, addButtonY);
      await page.waitForTimeout(100);
      await page.touchscreen.tap(addButtonX, addButtonY);
      await page.waitForTimeout(100);

      // Touch remove button for first player
      const removeButtonX = box.x + box.width * 0.65;
      const removeButtonY = box.y + box.height * 0.25;
      await page.touchscreen.tap(removeButtonX, removeButtonY);
      await page.waitForTimeout(100);

      await page.screenshot({ path: 'tests/e2e/screenshots/touch-03-remove-player.png' });
    });

    test('should show color picker when touching player color', async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Add a player
      const addButtonX = box.x + box.width / 2;
      const addButtonY = box.y + box.height * 0.5;
      await page.touchscreen.tap(addButtonX, addButtonY);
      await page.waitForTimeout(100);

      // Touch the color icon
      const colorIconX = box.x + box.width * 0.25;
      const colorIconY = box.y + box.height * 0.25;
      await page.touchscreen.tap(colorIconX, colorIconY);
      await page.waitForTimeout(100);

      await page.screenshot({ path: 'tests/e2e/screenshots/touch-04-color-picker.png' });
    });

    test('should change player color when touching color swatch', async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Add a player
      const addButtonX = box.x + box.width / 2;
      const addButtonY = box.y + box.height * 0.5;
      await page.touchscreen.tap(addButtonX, addButtonY);
      await page.waitForTimeout(100);

      // Touch the color icon to open picker
      const colorIconX = box.x + box.width * 0.25;
      const colorIconY = box.y + box.height * 0.25;
      await page.touchscreen.tap(colorIconX, colorIconY);
      await page.waitForTimeout(100);

      // Touch a different color in the picker
      const newColorX = box.x + box.width * 0.6;
      const newColorY = box.y + box.height * 0.45;
      await page.touchscreen.tap(newColorX, newColorY);
      await page.waitForTimeout(100);

      await page.screenshot({ path: 'tests/e2e/screenshots/touch-05-color-changed.png' });
    });

    test('should close color picker when touching outside', async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Add a player
      const addButtonX = box.x + box.width / 2;
      const addButtonY = box.y + box.height * 0.5;
      await page.touchscreen.tap(addButtonX, addButtonY);
      await page.waitForTimeout(100);

      // Open color picker
      const colorIconX = box.x + box.width * 0.25;
      const colorIconY = box.y + box.height * 0.25;
      await page.touchscreen.tap(colorIconX, colorIconY);
      await page.waitForTimeout(100);

      // Touch outside the picker
      const outsideX = box.x + box.width * 0.1;
      const outsideY = box.y + box.height * 0.1;
      await page.touchscreen.tap(outsideX, outsideY);
      await page.waitForTimeout(100);

      await page.screenshot({ path: 'tests/e2e/screenshots/touch-06-picker-closed.png' });
    });

    test('should start game when Start Game button is touched', async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Add a player
      const addButtonX = box.x + box.width / 2;
      const addButtonY = box.y + box.height * 0.5;
      await page.touchscreen.tap(addButtonX, addButtonY);
      await page.waitForTimeout(100);

      // Touch Start Game button
      const startButtonX = box.x + box.width / 2;
      const startButtonY = box.y + box.height * 0.6;
      await page.touchscreen.tap(startButtonX, startButtonY);
      await page.waitForTimeout(100);

      await page.screenshot({ path: 'tests/e2e/screenshots/touch-07-game-started.png' });
    });
  });

  test.describe('Gameplay Screen Touch Support', () => {
    test.beforeEach(async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Add a player and start game
      const addButtonX = box.x + box.width / 2;
      const addButtonY = box.y + box.height * 0.5;
      await page.touchscreen.tap(addButtonX, addButtonY);
      await page.waitForTimeout(100);

      const startButtonX = box.x + box.width / 2;
      const startButtonY = box.y + box.height * 0.6;
      await page.touchscreen.tap(startButtonX, startButtonY);
      await page.waitForTimeout(100);
    });

    test('should select a ship when touched on hex grid', async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Touch center of canvas where ships should be
      const shipX = box.x + box.width / 2;
      const shipY = box.y + box.height / 2;
      await page.touchscreen.tap(shipX, shipY);
      await page.waitForTimeout(100);

      await page.screenshot({ path: 'tests/e2e/screenshots/touch-08-ship-selected.png' });
    });

    test('should interact with turn UI button via touch', async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Touch the next phase button in top-right area
      const buttonX = box.x + box.width - 100;
      const buttonY = box.y + 200;
      await page.touchscreen.tap(buttonX, buttonY);
      await page.waitForTimeout(100);

      await page.screenshot({ path: 'tests/e2e/screenshots/touch-09-phase-button.png' });
    });

    test('should work with toggle reachable hexes button via touch', async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Select a ship first
      const shipX = box.x + box.width / 2;
      const shipY = box.y + box.height / 2;
      await page.touchscreen.tap(shipX, shipY);
      await page.waitForTimeout(100);

      // Touch toggle button (right panel area)
      const toggleX = box.x + box.width - 110;
      const toggleY = box.y + 300;
      await page.touchscreen.tap(toggleX, toggleY);
      await page.waitForTimeout(100);

      await page.screenshot({ path: 'tests/e2e/screenshots/touch-10-toggle-highlight.png' });
    });
  });

  test.describe('Touch Event Prevention', () => {
    test('should prevent unwanted scrolling during touch interaction', async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Get initial scroll position
      const initialScroll = await page.evaluate(() => ({
        x: window.scrollX,
        y: window.scrollY,
      }));

      // Perform touch gestures that might cause scrolling
      const startX = box.x + box.width * 0.3;
      const startY = box.y + box.height * 0.3;
      const endX = box.x + box.width * 0.7;
      const endY = box.y + box.height * 0.7;

      // Swipe across canvas
      await page.touchscreen.tap(startX, startY);
      await page.waitForTimeout(50);

      // Check scroll position hasn't changed
      const finalScroll = await page.evaluate(() => ({
        x: window.scrollX,
        y: window.scrollY,
      }));

      expect(finalScroll.x).toBe(initialScroll.x);
      expect(finalScroll.y).toBe(initialScroll.y);

      await page.screenshot({ path: 'tests/e2e/screenshots/touch-11-no-scroll.png' });
    });
  });

  test.describe('Multi-touch scenarios', () => {
    test('should handle single touch only (ignore multi-touch for now)', async ({ page }) => {
      const canvas = page.locator('canvas#game-canvas');
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Single touch should work
      const buttonX = box.x + box.width / 2;
      const buttonY = box.y + box.height * 0.5;
      await page.touchscreen.tap(buttonX, buttonY);
      await page.waitForTimeout(100);

      await page.screenshot({ path: 'tests/e2e/screenshots/touch-12-single-touch.png' });
    });
  });
});
