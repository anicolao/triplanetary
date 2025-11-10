// Unit tests for ship movement history feature

import { describe, it, expect } from 'vitest';
import { createShip, type Ship } from '../src/ship/types';
import { moveAllShips } from '../src/physics/movementExecution';
import { gameReducer, initialState } from '../src/redux/reducer';
import { destroyShip, clearMovementHistory } from '../src/redux/actions';

describe('Ship Movement History Feature', () => {
  describe('Ship Creation', () => {
    it('should create ships with movementHistory field', () => {
      const ship = createShip('test-1', 'TestShip', 'player-1', { q: 0, r: 0 });
      
      // Check that movementHistory exists and is an array
      expect(ship).toHaveProperty('movementHistory');
      expect(Array.isArray(ship.movementHistory)).toBe(true);
      expect(ship.movementHistory.length).toBe(0);
    });
  });

  describe('Movement Recording', () => {
    it('should add entry to history when ship moves', () => {
      const ship = createShip('test-2', 'TestShip', 'player-1', { q: 0, r: 0 });
      ship.velocity = { q: 1, r: 1 };

      const [movedShip] = moveAllShips([ship]);

      expect(movedShip.movementHistory.length).toBe(1);
      expect(movedShip.movementHistory[0].fromPosition).toEqual({ q: 0, r: 0 });
      expect(movedShip.movementHistory[0].velocity).toEqual({ q: 1, r: 1 });
    });

    it('should accumulate history over multiple moves', () => {
      let ship = createShip('test-3', 'TestShip', 'player-1', { q: 0, r: 0 });
      
      // First move
      ship.velocity = { q: 1, r: 0 };
      [ship] = moveAllShips([ship]);
      expect(ship.movementHistory.length).toBe(1);
      
      // Second move
      ship.velocity = { q: 0, r: 1 };
      [ship] = moveAllShips([ship]);
      expect(ship.movementHistory.length).toBe(2);
      
      // Verify both entries
      expect(ship.movementHistory[0].fromPosition).toEqual({ q: 0, r: 0 });
      expect(ship.movementHistory[1].fromPosition).toEqual({ q: 1, r: 0 });
    });
  });

  describe('History Clearing', () => {
    it('should clear history on ship destruction via reducer', () => {
      let ship = createShip('test-4', 'TestShip', 'player-1', { q: 0, r: 0 });
      ship.velocity = { q: 1, r: 0 };
      [ship] = moveAllShips([ship]);
      
      // Verify history exists
      expect(ship.movementHistory.length).toBe(1);

      // Destroy via reducer
      const state = { ...initialState, ships: [ship] };
      const newState = gameReducer(state, destroyShip('test-4'));

      expect(newState.ships[0].destroyed).toBe(true);
      expect(newState.ships[0].movementHistory.length).toBe(0);
    });

    it('should clear history via explicit action', () => {
      let ship = createShip('test-5', 'TestShip', 'player-1', { q: 0, r: 0 });
      ship.velocity = { q: 1, r: 0 };
      [ship] = moveAllShips([ship]);
      
      expect(ship.movementHistory.length).toBe(1);

      const state = { ...initialState, ships: [ship] };
      const newState = gameReducer(state, clearMovementHistory('test-5'));

      expect(newState.ships[0].movementHistory.length).toBe(0);
      expect(newState.ships[0].destroyed).toBe(false);
    });
  });
});
