// Unit tests for ship state management in Redux reducer

import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from '../src/redux/reducer';
import {
  addShip,
  removeShip,
  updateShipPosition,
  updateShipVelocity,
  updateShipHull,
  updateShipThrust,
  destroyShip,
  selectShip,
} from '../src/redux/actions';
import { createShip } from '../src/ship/types';

describe('Ship State Management Reducer', () => {
  describe('ADD_SHIP', () => {
    it('should add a ship to empty ships array', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      const state = gameReducer(initialState, addShip(ship));

      expect(state.ships.length).toBe(1);
      expect(state.ships[0]).toEqual(ship);
    });

    it('should add multiple ships', () => {
      const ship1 = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      const ship2 = createShip('ship-2', 'Voyager', 'player-2', { q: 10, r: -2 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship1));
      state = gameReducer(state, addShip(ship2));

      expect(state.ships.length).toBe(2);
      expect(state.ships[0]).toEqual(ship1);
      expect(state.ships[1]).toEqual(ship2);
    });

    it('should preserve other state when adding ship', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      const state = gameReducer(initialState, addShip(ship));

      expect(state.players).toEqual(initialState.players);
      expect(state.mapObjects).toEqual(initialState.mapObjects);
      expect(state.screen).toBe(initialState.screen);
    });
  });

  describe('REMOVE_SHIP', () => {
    it('should remove a ship by ID', () => {
      const ship1 = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      const ship2 = createShip('ship-2', 'Voyager', 'player-2', { q: 10, r: -2 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship1));
      state = gameReducer(state, addShip(ship2));
      state = gameReducer(state, removeShip('ship-1'));

      expect(state.ships.length).toBe(1);
      expect(state.ships[0].id).toBe('ship-2');
    });

    it('should clear selection when removing selected ship', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship));
      state = gameReducer(state, selectShip('ship-1'));
      state = gameReducer(state, removeShip('ship-1'));

      expect(state.selectedShipId).toBeNull();
      expect(state.ships.length).toBe(0);
    });

    it('should preserve selection when removing different ship', () => {
      const ship1 = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      const ship2 = createShip('ship-2', 'Voyager', 'player-2', { q: 10, r: -2 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship1));
      state = gameReducer(state, addShip(ship2));
      state = gameReducer(state, selectShip('ship-1'));
      state = gameReducer(state, removeShip('ship-2'));

      expect(state.selectedShipId).toBe('ship-1');
      expect(state.ships.length).toBe(1);
    });
  });

  describe('UPDATE_SHIP_POSITION', () => {
    it('should update ship position', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship));
      state = gameReducer(state, updateShipPosition('ship-1', { q: 7, r: 2 }));

      expect(state.ships[0].position).toEqual({ q: 7, r: 2 });
    });

    it('should only update the specified ship', () => {
      const ship1 = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      const ship2 = createShip('ship-2', 'Voyager', 'player-2', { q: 10, r: -2 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship1));
      state = gameReducer(state, addShip(ship2));
      state = gameReducer(state, updateShipPosition('ship-1', { q: 7, r: 2 }));

      expect(state.ships[0].position).toEqual({ q: 7, r: 2 });
      expect(state.ships[1].position).toEqual({ q: 10, r: -2 });
    });
  });

  describe('UPDATE_SHIP_VELOCITY', () => {
    it('should update ship velocity', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship));
      state = gameReducer(state, updateShipVelocity('ship-1', { q: 2, r: -1 }));

      expect(state.ships[0].velocity).toEqual({ q: 2, r: -1 });
    });

    it('should only update the specified ship', () => {
      const ship1 = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      const ship2 = createShip('ship-2', 'Voyager', 'player-2', { q: 10, r: -2 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship1));
      state = gameReducer(state, addShip(ship2));
      state = gameReducer(state, updateShipVelocity('ship-1', { q: 1, r: 1 }));

      expect(state.ships[0].velocity).toEqual({ q: 1, r: 1 });
      expect(state.ships[1].velocity).toEqual({ q: 0, r: 0 });
    });
  });

  describe('UPDATE_SHIP_HULL', () => {
    it('should update ship hull points', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship));
      state = gameReducer(state, updateShipHull('ship-1', 4));

      expect(state.ships[0].stats.currentHull).toBe(4);
    });

    it('should preserve other ship stats when updating hull', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      const originalMaxHull = ship.stats.maxHull;
      const originalThrust = ship.stats.maxThrust;
      
      let state = initialState;
      state = gameReducer(state, addShip(ship));
      state = gameReducer(state, updateShipHull('ship-1', 4));

      expect(state.ships[0].stats.currentHull).toBe(4);
      expect(state.ships[0].stats.maxHull).toBe(originalMaxHull);
      expect(state.ships[0].stats.maxThrust).toBe(originalThrust);
    });
  });

  describe('UPDATE_SHIP_THRUST', () => {
    it('should update remaining thrust', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship));
      state = gameReducer(state, updateShipThrust('ship-1', 1));

      expect(state.ships[0].remainingThrust).toBe(1);
    });

    it('should only update the specified ship', () => {
      const ship1 = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      const ship2 = createShip('ship-2', 'Voyager', 'player-2', { q: 10, r: -2 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship1));
      state = gameReducer(state, addShip(ship2));
      state = gameReducer(state, updateShipThrust('ship-1', 0));

      expect(state.ships[0].remainingThrust).toBe(0);
      expect(state.ships[1].remainingThrust).toBe(ship2.stats.maxThrust);
    });
  });

  describe('DESTROY_SHIP', () => {
    it('should mark ship as destroyed', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship));
      state = gameReducer(state, destroyShip('ship-1'));

      expect(state.ships[0].destroyed).toBe(true);
    });

    it('should clear selection when destroying selected ship', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship));
      state = gameReducer(state, selectShip('ship-1'));
      state = gameReducer(state, destroyShip('ship-1'));

      expect(state.ships[0].destroyed).toBe(true);
      expect(state.selectedShipId).toBeNull();
    });

    it('should preserve selection when destroying different ship', () => {
      const ship1 = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      const ship2 = createShip('ship-2', 'Voyager', 'player-2', { q: 10, r: -2 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship1));
      state = gameReducer(state, addShip(ship2));
      state = gameReducer(state, selectShip('ship-1'));
      state = gameReducer(state, destroyShip('ship-2'));

      expect(state.selectedShipId).toBe('ship-1');
      expect(state.ships[1].destroyed).toBe(true);
    });

    it('should not remove ship from array', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship));
      state = gameReducer(state, destroyShip('ship-1'));

      expect(state.ships.length).toBe(1);
    });
  });

  describe('SELECT_SHIP', () => {
    it('should select a ship', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship));
      state = gameReducer(state, selectShip('ship-1'));

      expect(state.selectedShipId).toBe('ship-1');
    });

    it('should change selection to different ship', () => {
      const ship1 = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      const ship2 = createShip('ship-2', 'Voyager', 'player-2', { q: 10, r: -2 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship1));
      state = gameReducer(state, addShip(ship2));
      state = gameReducer(state, selectShip('ship-1'));
      state = gameReducer(state, selectShip('ship-2'));

      expect(state.selectedShipId).toBe('ship-2');
    });

    it('should allow deselection by passing null', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      
      let state = initialState;
      state = gameReducer(state, addShip(ship));
      state = gameReducer(state, selectShip('ship-1'));
      state = gameReducer(state, selectShip(null));

      expect(state.selectedShipId).toBeNull();
    });
  });
});
