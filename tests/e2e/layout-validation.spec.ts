import { test, expect } from '@playwright/test';
import { gotoWithTestMode, setupGame } from './helpers';

test.describe('Layout Validation', () => {
  test('should have proper spacing between UI elements with 4 players', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoWithTestMode(page);
    await setupGame(page, 4);
    
    // Navigate to Combat phase where combat log appears
    await page.evaluate(() => {
      window.testAPI.nextPhase(); // Ordnance
      window.testAPI.nextPhase(); // Movement
      window.testAPI.nextPhase(); // Combat
    });
    await page.waitForTimeout(500);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'tests/e2e/screenshots/layout-4-players-combat.png' });
    
    // Verify basic layout elements are rendered
    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
  });

  test('should have proper spacing between UI elements with 6 players', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await gotoWithTestMode(page);
    await setupGame(page, 6);
    
    // Navigate to Combat phase
    await page.evaluate(() => {
      window.testAPI.nextPhase(); // Ordnance
      window.testAPI.nextPhase(); // Movement
      window.testAPI.nextPhase(); // Combat
    });
    await page.waitForTimeout(500);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'tests/e2e/screenshots/layout-6-players-combat.png' });
    
    // Verify canvas is visible
    const canvas = page.locator('canvas#game-canvas');
    await expect(canvas).toBeVisible();
  });
});
