const playwright = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Ensure screenshots directory exists
  const screenshotsDir = path.join(__dirname, 'tests', 'e2e', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  try {
    // Go to the app
    await page.goto('http://localhost:5173');
    await page.waitForSelector('canvas#game-canvas');
    
    // Screenshot 1: Initial state
    await page.screenshot({ path: path.join(screenshotsDir, '01-initial-state.png') });
    console.log('✓ Screenshot 1: Initial state');
    
    // Get canvas
    const canvas = page.locator('canvas#game-canvas');
    const box = await canvas.boundingBox();
    
    // Screenshot 2: Add one player
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.5);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotsDir, '02-one-player.png') });
    console.log('✓ Screenshot 2: One player added');
    
    // Screenshot 3: Add more players
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.5);
    await page.waitForTimeout(200);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.5);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotsDir, '03-multiple-players.png') });
    console.log('✓ Screenshot 3: Multiple players');
    
    // Screenshot 4: Open color picker
    await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.25);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotsDir, '04-color-picker.png') });
    console.log('✓ Screenshot 4: Color picker opened');
    
    // Screenshot 5: Close color picker
    await page.mouse.click(box.x + box.width * 0.1, box.y + box.height * 0.1);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotsDir, '05-picker-closed.png') });
    console.log('✓ Screenshot 5: Color picker closed');
    
    // Screenshot 6: Remove a player
    await page.mouse.click(box.x + box.width * 0.65, box.y + box.height * 0.25);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotsDir, '06-player-removed.png') });
    console.log('✓ Screenshot 6: Player removed');
    
    // Screenshot 7: Start game
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.6);
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(screenshotsDir, '07-gameplay-screen.png') });
    console.log('✓ Screenshot 7: Gameplay screen');
    
    console.log('\n✅ All screenshots captured successfully!');
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
})();
