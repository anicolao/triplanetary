// Helper functions for E2E tests using the test API

import { Page } from '@playwright/test';

// Type definitions for the test API
interface TestAPI {
  getState: () => GameState;
  addPlayer: () => void;
  startGame: () => void;
  selectShip: (shipId: string | null) => void;
  plotMove: (shipId: string, velocity: { q: number; r: number }, thrustUsed: number) => void;
  clearPlot: (shipId: string) => void;
  nextPhase: () => void;
  nextTurn: () => void;
  getShipScreenCoordinates: (shipId: string) => { x: number; y: number } | null;
  getHexScreenCoordinates: (q: number, r: number) => { x: number; y: number };
  getButtonCoordinates: (buttonName: string) => { x: number; y: number; width: number; height: number } | null;
  getHexLayout: () => HexLayout;
  getCanvasWidth: () => number;
  getCanvasHeight: () => number;
}

// Minimal type definitions needed for tests
interface GameState {
  screen: string;
  currentPhase: string;
  selectedShipId: string | null;
  roundNumber: number;
  players: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  ships: Array<{
    id: string;
    position: { q: number; r: number };
    velocity: { q: number; r: number };
    destroyed?: boolean;
  }>;
  plottedMoves: Record<string, {
    newVelocity: { q: number; r: number };
    thrustUsed: number;
  }>;
}

interface HexLayout {
  size: number;
  origin: { x: number; y: number };
  orientation: string;
}

// Extend Window interface to include testAPI
declare global {
  interface Window {
    testAPI: TestAPI;
  }
}

/**
 * Navigate to the game page with test mode enabled
 */
export async function gotoWithTestMode(page: Page, baseURL: string = 'http://localhost:5173') {
  await page.goto(`${baseURL}/?testMode=true`);
  await page.waitForSelector('canvas#game-canvas');
  // Wait a bit for the test API to be initialized
  await page.waitForTimeout(200);
}

/**
 * Get the test API from the page
 */
export async function getTestAPI(page: Page) {
  return await page.evaluate(() => window.testAPI);
}

/**
 * Setup a game with players and start it
 */
export async function setupGame(page: Page, numPlayers: number = 2) {
  await page.evaluate((count) => {
    for (let i = 0; i < count; i++) {
      window.testAPI.addPlayer();
    }
    window.testAPI.startGame();
  }, numPlayers);
  // Wait for game to start
  await page.waitForTimeout(300);
}

/**
 * Get screen coordinates for a ship by ID
 */
export async function getShipCoordinates(page: Page, shipId: string) {
  return await page.evaluate((id) => {
    return window.testAPI.getShipScreenCoordinates(id);
  }, shipId);
}

/**
 * Get screen coordinates for a hex
 */
export async function getHexCoordinates(page: Page, q: number, r: number) {
  return await page.evaluate(({ q, r }) => {
    return window.testAPI.getHexScreenCoordinates(q, r);
  }, { q, r });
}

/**
 * Get button coordinates by name
 */
export async function getButtonCoordinates(page: Page, buttonName: string) {
  return await page.evaluate((name) => {
    return window.testAPI.getButtonCoordinates(name);
  }, buttonName);
}

/**
 * Select a ship by ID
 */
export async function selectShip(page: Page, shipId: string | null) {
  await page.evaluate((id) => {
    window.testAPI.selectShip(id);
  }, shipId);
  await page.waitForTimeout(100);
}

/**
 * Get the current game state
 */
export async function getGameState(page: Page) {
  return await page.evaluate(() => {
    return window.testAPI.getState();
  });
}

/**
 * Click on canvas at specific screen coordinates
 */
export async function clickCanvasAt(page: Page, x: number, y: number) {
  const canvas = page.locator('canvas#game-canvas');
  await canvas.click({ position: { x, y } });
  await page.waitForTimeout(100);
}

/**
 * Click on a ship by ID
 */
export async function clickShip(page: Page, shipId: string) {
  const coords = await getShipCoordinates(page, shipId);
  if (!coords) {
    throw new Error(`Ship ${shipId} not found`);
  }
  await clickCanvasAt(page, coords.x, coords.y);
}

/**
 * Click on a hex at specific coordinates
 */
export async function clickHex(page: Page, q: number, r: number) {
  const coords = await getHexCoordinates(page, q, r);
  await clickCanvasAt(page, coords.x, coords.y);
}

/**
 * Click on a button by name
 */
export async function clickButton(page: Page, buttonName: string) {
  const coords = await getButtonCoordinates(page, buttonName);
  if (!coords) {
    throw new Error(`Button ${buttonName} not found`);
  }
  // Click at center of button
  await clickCanvasAt(page, coords.x + coords.width / 2, coords.y + coords.height / 2);
}

/**
 * Get all ships from the current state
 */
export async function getAllShips(page: Page) {
  const state = await getGameState(page);
  return state.ships;
}

/**
 * Get the first player's first ship
 */
export async function getFirstShip(page: Page) {
  const ships = await getAllShips(page);
  return ships.length > 0 ? ships[0] : null;
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  page: Page,
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await page.waitForTimeout(interval);
  }
  throw new Error('Condition not met within timeout');
}
