// Integration tests for ordnance lifecycle

import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer, initialState } from '../src/redux/reducer';
import {
  launchOrdnance,
  executeMovement,
  updateShipOrdnance,
  addShip,
} from '../src/redux/actions';
import { createOrdnance, OrdnanceType } from '../src/ordnance/types';
import { createShip } from '../src/ship/types';
import { GameState } from '../src/redux/types';

describe('Ordnance Lifecycle Integration', () => {
  let state: GameState;

  beforeEach(() => {
    state = { ...initialState };
  });

  it('should launch mine and have it remain stationary', () => {
    // Add a ship
    const ship = createShip('ship-1', 'Test Ship', 'player-1', { q: 0, r: 0 });
    state = gameReducer(state, addShip(ship));

    // Launch a mine at a different position
    const mine = createOrdnance(
      'mine-1',
      OrdnanceType.Mine,
      'player-1',
      { q: 5, r: 5 }, // Different position from ship
      { q: 0, r: 0 },
      1
    );
    state = gameReducer(state, launchOrdnance(mine));

    expect(state.ordnance).toHaveLength(1);
    expect(state.ordnance[0].position).toEqual({ q: 5, r: 5 });

    // Execute movement
    state = gameReducer(state, executeMovement());

    // Mine should still be at the same position
    expect(state.ordnance).toHaveLength(1);
    expect(state.ordnance[0].position).toEqual({ q: 5, r: 5 });
  });

  it('should launch torpedo and have it move with velocity', () => {
    // Add a ship
    const ship = createShip('ship-1', 'Test Ship', 'player-1', { q: 0, r: 0 });
    state = gameReducer(state, addShip(ship));

    // Launch a torpedo with velocity
    const torpedo = createOrdnance(
      'torpedo-1',
      OrdnanceType.Torpedo,
      'player-1',
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      1
    );
    state = gameReducer(state, launchOrdnance(torpedo));

    expect(state.ordnance).toHaveLength(1);
    expect(state.ordnance[0].position).toEqual({ q: 0, r: 0 });

    // Execute movement
    state = gameReducer(state, executeMovement());

    // Torpedo should have moved
    expect(state.ordnance).toHaveLength(1);
    expect(state.ordnance[0].position).toEqual({ q: 1, r: 0 });
  });

  it('should launch missile and have it move with velocity', () => {
    // Add a ship
    const ship = createShip('ship-1', 'Test Ship', 'player-1', { q: 0, r: 0 });
    state = gameReducer(state, addShip(ship));

    // Launch a missile with velocity
    const missile = createOrdnance(
      'missile-1',
      OrdnanceType.Missile,
      'player-1',
      { q: 0, r: 0 },
      { q: 2, r: 1 },
      1
    );
    state = gameReducer(state, launchOrdnance(missile));

    expect(state.ordnance).toHaveLength(1);
    expect(state.ordnance[0].position).toEqual({ q: 0, r: 0 });

    // Execute movement
    state = gameReducer(state, executeMovement());

    // Missile should have moved
    expect(state.ordnance).toHaveLength(1);
    expect(state.ordnance[0].position).toEqual({ q: 2, r: 1 });
  });

  it('should detonate ordnance when it hits a ship', () => {
    // Add a ship at a specific location far from celestial bodies to avoid gravity
    const ship = createShip('ship-1', 'Test Ship', 'player-1', { q: 50, r: 50 });
    state = gameReducer(state, addShip(ship));

    const originalHull = ship.stats.currentHull;

    // Launch a torpedo that will hit the ship after one turn of movement
    const torpedo = createOrdnance(
      'torpedo-1',
      OrdnanceType.Torpedo,
      'player-2',
      { q: 49, r: 50 }, // Start one hex away
      { q: 1, r: 0 }, // Velocity to reach the ship
      1
    );
    state = gameReducer(state, launchOrdnance(torpedo));

    // Execute movement - torpedo moves to (50, 50) where ship is
    state = gameReducer(state, executeMovement());

    // Torpedo should be removed (detonated)
    expect(state.ordnance).toHaveLength(0);

    // Ship should have taken damage
    const updatedShip = state.ships.find((s) => s.id === 'ship-1');
    expect(updatedShip).toBeDefined();
    expect(updatedShip!.stats.currentHull).toBeLessThan(originalHull);
    expect(updatedShip!.stats.currentHull).toBe(originalHull - torpedo.damage);
  });

  it('should destroy ship if ordnance damage exceeds hull', () => {
    // Add a ship with low hull far from celestial bodies
    const ship = createShip('ship-1', 'Test Ship', 'player-1', { q: 50, r: 50 });
    ship.stats.currentHull = 2;
    state = { ...state, ships: [ship] };

    // Launch a mine at the same location
    const mine = createOrdnance(
      'mine-1',
      OrdnanceType.Mine,
      'player-2',
      { q: 50, r: 50 },
      { q: 0, r: 0 },
      1
    );
    state = gameReducer(state, launchOrdnance(mine));

    // Execute movement
    state = gameReducer(state, executeMovement());

    // Mine should be removed (detonated)
    expect(state.ordnance).toHaveLength(0);

    // Ship should be destroyed (mine damage is 4, ship had 2 hull)
    const updatedShip = state.ships.find((s) => s.id === 'ship-1');
    expect(updatedShip).toBeDefined();
    expect(updatedShip!.destroyed).toBe(true);
    expect(updatedShip!.stats.currentHull).toBe(0);
  });

  it('should update ship ordnance count when launching', () => {
    // Add a ship
    const ship = createShip('ship-1', 'Test Ship', 'player-1', { q: 0, r: 0 });
    state = gameReducer(state, addShip(ship));

    expect(state.ships[0].ordnance.mines).toBe(2); // Default

    // Launch a mine
    const mine = createOrdnance(
      'mine-1',
      OrdnanceType.Mine,
      'player-1',
      { q: 0, r: 0 },
      { q: 0, r: 0 },
      1
    );
    state = gameReducer(state, launchOrdnance(mine));

    // Decrease ship's mine count
    state = gameReducer(
      state,
      updateShipOrdnance('ship-1', OrdnanceType.Mine, 1)
    );

    expect(state.ships[0].ordnance.mines).toBe(1);
  });

  it('should handle multiple ordnance moving simultaneously', () => {
    // Add a ship
    const ship = createShip('ship-1', 'Test Ship', 'player-1', { q: 0, r: 0 });
    state = gameReducer(state, addShip(ship));

    // Launch multiple ordnance
    const torpedo1 = createOrdnance(
      'torpedo-1',
      OrdnanceType.Torpedo,
      'player-1',
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      1
    );
    const torpedo2 = createOrdnance(
      'torpedo-2',
      OrdnanceType.Torpedo,
      'player-1',
      { q: 0, r: 1 },
      { q: 0, r: 1 },
      1
    );
    const missile = createOrdnance(
      'missile-1',
      OrdnanceType.Missile,
      'player-1',
      { q: 1, r: 1 },
      { q: -1, r: 0 },
      1
    );

    state = gameReducer(state, launchOrdnance(torpedo1));
    state = gameReducer(state, launchOrdnance(torpedo2));
    state = gameReducer(state, launchOrdnance(missile));

    expect(state.ordnance).toHaveLength(3);

    // Execute movement
    state = gameReducer(state, executeMovement());

    // All ordnance should have moved
    expect(state.ordnance).toHaveLength(3);
    expect(state.ordnance[0].position).toEqual({ q: 1, r: 0 });
    expect(state.ordnance[1].position).toEqual({ q: 0, r: 2 });
    expect(state.ordnance[2].position).toEqual({ q: 0, r: 1 });
  });
});
