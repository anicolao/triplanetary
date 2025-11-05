// Tests for Plot Phase functionality

import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from '../src/redux/reducer';
import {
  plotShipMove,
  clearPlot,
  clearAllPlots,
  toggleReachableHexes,
  addShip,
  selectShip,
  addPlayer,
  startGame,
} from '../src/redux/actions';
import { createShip } from '../src/ship/types';

describe('Plot Phase Reducer', () => {
  describe('plotShipMove', () => {
    it('should add a plotted move for a ship', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      let state = gameReducer(initialState, addShip(ship));
      
      const newVelocity = { q: 1, r: 0 };
      state = gameReducer(state, plotShipMove('ship1', newVelocity, 1));
      
      expect(state.plottedMoves.has('ship1')).toBe(true);
      const plot = state.plottedMoves.get('ship1');
      expect(plot?.newVelocity).toEqual(newVelocity);
      expect(plot?.thrustUsed).toBe(1);
    });

    it('should update existing plotted move for a ship', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      let state = gameReducer(initialState, addShip(ship));
      
      state = gameReducer(state, plotShipMove('ship1', { q: 1, r: 0 }, 1));
      state = gameReducer(state, plotShipMove('ship1', { q: 2, r: 0 }, 2));
      
      expect(state.plottedMoves.has('ship1')).toBe(true);
      const plot = state.plottedMoves.get('ship1');
      expect(plot?.newVelocity).toEqual({ q: 2, r: 0 });
      expect(plot?.thrustUsed).toBe(2);
    });

    it('should handle multiple ship plots', () => {
      const ship1 = createShip('ship1', 'Ship 1', 'player1', { q: 0, r: 0 });
      const ship2 = createShip('ship2', 'Ship 2', 'player1', { q: 5, r: 5 });
      let state = gameReducer(initialState, addShip(ship1));
      state = gameReducer(state, addShip(ship2));
      
      state = gameReducer(state, plotShipMove('ship1', { q: 1, r: 0 }, 1));
      state = gameReducer(state, plotShipMove('ship2', { q: 0, r: 1 }, 1));
      
      expect(state.plottedMoves.size).toBe(2);
      expect(state.plottedMoves.get('ship1')?.newVelocity).toEqual({ q: 1, r: 0 });
      expect(state.plottedMoves.get('ship2')?.newVelocity).toEqual({ q: 0, r: 1 });
    });
  });

  describe('clearPlot', () => {
    it('should remove a plotted move for a ship', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      let state = gameReducer(initialState, addShip(ship));
      
      state = gameReducer(state, plotShipMove('ship1', { q: 1, r: 0 }, 1));
      expect(state.plottedMoves.has('ship1')).toBe(true);
      
      state = gameReducer(state, clearPlot('ship1'));
      expect(state.plottedMoves.has('ship1')).toBe(false);
    });

    it('should not affect other ship plots', () => {
      const ship1 = createShip('ship1', 'Ship 1', 'player1', { q: 0, r: 0 });
      const ship2 = createShip('ship2', 'Ship 2', 'player1', { q: 5, r: 5 });
      let state = gameReducer(initialState, addShip(ship1));
      state = gameReducer(state, addShip(ship2));
      
      state = gameReducer(state, plotShipMove('ship1', { q: 1, r: 0 }, 1));
      state = gameReducer(state, plotShipMove('ship2', { q: 0, r: 1 }, 1));
      
      state = gameReducer(state, clearPlot('ship1'));
      
      expect(state.plottedMoves.has('ship1')).toBe(false);
      expect(state.plottedMoves.has('ship2')).toBe(true);
    });
  });

  describe('clearAllPlots', () => {
    it('should remove all plotted moves', () => {
      const ship1 = createShip('ship1', 'Ship 1', 'player1', { q: 0, r: 0 });
      const ship2 = createShip('ship2', 'Ship 2', 'player1', { q: 5, r: 5 });
      let state = gameReducer(initialState, addShip(ship1));
      state = gameReducer(state, addShip(ship2));
      
      state = gameReducer(state, plotShipMove('ship1', { q: 1, r: 0 }, 1));
      state = gameReducer(state, plotShipMove('ship2', { q: 0, r: 1 }, 1));
      
      expect(state.plottedMoves.size).toBe(2);
      
      state = gameReducer(state, clearAllPlots());
      
      expect(state.plottedMoves.size).toBe(0);
    });
  });

  describe('toggleReachableHexes', () => {
    it('should toggle showReachableHexes from true to false', () => {
      expect(initialState.showReachableHexes).toBe(true);
      
      const state = gameReducer(initialState, toggleReachableHexes());
      
      expect(state.showReachableHexes).toBe(false);
    });

    it('should toggle showReachableHexes from false to true', () => {
      const state1 = gameReducer(initialState, toggleReachableHexes());
      expect(state1.showReachableHexes).toBe(false);
      
      const state2 = gameReducer(state1, toggleReachableHexes());
      expect(state2.showReachableHexes).toBe(true);
    });
  });

  describe('selectShip', () => {
    it('should set selectedShipId', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      let state = gameReducer(initialState, addShip(ship));
      
      state = gameReducer(state, selectShip('ship1'));
      
      expect(state.selectedShipId).toBe('ship1');
    });

    it('should allow deselecting by passing null', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      let state = gameReducer(initialState, addShip(ship));
      
      state = gameReducer(state, selectShip('ship1'));
      expect(state.selectedShipId).toBe('ship1');
      
      state = gameReducer(state, selectShip(null));
      expect(state.selectedShipId).toBe(null);
    });
  });
});

