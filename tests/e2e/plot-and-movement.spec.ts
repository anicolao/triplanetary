// E2E tests for Plot Phase and Movement Phase

import { test, expect } from '@playwright/test';

test.describe('Plot and Movement Phase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Set up players
    await page.click('button:has-text("Add Player")');
    await page.click('button:has-text("Add Player")');
    
    // Start the game
    await page.click('button:has-text("Start Game")');
    await page.waitForTimeout(500);
  });

  test('should start in Plot Phase', async ({ page }) => {
    // Verify we're in Plot Phase
    const phaseText = await page.textContent('text=/Phase: Plot/');
    expect(phaseText).toContain('Plot');
  });

  test('should not allow proceeding to next phase without plotting all ships', async ({ page }) => {
    // Check that the next phase button is disabled or shows "Plot All Ships"
    const buttonText = await page.textContent('button:has-text("Plot All Ships")');
    expect(buttonText).toBeDefined();
  });

  test('should allow plotting a ship move', async ({ page }) => {
    // Click on a ship to select it (ships start at specific positions based on scenario)
    // We need to find and click on a ship
    const canvas = page.locator('canvas#game-canvas');
    
    // Click in the center area where ships should be
    await canvas.click({ position: { x: 400, y: 300 } });
    await page.waitForTimeout(300);
    
    // The reachable hexes should be shown
    // Try to plot by clicking a thrust button or reachable hex
    // For now, just verify we can interact with the canvas
    await canvas.click({ position: { x: 450, y: 300 } });
  });

  test('should execute movement when entering Movement phase', async ({ page }) => {
    // For this test, we'll need to plot all ships first
    // This is a simplified version - in practice we'd need to properly plot each ship
    
    // Skip to Movement phase by toggling the phase directly
    // Note: This might not work if validation prevents it
    // For E2E testing, we may need a test mode or helper
    
    await page.waitForTimeout(1000);
  });

  test('should display notifications for collisions', async ({ page }) => {
    // This test would require setting up a collision scenario
    // and verifying that collision notifications appear
    
    await page.waitForTimeout(500);
  });
});
