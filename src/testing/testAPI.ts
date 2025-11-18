// Test automation API for E2E testing
// This module exposes functions to the window object for test automation

import { store } from '../redux/store';
import { GameState } from '../redux/types';
import { Renderer } from '../rendering/renderer';
import { InputHandler } from '../input/inputHandler';
import { hexToPixel } from '../hex/operations';
import { HexLayout } from '../hex/types';
import {
  addPlayer,
  startGame,
  selectShip,
  plotShipMove,
  clearPlot,
  nextPhase,
  nextTurn,
} from '../redux/actions';

export interface TestAPI {
  // State access
  getState: () => GameState;
  
  // Game control
  addPlayer: () => void;
  startGame: () => void;
  selectShip: (shipId: string | null) => void;
  plotMove: (shipId: string, velocity: { q: number; r: number }, thrustUsed: number) => void;
  clearPlot: (shipId: string) => void;
  nextPhase: () => void;
  nextTurn: () => void;
  
  // Coordinate helpers
  getShipScreenCoordinates: (shipId: string) => { x: number; y: number } | null;
  getHexScreenCoordinates: (q: number, r: number) => { x: number; y: number };
  getButtonCoordinates: (buttonName: string) => { x: number; y: number; width: number; height: number } | null;
  
  // Hex layout
  getHexLayout: () => HexLayout;
  
  // Canvas dimensions
  getCanvasWidth: () => number;
  getCanvasHeight: () => number;
}

let rendererInstance: Renderer | null = null;
let inputHandlerInstance: InputHandler | null = null;

export function initializeTestAPI(renderer: Renderer, inputHandler: InputHandler): void {
  rendererInstance = renderer;
  inputHandlerInstance = inputHandler;
  
  // Only expose API if we're in test mode
  if (isTestMode()) {
    const api: TestAPI = {
      getState: () => store.getState(),
      
      addPlayer: () => store.dispatch(addPlayer()),
      startGame: () => store.dispatch(startGame()),
      selectShip: (shipId: string | null) => store.dispatch(selectShip(shipId)),
      plotMove: (shipId: string, velocity: { q: number; r: number }, thrustUsed: number) => {
        store.dispatch(plotShipMove(shipId, velocity, thrustUsed));
      },
      clearPlot: (shipId: string) => store.dispatch(clearPlot(shipId)),
      nextPhase: () => store.dispatch(nextPhase()),
      nextTurn: () => store.dispatch(nextTurn()),
      
      getShipScreenCoordinates: (shipId: string) => {
        const state = store.getState();
        const ship = state.ships.find((s) => s.id === shipId);
        if (!ship) return null;
        
        const layout = getHexLayout();
        return hexToPixel(ship.position, layout);
      },
      
      getHexScreenCoordinates: (q: number, r: number) => {
        const layout = getHexLayout();
        return hexToPixel({ q, r }, layout);
      },
      
      getButtonCoordinates: (buttonName: string) => {
        if (!inputHandlerInstance || !rendererInstance) return null;
        
        const layout = inputHandlerInstance.getCurrentLayout();
        if (!layout) return null;
        
        // Handle different button types
        if (buttonName === 'addPlayer' && layout.addPlayerButton) {
          const btn = layout.addPlayerButton;
          return { x: btn.x, y: btn.y, width: btn.width, height: btn.height };
        }
        
        if (buttonName === 'startGame' && layout.startGameButton) {
          const btn = layout.startGameButton;
          return { x: btn.x, y: btn.y, width: btn.width, height: btn.height };
        }
        
        // Get turn UI buttons
        const turnUI = rendererInstance.getTurnUILayout();
        if (turnUI) {
          if (buttonName === 'nextPhase') {
            const btn = turnUI.nextPhaseButton;
            return { x: btn.x, y: btn.y, width: btn.width, height: btn.height };
          }
          if (buttonName === 'toggle-map-layout') {
            const btn = turnUI.mapLayoutButton;
            return { x: btn.x, y: btn.y, width: btn.width, height: btn.height };
          }
        }
        
        // Get plot UI buttons
        const plotUI = rendererInstance.getCurrentPlotUIElements();
        if (plotUI) {
          if (buttonName === 'toggleHighlight') {
            const btn = plotUI.toggleHighlightButton;
            return { x: btn.x, y: btn.y, width: btn.width, height: btn.height };
          }
        }
        
        // Get ship navigation buttons
        const shipNavButtons = rendererInstance.getShipNavButtons();
        if (shipNavButtons) {
          if (buttonName === 'previousShip' && shipNavButtons.previousButton) {
            const btn = shipNavButtons.previousButton;
            return { x: btn.x, y: btn.y, width: btn.width, height: btn.height };
          }
          if (buttonName === 'nextShip') {
            const btn = shipNavButtons.nextButton;
            return { x: btn.x, y: btn.y, width: btn.width, height: btn.height };
          }
        }
        
        return null;
      },
      
      getHexLayout: () => getHexLayout(),
      
      getCanvasWidth: () => rendererInstance?.getCanvasWidth() || 0,
      getCanvasHeight: () => rendererInstance?.getCanvasHeight() || 0,
    };
    
    // Expose API to window object
    (window as unknown as Window & { testAPI: TestAPI }).testAPI = api;
  }
}

function getHexLayout(): HexLayout {
  if (!rendererInstance) {
    throw new Error('Renderer not initialized');
  }
  
  const hexSize = 10;
  return {
    size: hexSize,
    origin: {
      x: rendererInstance.getCanvasWidth() / 2,
      y: rendererInstance.getCanvasHeight() / 2,
    },
    orientation: 'pointy',
  };
}

function isTestMode(): boolean {
  // Check if we're in test mode via URL parameter
  // Supports both ?testMode and ?testMode=true
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('testMode');
  }
  return false;
}
