// Tests for movement execution logic

import { describe, it, expect } from 'vitest';
import {
  executeAllPlottedMoves,
  applyGravityToAllShips,
  moveAllShips,
  resetShipThrust,
  calculateCollisionDamage,
  applyDamageToShip,
  processCollisions,
  executeMovementPhase,
} from '../src/physics/movementExecution';
import { Ship, VelocityVector } from '../src/ship/types';
import { PlottedMove } from '../src/redux/types';
import { MapObject } from '../src/celestial/types';

// Helper function to create a test ship
function createTestShip(
  id: string,
  playerId: string,
  position = { q: 0, r: 0 },
  velocity = { q: 0, r: 0 },
  hull = 10
): Ship {
  return {
    id,
    name: `Ship ${id}`,
    playerId,
    position,
    velocity,
    stats: {
      maxHull: 10,
      currentHull: hull,
      maxThrust: 3,
      weapons: 0,
      cargo: 0,
    },
    remainingThrust: 1,
    destroyed: false,
  };
}

describe('Movement Execution', () => {
  describe('executeAllPlottedMoves', () => {
    it('should apply plotted velocities to ships', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }, { q: 1, r: 0 }),
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        [
          'ship1',
          { shipId: 'ship1', newVelocity: { q: 2, r: 1 }, thrustUsed: 2 },
        ],
      ]);

      const result = executeAllPlottedMoves(ships, plottedMoves);

      expect(result[0].velocity).toEqual({ q: 2, r: 1 });
    });

    it('should keep current velocity if no plotted move', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }, { q: 1, r: 0 }),
      ];
      const plottedMoves = new Map<string, PlottedMove>();

      const result = executeAllPlottedMoves(ships, plottedMoves);

      expect(result[0].velocity).toEqual({ q: 1, r: 0 });
    });

    it('should not modify destroyed ships', () => {
      const destroyedShip = createTestShip('ship1', 'player1');
      destroyedShip.destroyed = true;
      const ships: Ship[] = [destroyedShip];
      const plottedMoves = new Map<string, PlottedMove>([
        [
          'ship1',
          { shipId: 'ship1', newVelocity: { q: 2, r: 1 }, thrustUsed: 2 },
        ],
      ]);

      const result = executeAllPlottedMoves(ships, plottedMoves);

      expect(result[0].destroyed).toBe(true);
      expect(result[0].velocity).toEqual({ q: 0, r: 0 }); // Original velocity
    });
  });

  describe('moveAllShips', () => {
    it('should move ship to new position based on velocity', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }, { q: 2, r: 1 }),
      ];

      const result = moveAllShips(ships);

      expect(result[0].position).toEqual({ q: 2, r: 1 });
    });

    it('should move multiple ships correctly', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }, { q: 1, r: 0 }),
        createTestShip('ship2', 'player1', { q: 5, r: 3 }, { q: -1, r: 1 }),
      ];

      const result = moveAllShips(ships);

      expect(result[0].position).toEqual({ q: 1, r: 0 });
      expect(result[1].position).toEqual({ q: 4, r: 4 });
    });

    it('should not move destroyed ships', () => {
      const destroyedShip = createTestShip(
        'ship1',
        'player1',
        { q: 0, r: 0 },
        { q: 1, r: 1 }
      );
      destroyedShip.destroyed = true;
      const ships: Ship[] = [destroyedShip];

      const result = moveAllShips(ships);

      expect(result[0].position).toEqual({ q: 0, r: 0 }); // No movement
    });
  });

  describe('resetShipThrust', () => {
    it('should reset thrust to max for all ships', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player1'),
      ];
      ships[0].remainingThrust = 0;
      ships[1].remainingThrust = 1;

      const result = resetShipThrust(ships);

      expect(result[0].remainingThrust).toBe(3);
      expect(result[1].remainingThrust).toBe(3);
    });
  });

  describe('calculateCollisionDamage', () => {
    it('should calculate damage based on relative velocity', () => {
      const ship1 = createTestShip(
        'ship1',
        'player1',
        { q: 0, r: 0 },
        { q: 2, r: 1 }
      );
      const ship2 = createTestShip(
        'ship2',
        'player2',
        { q: 0, r: 0 },
        { q: 0, r: 0 }
      );

      const result = calculateCollisionDamage(ship1, ship2);

      // Relative velocity: |2-0| + |1-0| = 3
      expect(result.ship1Damage).toBe(3);
      expect(result.ship2Damage).toBe(3);
    });

    it('should apply minimum 1 damage', () => {
      const ship1 = createTestShip(
        'ship1',
        'player1',
        { q: 0, r: 0 },
        { q: 0, r: 0 }
      );
      const ship2 = createTestShip(
        'ship2',
        'player2',
        { q: 0, r: 0 },
        { q: 0, r: 0 }
      );

      const result = calculateCollisionDamage(ship1, ship2);

      expect(result.ship1Damage).toBe(1);
      expect(result.ship2Damage).toBe(1);
    });

    it('should handle head-on collisions with high damage', () => {
      const ship1 = createTestShip(
        'ship1',
        'player1',
        { q: 0, r: 0 },
        { q: 3, r: 2 }
      );
      const ship2 = createTestShip(
        'ship2',
        'player2',
        { q: 0, r: 0 },
        { q: -2, r: -1 }
      );

      const result = calculateCollisionDamage(ship1, ship2);

      // Relative velocity: |3-(-2)| + |2-(-1)| = 5 + 3 = 8
      expect(result.ship1Damage).toBe(8);
      expect(result.ship2Damage).toBe(8);
    });
  });

  describe('applyDamageToShip', () => {
    it('should reduce hull points by damage amount', () => {
      const ship = createTestShip('ship1', 'player1', { q: 0, r: 0 }, { q: 0, r: 0 }, 10);
      
      const result = applyDamageToShip(ship, 3);

      expect(result.stats.currentHull).toBe(7);
      expect(result.destroyed).toBe(false);
    });

    it('should destroy ship when hull reaches 0', () => {
      const ship = createTestShip('ship1', 'player1', { q: 0, r: 0 }, { q: 0, r: 0 }, 10);
      
      const result = applyDamageToShip(ship, 10);

      expect(result.stats.currentHull).toBe(0);
      expect(result.destroyed).toBe(true);
    });

    it('should destroy ship when hull goes negative', () => {
      const ship = createTestShip('ship1', 'player1', { q: 0, r: 0 }, { q: 0, r: 0 }, 5);
      
      const result = applyDamageToShip(ship, 10);

      expect(result.stats.currentHull).toBe(0);
      expect(result.destroyed).toBe(true);
    });
  });

  describe('processCollisions', () => {
    it('should apply damage to ships in collision', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }, { q: 2, r: 1 }, 10),
        createTestShip('ship2', 'player2', { q: 0, r: 0 }, { q: 0, r: 0 }, 10),
      ];
      const collisions: Array<[string, string]> = [['ship1', 'ship2']];

      const result = processCollisions(ships, collisions);

      // Both ships should have taken damage (relative velocity = 3)
      expect(result[0].stats.currentHull).toBe(7);
      expect(result[1].stats.currentHull).toBe(7);
    });

    it('should handle multiple collisions for the same ship', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }, { q: 2, r: 1 }, 10),
        createTestShip('ship2', 'player2', { q: 0, r: 0 }, { q: 0, r: 0 }, 10),
        createTestShip('ship3', 'player3', { q: 0, r: 0 }, { q: 1, r: 0 }, 10),
      ];
      const collisions: Array<[string, string]> = [
        ['ship1', 'ship2'],
        ['ship1', 'ship3'],
      ];

      const result = processCollisions(ships, collisions);

      // Ship1 should have taken damage from both collisions
      expect(result[0].stats.currentHull).toBeLessThan(10);
    });

    it('should destroy ships that take lethal damage', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }, { q: 5, r: 5 }, 5),
        createTestShip('ship2', 'player2', { q: 0, r: 0 }, { q: 0, r: 0 }, 5),
      ];
      const collisions: Array<[string, string]> = [['ship1', 'ship2']];

      const result = processCollisions(ships, collisions);

      // Both ships should be destroyed (relative velocity = 10, damage = 10)
      expect(result[0].destroyed).toBe(true);
      expect(result[1].destroyed).toBe(true);
    });
  });

  describe('executeMovementPhase', () => {
    it('should execute complete movement phase sequence', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }, { q: 1, r: 0 }),
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        [
          'ship1',
          { shipId: 'ship1', newVelocity: { q: 2, r: 1 }, thrustUsed: 2 },
        ],
      ]);
      const mapObjects: MapObject[] = [];

      const result = executeMovementPhase(ships, plottedMoves, mapObjects);

      // Ship should have new velocity and position
      expect(result.ships[0].velocity).toEqual({ q: 2, r: 1 });
      expect(result.ships[0].position).toEqual({ q: 2, r: 1 });
      expect(result.ships[0].remainingThrust).toBe(3); // Reset
      expect(result.collisions).toEqual([]);
    });

    it('should detect and process collisions', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }, { q: 1, r: 0 }, 10),
        createTestShip('ship2', 'player2', { q: 0, r: 1 }, { q: 1, r: -1 }, 10),
      ];
      const plottedMoves = new Map<string, PlottedMove>();
      const mapObjects: MapObject[] = [];

      const result = executeMovementPhase(ships, plottedMoves, mapObjects);

      // Both ships should end up at (1, 0) and collide
      expect(result.ships[0].position).toEqual({ q: 1, r: 0 });
      expect(result.ships[1].position).toEqual({ q: 1, r: 0 });
      expect(result.collisions.length).toBeGreaterThan(0);
      // Both ships should have taken damage
      expect(result.ships[0].stats.currentHull).toBeLessThan(10);
      expect(result.ships[1].stats.currentHull).toBeLessThan(10);
    });
  });
});
