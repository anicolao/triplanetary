const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/usr/bin/chromium-browser'
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(500);
  
  console.log('Taking screenshots...');
  
  // Initial state
  await page.screenshot({ path: '/tmp/01-initial.png' });
  
  // Click Add Player (center of screen, middle area)
  await page.mouse.click(640, 350);
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/02-one-player.png' });
  
  // Add second player
  await page.mouse.click(640, 400);
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/03-two-players.png' });
  
  // Add third player
  await page.mouse.click(640, 450);
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/04-three-players.png' });
  
  // Click on first player color icon (left side)
  await page.mouse.click(380, 240);
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/05-color-picker.png' });
  
  // Click outside to close
  await page.mouse.click(100, 100);
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/06-picker-closed.png' });
  
  // Click remove button on second player
  await page.mouse.click(800, 280);
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/07-player-removed.png' });
  
  // Click Start Game
  await page.mouse.click(640, 500);
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/08-gameplay-screen.png' });
  
  console.log('All screenshots saved to /tmp/');
  await browser.close();
})();
