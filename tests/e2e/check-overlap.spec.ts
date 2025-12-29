import { test } from '@playwright/test';
import { gotoWithTestMode, setupGame } from './helpers';

test('capture different UI states to identify overlaps', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await gotoWithTestMode(page);
  await page.waitForTimeout(500);
  
  // Setup game with 4 players (more players = more UI elements)
  await setupGame(page, 4);
  await page.waitForTimeout(1000);
  
  // Capture Plot phase
  await page.screenshot({ path: '/tmp/01-plot-phase.png' });
  
  // Move to Ordnance phase
  await page.evaluate(() => window.testAPI.nextPhase());
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/02-ordnance-phase.png' });
  
  // Move to Movement phase
  await page.evaluate(() => window.testAPI.nextPhase());
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/03-movement-phase.png' });
  
  // Move to Combat phase
  await page.evaluate(() => window.testAPI.nextPhase());
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/04-combat-phase.png' });
  
  console.log('Screenshots saved to /tmp/');
});
