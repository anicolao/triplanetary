// Tests for ordnance Redux actions and reducers

import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer, initialState } from '../src/redux/reducer';
import {
  launchOrdnance,
  removeOrdnance,
  updateOrdnancePosition,
  updateOrdnanceVelocity,
  detonateOrdnance,
  updateShipOrdnance,
} from '../src/redux/actions';
import { createOrdnance, OrdnanceType } from '../src/ordnance/types';
import { GameState } from '../src/redux/types';
import { createShip } from '../src/ship/types';

describe('Ordnance Reducer', () => {
  let state: GameState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('LAUNCH_ORDNANCE', () => {
    it('should add ordnance to the state', () => {
      const mine = createOrdnance(
        'mine-1',
        OrdnanceType.Mine,
        'player-1',
        { q: 0, r: 0 },
        { q: 0, r: 0 },
        1
      );

      const newState = gameReducer(state, launchOrdnance(mine));

      expect(newState.ordnance).toHaveLength(1);
      expect(newState.ordnance[0]).toEqual(mine);
    });

    it('should add multiple ordnance', () => {
      const mine = createOrdnance(
        'mine-1',
        OrdnanceType.Mine,
        'player-1',
        { q: 0, r: 0 },
        { q: 0, r: 0 },
        1
      );
      const torpedo = createOrdnance(
        'torpedo-1',
        OrdnanceType.Torpedo,
        'player-1',
        { q: 1, r: 0 },
        { q: 1, r: 0 },
        1
      );

      let newState = gameReducer(state, launchOrdnance(mine));
      newState = gameReducer(newState, launchOrdnance(torpedo));

      expect(newState.ordnance).toHaveLength(2);
      expect(newState.ordnance[0].type).toBe(OrdnanceType.Mine);
      expect(newState.ordnance[1].type).toBe(OrdnanceType.Torpedo);
    });
  });

  describe('REMOVE_ORDNANCE', () => {
    it('should remove ordnance from the state', () => {
      const mine = createOrdnance(
        'mine-1',
        OrdnanceType.Mine,
        'player-1',
        { q: 0, r: 0 },
        { q: 0, r: 0 },
        1
      );

      let newState = gameReducer(state, launchOrdnance(mine));
      expect(newState.ordnance).toHaveLength(1);

      newState = gameReducer(newState, removeOrdnance('mine-1'));
      expect(newState.ordnance).toHaveLength(0);
    });

    it('should only remove the specified ordnance', () => {
      const mine = createOrdnance(
        'mine-1',
        OrdnanceType.Mine,
        'player-1',
        { q: 0, r: 0 },
        { q: 0, r: 0 },
        1
      );
      const torpedo = createOrdnance(
        'torpedo-1',
        OrdnanceType.Torpedo,
        'player-1',
        { q: 1, r: 0 },
        { q: 1, r: 0 },
        1
      );

      let newState = gameReducer(state, launchOrdnance(mine));
      newState = gameReducer(newState, launchOrdnance(torpedo));
      expect(newState.ordnance).toHaveLength(2);

      newState = gameReducer(newState, removeOrdnance('mine-1'));
      expect(newState.ordnance).toHaveLength(1);
      expect(newState.ordnance[0].id).toBe('torpedo-1');
    });
  });

  describe('UPDATE_ORDNANCE_POSITION', () => {
    it('should update ordnance position', () => {
      const mine = createOrdnance(
        'mine-1',
        OrdnanceType.Mine,
        'player-1',
        { q: 0, r: 0 },
        { q: 0, r: 0 },
        1
      );

      let newState = gameReducer(state, launchOrdnance(mine));
      newState = gameReducer(
        newState,
        updateOrdnancePosition('mine-1', { q: 5, r: 3 })
      );

      expect(newState.ordnance[0].position).toEqual({ q: 5, r: 3 });
    });

    it('should only update the specified ordnance position', () => {
      const mine = createOrdnance(
        'mine-1',
        OrdnanceType.Mine,
        'player-1',
        { q: 0, r: 0 },
        { q: 0, r: 0 },
        1
      );
      const torpedo = createOrdnance(
        'torpedo-1',
        OrdnanceType.Torpedo,
        'player-1',
        { q: 1, r: 0 },
        { q: 1, r: 0 },
        1
      );

      let newState = gameReducer(state, launchOrdnance(mine));
      newState = gameReducer(newState, launchOrdnance(torpedo));
      newState = gameReducer(
        newState,
        updateOrdnancePosition('mine-1', { q: 5, r: 3 })
      );

      expect(newState.ordnance[0].position).toEqual({ q: 5, r: 3 });
      expect(newState.ordnance[1].position).toEqual({ q: 1, r: 0 });
    });
  });

  describe('UPDATE_ORDNANCE_VELOCITY', () => {
    it('should update ordnance velocity', () => {
      const torpedo = createOrdnance(
        'torpedo-1',
        OrdnanceType.Torpedo,
        'player-1',
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        1
      );

      let newState = gameReducer(state, launchOrdnance(torpedo));
      newState = gameReducer(
        newState,
        updateOrdnanceVelocity('torpedo-1', { q: 2, r: 1 })
      );

      expect(newState.ordnance[0].velocity).toEqual({ q: 2, r: 1 });
    });
  });

  describe('DETONATE_ORDNANCE', () => {
    it('should mark ordnance as detonated', () => {
      const mine = createOrdnance(
        'mine-1',
        OrdnanceType.Mine,
        'player-1',
        { q: 0, r: 0 },
        { q: 0, r: 0 },
        1
      );

      let newState = gameReducer(state, launchOrdnance(mine));
      expect(newState.ordnance[0].detonated).toBe(false);

      newState = gameReducer(newState, detonateOrdnance('mine-1'));
      expect(newState.ordnance[0].detonated).toBe(true);
    });
  });

  describe('UPDATE_SHIP_ORDNANCE', () => {
    it('should update ship mine count', () => {
      const ship = createShip('ship-1', 'Test Ship', 'player-1', { q: 0, r: 0 });
      state = { ...state, ships: [ship] };

      const newState = gameReducer(
        state,
        updateShipOrdnance('ship-1', OrdnanceType.Mine, 5)
      );

      expect(newState.ships[0].ordnance.mines).toBe(5);
    });

    it('should update ship torpedo count', () => {
      const ship = createShip('ship-1', 'Test Ship', 'player-1', { q: 0, r: 0 });
      state = { ...state, ships: [ship] };

      const newState = gameReducer(
        state,
        updateShipOrdnance('ship-1', OrdnanceType.Torpedo, 3)
      );

      expect(newState.ships[0].ordnance.torpedoes).toBe(3);
    });

    it('should update ship missile count', () => {
      const ship = createShip('ship-1', 'Test Ship', 'player-1', { q: 0, r: 0 });
      state = { ...state, ships: [ship] };

      const newState = gameReducer(
        state,
        updateShipOrdnance('ship-1', OrdnanceType.Missile, 1)
      );

      expect(newState.ships[0].ordnance.missiles).toBe(1);
    });

    it('should only update the specified ship', () => {
      const ship1 = createShip('ship-1', 'Test Ship 1', 'player-1', { q: 0, r: 0 });
      const ship2 = createShip('ship-2', 'Test Ship 2', 'player-2', { q: 1, r: 0 });
      state = { ...state, ships: [ship1, ship2] };

      const newState = gameReducer(
        state,
        updateShipOrdnance('ship-1', OrdnanceType.Mine, 5)
      );

      expect(newState.ships[0].ordnance.mines).toBe(5);
      expect(newState.ships[1].ordnance.mines).toBe(2); // Should remain at default
    });
  });
});
