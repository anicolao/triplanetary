import { test, expect } from '@playwright/test';
import { gotoWithTestMode, setupGame, getGameState } from './helpers';

test.describe('Pan and Zoom Feature', () => {
  test('should enable panning and zooming of the map', async ({ page }) => {
    // Setup game using test API
    await gotoWithTestMode(page);
    await setupGame(page, 2);
    
    // Verify we're in gameplay mode
    const state = await getGameState(page);
    expect(state.screen).toBe('gameplay');
    
    // Get canvas for coordinates
    const canvas = page.locator('canvas#game-canvas');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');
    
    // Take initial screenshot
    await page.screenshot({ path: '/tmp/01-initial-gameplay.png', fullPage: false });
    
    // Check initial viewport state
    const initialViewport = await page.evaluate(() => {
      return (window as any).testAPI.getState().viewport;
    });
    expect(initialViewport.manipulationEnabled).toBe(false);
    expect(initialViewport.zoom).toBe(1.0);
    
    // Click the Pan/Zoom Map button using test API
    await page.evaluate(() => {
      (window as any).testAPI.getState();
      // Dispatch the toggle action directly
      const store = (window as any).__REDUX_STORE__;
      if (store) {
        store.dispatch({ type: 'TOGGLE_MAP_MANIPULATION' });
      }
    });
    await page.waitForTimeout(500);
    
    // Take screenshot with toggle enabled
    await page.screenshot({ path: '/tmp/02-toggle-enabled.png', fullPage: false });
    
    // Verify manipulation is enabled
    const enabledViewport = await page.evaluate(() => {
      return (window as any).testAPI.getState().viewport;
    });
    expect(enabledViewport.manipulationEnabled).toBe(true);
    
    // Test mouse wheel zoom
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    for (let i = 0; i < 3; i++) {
      await page.mouse.wheel(0, -100); // Zoom in
      await page.waitForTimeout(100);
    }
    
    await page.screenshot({ path: '/tmp/03-zoomed-in.png', fullPage: false });
    
    // Verify zoom changed
    const zoomedViewport = await page.evaluate(() => {
      return (window as any).testAPI.getState().viewport;
    });
    expect(zoomedViewport.zoom).toBeGreaterThan(1.0);
    
    // Test panning with mouse drag
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 100, box.y + box.height / 2 - 100, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: '/tmp/04-panned.png', fullPage: false });
    
    // Verify pan changed
    const pannedViewport = await page.evaluate(() => {
      return (window as any).testAPI.getState().viewport;
    });
    expect(pannedViewport.offsetX).not.toBe(0);
    expect(pannedViewport.offsetY).not.toBe(0);
    
    // Reset viewport
    await page.evaluate(() => {
      const store = (window as any).__REDUX_STORE__;
      if (store) {
        store.dispatch({ type: 'RESET_VIEWPORT' });
      }
    });
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: '/tmp/05-reset.png', fullPage: false });
    
    // Verify reset
    const resetViewport = await page.evaluate(() => {
      return (window as any).testAPI.getState().viewport;
    });
    expect(resetViewport.zoom).toBe(1.0);
    expect(resetViewport.offsetX).toBe(0);
    expect(resetViewport.offsetY).toBe(0);
    
    // Toggle manipulation off
    await page.evaluate(() => {
      const store = (window as any).__REDUX_STORE__;
      if (store) {
        store.dispatch({ type: 'TOGGLE_MAP_MANIPULATION' });
      }
    });
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: '/tmp/06-locked.png', fullPage: false });
    
    // Verify manipulation is disabled
    const finalViewport = await page.evaluate(() => {
      return (window as any).testAPI.getState().viewport;
    });
    expect(finalViewport.manipulationEnabled).toBe(false);
  });
});
