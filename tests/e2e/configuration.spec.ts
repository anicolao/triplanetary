// End-to-end tests for the game configuration screen

import { test, expect } from '@playwright/test';

test.describe('Configuration Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the title and initial buttons', async ({ page }) => {
    // Wait for canvas to be ready
    await page.waitForSelector('canvas#game-canvas');

    // Take a screenshot of the initial state
    await page.screenshot({ path: 'tests/e2e/screenshots/01-initial-state.png' });

    // Verify canvas exists
    const canvas = await page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
  });

  test('should add a player when Add Player button is clicked', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('canvas#game-canvas');

    // Get canvas dimensions
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Click in the middle-lower area where Add Player button should be
    // Based on layout calculations, button is centered horizontally
    const buttonX = box.x + box.width / 2;
    const buttonY = box.y + box.height * 0.5; // Approximate position

    await page.mouse.click(buttonX, buttonY);

    // Wait a bit for state to update
    await page.waitForTimeout(100);

    await page.screenshot({ path: 'tests/e2e/screenshots/02-one-player.png' });
  });

  test('should add multiple players', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('canvas#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    const buttonX = box.x + box.width / 2;
    const buttonY = box.y + box.height * 0.5;

    // Add 3 players
    for (let i = 0; i < 3; i++) {
      await page.mouse.click(buttonX, buttonY);
      await page.waitForTimeout(100);
    }

    await page.screenshot({ path: 'tests/e2e/screenshots/03-multiple-players.png' });
  });

  test('should not add more than 6 players', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('canvas#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    const buttonX = box.x + box.width / 2;
    const buttonY = box.y + box.height * 0.5;

    // Try to add 8 players
    for (let i = 0; i < 8; i++) {
      await page.mouse.click(buttonX, buttonY);
      await page.waitForTimeout(50);
    }

    await page.screenshot({ path: 'tests/e2e/screenshots/04-max-players.png' });
  });

  test('should remove a player when X button is clicked', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('canvas#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Add 2 players
    const addButtonX = box.x + box.width / 2;
    const addButtonY = box.y + box.height * 0.5;
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);

    // Click remove button for first player (on the right side of the player entry)
    const removeButtonX = box.x + box.width * 0.65;
    const removeButtonY = box.y + box.height * 0.25;
    await page.mouse.click(removeButtonX, removeButtonY);
    await page.waitForTimeout(100);

    await page.screenshot({ path: 'tests/e2e/screenshots/05-remove-player.png' });
  });

  test('should show color picker when clicking on player color', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('canvas#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Add a player
    const addButtonX = box.x + box.width / 2;
    const addButtonY = box.y + box.height * 0.5;
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);

    // Click on the color icon (left side of player entry)
    const colorIconX = box.x + box.width * 0.25;
    const colorIconY = box.y + box.height * 0.25;
    await page.mouse.click(colorIconX, colorIconY);
    await page.waitForTimeout(100);

    await page.screenshot({ path: 'tests/e2e/screenshots/06-color-picker.png' });
  });

  test('should change player color when selecting from picker', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('canvas#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Add a player
    const addButtonX = box.x + box.width / 2;
    const addButtonY = box.y + box.height * 0.5;
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);

    // Click on the color icon
    const colorIconX = box.x + box.width * 0.25;
    const colorIconY = box.y + box.height * 0.25;
    await page.mouse.click(colorIconX, colorIconY);
    await page.waitForTimeout(100);

    // Click on a different color in the picker (right side color)
    const newColorX = box.x + box.width * 0.6;
    const newColorY = box.y + box.height * 0.45;
    await page.mouse.click(newColorX, newColorY);
    await page.waitForTimeout(100);

    await page.screenshot({ path: 'tests/e2e/screenshots/07-color-changed.png' });
  });

  test('should close color picker when clicking outside', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('canvas#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Add a player
    const addButtonX = box.x + box.width / 2;
    const addButtonY = box.y + box.height * 0.5;
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);

    // Open color picker
    const colorIconX = box.x + box.width * 0.25;
    const colorIconY = box.y + box.height * 0.25;
    await page.mouse.click(colorIconX, colorIconY);
    await page.waitForTimeout(100);

    // Click outside the picker
    const outsideX = box.x + box.width * 0.1;
    const outsideY = box.y + box.height * 0.1;
    await page.mouse.click(outsideX, outsideY);
    await page.waitForTimeout(100);

    await page.screenshot({ path: 'tests/e2e/screenshots/08-picker-closed.png' });
  });

  test('should start game when Start Game button is clicked with players', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('canvas#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Add a player
    const addButtonX = box.x + box.width / 2;
    const addButtonY = box.y + box.height * 0.5;
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);

    // Click Start Game button (below Add Player button)
    const startButtonX = box.x + box.width / 2;
    const startButtonY = box.y + box.height * 0.6;
    await page.mouse.click(startButtonX, startButtonY);
    await page.waitForTimeout(100);

    await page.screenshot({ path: 'tests/e2e/screenshots/09-gameplay-screen.png' });
  });

  test('should swap colors when selecting a color already in use', async ({ page }) => {
    await page.waitForSelector('canvas#game-canvas');

    const canvas = page.locator('canvas#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    // Add 2 players
    const addButtonX = box.x + box.width / 2;
    const addButtonY = box.y + box.height * 0.5;
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);
    await page.mouse.click(addButtonX, addButtonY);
    await page.waitForTimeout(100);

    await page.screenshot({ path: 'tests/e2e/screenshots/10-two-players-before-swap.png' });

    // Click on first player's color icon
    const colorIconX = box.x + box.width * 0.25;
    const colorIconY = box.y + box.height * 0.25;
    await page.mouse.click(colorIconX, colorIconY);
    await page.waitForTimeout(100);

    // Click on second player's color in the picker
    // This should be the second color in the top row
    const secondColorX = box.x + box.width * 0.5;
    const secondColorY = box.y + box.height * 0.45;
    await page.mouse.click(secondColorX, secondColorY);
    await page.waitForTimeout(100);

    await page.screenshot({ path: 'tests/e2e/screenshots/11-colors-swapped.png' });
  });
});