describe('Plot Phase Integration', () => {
  it('should support a complete plot workflow', () => {
    // Start with a ship
    const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 }, {
      maxThrust: 2,
    });
    let state = gameReducer(initialState, addShip(ship));
    
    // Select the ship
    state = gameReducer(state, selectShip('ship1'));
    expect(state.selectedShipId).toBe('ship1');
    
    // Plot a move
    state = gameReducer(state, plotShipMove('ship1', { q: 1, r: 0 }, 1));
    expect(state.plottedMoves.has('ship1')).toBe(true);
    
    // Modify the plot
    state = gameReducer(state, plotShipMove('ship1', { q: 1, r: 1 }, 2));
    const plot = state.plottedMoves.get('ship1');
    expect(plot?.newVelocity).toEqual({ q: 1, r: 1 });
    expect(plot?.thrustUsed).toBe(2);
    
    // Clear the plot
    state = gameReducer(state, clearPlot('ship1'));
    expect(state.plottedMoves.has('ship1')).toBe(false);
    
    // Deselect the ship
    state = gameReducer(state, selectShip(null));
    expect(state.selectedShipId).toBe(null);
  });

  it('should handle reachable hexes toggle during plotting', () => {
    const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
    let state = gameReducer(initialState, addShip(ship));
    
    // Initial state has reachable hexes shown
    expect(state.showReachableHexes).toBe(true);
    
    // Select ship and plot a move
    state = gameReducer(state, selectShip('ship1'));
    state = gameReducer(state, plotShipMove('ship1', { q: 1, r: 0 }, 1));
    
    // Toggle reachable hexes off
    state = gameReducer(state, toggleReachableHexes());
    expect(state.showReachableHexes).toBe(false);
    expect(state.plottedMoves.has('ship1')).toBe(true); // Plot is still there
    
    // Toggle back on
    state = gameReducer(state, toggleReachableHexes());
    expect(state.showReachableHexes).toBe(true);
  });
});

describe('Coast Feature', () => {
  it('should plot a coast move (0 thrust, maintain velocity)', () => {
    const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
    ship.velocity = { q: 2, r: 1 };
    let state = gameReducer(initialState, addShip(ship));
    
    // Plot a coast move
    state = gameReducer(state, plotShipMove('ship1', { q: 2, r: 1 }, 0));
    
    expect(state.plottedMoves.has('ship1')).toBe(true);
    const plot = state.plottedMoves.get('ship1');
    expect(plot?.newVelocity).toEqual({ q: 2, r: 1 });
    expect(plot?.thrustUsed).toBe(0);
  });
  
  it('should automatically initialize coast plots when starting game', () => {
    // Add players and start game
    let state = gameReducer(initialState, addPlayer());
    state = gameReducer(state, addPlayer());
    const player1Id = state.players[0].id;
    
    state = gameReducer(state, startGame());
    
    // Check basic state
    expect(state.players.length).toBe(2);
    expect(state.ships.length).toBe(2);
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.players[0].id).toBe(player1Id);
    
    // Check player IDs on ships
    const player1Ships = state.ships.filter(s => s.playerId === player1Id && !s.destroyed);
    expect(player1Ships.length).toBe(1); // Default scenario creates 1 ship per player
    
    // Check that plottedMoves exist
    expect(state.plottedMoves.size).toBe(1);
    
    // All ships of the first player should have coast plots
    player1Ships.forEach(ship => {
      expect(state.plottedMoves.has(ship.id)).toBe(true);
      const plot = state.plottedMoves.get(ship.id);
      expect(plot?.thrustUsed).toBe(0);
      expect(plot?.newVelocity).toEqual(ship.velocity);
    });
  });
  
  it('should automatically initialize coast plots when advancing to next turn', () => {
    // Set up game with players
    let state = gameReducer(initialState, addPlayer());
    state = gameReducer(state, addPlayer());
    state = gameReducer(state, startGame());
    
    // Clear all plots
    state = gameReducer(state, clearAllPlots());
    expect(state.plottedMoves.size).toBe(0);
    
    // Advance to next turn
    state = gameReducer(state, { type: 'NEXT_TURN' });
    
    // All ships of the new current player should have coast plots
    const currentPlayerShips = state.ships.filter(
      s => s.playerId === state.players[state.currentPlayerIndex].id && !s.destroyed
    );
    
    expect(currentPlayerShips.length).toBeGreaterThan(0);
    currentPlayerShips.forEach(ship => {
      expect(state.plottedMoves.has(ship.id)).toBe(true);
      const plot = state.plottedMoves.get(ship.id);
      expect(plot?.thrustUsed).toBe(0);
      expect(plot?.newVelocity).toEqual(ship.velocity);
    });
  });
});
