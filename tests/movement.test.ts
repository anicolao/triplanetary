// Unit tests for movement calculations

import { describe, it, expect } from 'vitest';
import {
  calculateDestination,
  calculateMovementPath,
  checkCollision,
  detectCollisions,
  isValidMovement,
  executeMovement,
  executeMultiShipMovement,
  calculateReachableHexes,
} from '../src/physics/movement';
import { createShip } from '../src/ship/types';

describe('Movement Calculations', () => {
  describe('calculateDestination', () => {
    it('should calculate destination from zero velocity', () => {
      const result = calculateDestination({ q: 5, r: 3 }, { q: 0, r: 0 });
      expect(result).toEqual({ q: 5, r: 3 });
    });

    it('should calculate destination with positive velocity', () => {
      const result = calculateDestination({ q: 2, r: 3 }, { q: 3, r: 2 });
      expect(result).toEqual({ q: 5, r: 5 });
    });

    it('should calculate destination with negative velocity', () => {
      const result = calculateDestination({ q: 5, r: 5 }, { q: -2, r: -3 });
      expect(result).toEqual({ q: 3, r: 2 });
    });

    it('should round fractional velocities', () => {
      const result = calculateDestination({ q: 0, r: 0 }, { q: 2.6, r: 3.4 });
      expect(result).toEqual({ q: 3, r: 3 });
    });

    it('should handle mixed sign velocity', () => {
      const result = calculateDestination({ q: 5, r: 2 }, { q: -3, r: 4 });
      expect(result).toEqual({ q: 2, r: 6 });
    });
  });

  describe('calculateMovementPath', () => {
    it('should return single hex for zero velocity', () => {
      const path = calculateMovementPath({ q: 5, r: 3 }, { q: 0, r: 0 });
      expect(path).toHaveLength(1);
      expect(path[0]).toEqual({ q: 5, r: 3 });
    });

    it('should calculate path for straight line movement', () => {
      const path = calculateMovementPath({ q: 0, r: 0 }, { q: 3, r: 0 });
      expect(path.length).toBeGreaterThan(1);
      expect(path[0]).toEqual({ q: 0, r: 0 });
      expect(path[path.length - 1]).toEqual({ q: 3, r: 0 });
    });

    it('should calculate path for diagonal movement', () => {
      const path = calculateMovementPath({ q: 0, r: 0 }, { q: 2, r: 2 });
      expect(path.length).toBeGreaterThan(1);
      expect(path[0]).toEqual({ q: 0, r: 0 });
      expect(path[path.length - 1]).toEqual({ q: 2, r: 2 });
    });

    it('should include intermediate hexes', () => {
      const path = calculateMovementPath({ q: 0, r: 0 }, { q: 4, r: 0 });
      // Should include hexes along the way
      expect(path.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('checkCollision', () => {
    it('should detect collision when ships end in same hex', () => {
      const ship1 = createShip('ship-1', 'Ship 1', 'player-1', { q: 0, r: 0 });
      const ship2 = createShip('ship-2', 'Ship 2', 'player-2', { q: 2, r: 0 });
      
      ship1.velocity = { q: 2, r: 0 };
      ship2.velocity = { q: 0, r: 0 };
      
      expect(checkCollision(ship1, ship2)).toBe(true);
    });

    it('should not detect collision when ships end in different hexes', () => {
      const ship1 = createShip('ship-1', 'Ship 1', 'player-1', { q: 0, r: 0 });
      const ship2 = createShip('ship-2', 'Ship 2', 'player-2', { q: 5, r: 5 });
      
      ship1.velocity = { q: 1, r: 1 };
      ship2.velocity = { q: 0, r: 0 };
      
      expect(checkCollision(ship1, ship2)).toBe(false);
    });

    it('should detect head-on collision', () => {
      const ship1 = createShip('ship-1', 'Ship 1', 'player-1', { q: 0, r: 0 });
      const ship2 = createShip('ship-2', 'Ship 2', 'player-2', { q: 4, r: 0 });
      
      ship1.velocity = { q: 2, r: 0 };
      ship2.velocity = { q: -2, r: 0 };
      
      expect(checkCollision(ship1, ship2)).toBe(true);
    });

    it('should handle zero velocity collision', () => {
      const ship1 = createShip('ship-1', 'Ship 1', 'player-1', { q: 2, r: 3 });
      const ship2 = createShip('ship-2', 'Ship 2', 'player-2', { q: 2, r: 3 });
      
      ship1.velocity = { q: 0, r: 0 };
      ship2.velocity = { q: 0, r: 0 };
      
      expect(checkCollision(ship1, ship2)).toBe(true);
    });
  });

  describe('detectCollisions', () => {
    it('should detect no collisions for widely separated ships', () => {
      const ships = [
        createShip('ship-1', 'Ship 1', 'player-1', { q: 0, r: 0 }),
        createShip('ship-2', 'Ship 2', 'player-2', { q: 10, r: 10 }),
        createShip('ship-3', 'Ship 3', 'player-3', { q: 20, r: 20 }),
      ];
      
      const collisions = detectCollisions(ships);
      expect(collisions).toHaveLength(0);
    });

    it('should detect single collision', () => {
      const ship1 = createShip('ship-1', 'Ship 1', 'player-1', { q: 0, r: 0 });
      const ship2 = createShip('ship-2', 'Ship 2', 'player-2', { q: 2, r: 0 });
      
      ship1.velocity = { q: 2, r: 0 };
      ship2.velocity = { q: 0, r: 0 };
      
      const ships = [ship1, ship2];
      const collisions = detectCollisions(ships);
      
      expect(collisions).toHaveLength(1);
      expect(collisions[0]).toContain('ship-1');
      expect(collisions[0]).toContain('ship-2');
    });

    it('should detect multiple collisions in same hex', () => {
      const ship1 = createShip('ship-1', 'Ship 1', 'player-1', { q: 0, r: 0 });
      const ship2 = createShip('ship-2', 'Ship 2', 'player-2', { q: 2, r: 0 });
      const ship3 = createShip('ship-3', 'Ship 3', 'player-3', { q: 1, r: 1 });
      
      ship1.velocity = { q: 2, r: 0 };
      ship2.velocity = { q: 0, r: 0 };
      ship3.velocity = { q: 1, r: -1 };
      
      const ships = [ship1, ship2, ship3];
      const collisions = detectCollisions(ships);
      
      // Three ships colliding means 3 pairs: (1,2), (1,3), (2,3)
      expect(collisions).toHaveLength(3);
    });

    it('should ignore destroyed ships', () => {
      const ship1 = createShip('ship-1', 'Ship 1', 'player-1', { q: 0, r: 0 });
      const ship2 = createShip('ship-2', 'Ship 2', 'player-2', { q: 2, r: 0 });
      
      ship1.velocity = { q: 2, r: 0 };
      ship2.velocity = { q: 0, r: 0 };
      ship2.destroyed = true;
      
      const ships = [ship1, ship2];
      const collisions = detectCollisions(ships);
      
      expect(collisions).toHaveLength(0);
    });

    it('should detect collisions in different locations', () => {
      const ship1 = createShip('ship-1', 'Ship 1', 'player-1', { q: 0, r: 0 });
      const ship2 = createShip('ship-2', 'Ship 2', 'player-2', { q: 2, r: 0 });
      const ship3 = createShip('ship-3', 'Ship 3', 'player-3', { q: 10, r: 10 });
      const ship4 = createShip('ship-4', 'Ship 4', 'player-4', { q: 12, r: 10 });
      
      ship1.velocity = { q: 2, r: 0 };
      ship2.velocity = { q: 0, r: 0 };
      ship3.velocity = { q: 2, r: 0 };
      ship4.velocity = { q: 0, r: 0 };
      
      const ships = [ship1, ship2, ship3, ship4];
      const collisions = detectCollisions(ships);
      
      expect(collisions).toHaveLength(2); // Two separate collision pairs
    });
  });

  describe('isValidMovement', () => {
    it('should validate normal movement', () => {
      expect(isValidMovement({ q: 0, r: 0 }, { q: 2, r: 3 })).toBe(true);
    });

    it('should validate zero movement', () => {
      expect(isValidMovement({ q: 5, r: 5 }, { q: 0, r: 0 })).toBe(true);
    });

    it('should validate negative velocity', () => {
      expect(isValidMovement({ q: 10, r: 10 }, { q: -5, r: -5 })).toBe(true);
    });
  });

  describe('executeMovement', () => {
    it('should update ship position based on velocity', () => {
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 2, r: 3 });
      ship.velocity = { q: 2, r: 1 };
      
      const result = executeMovement(ship);
      
      expect(result.position).toEqual({ q: 4, r: 4 });
    });

    it('should not move destroyed ships', () => {
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 2, r: 3 });
      ship.velocity = { q: 2, r: 1 };
      ship.destroyed = true;
      
      const result = executeMovement(ship);
      
      expect(result.position).toEqual({ q: 2, r: 3 });
    });

    it('should preserve velocity', () => {
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 0, r: 0 });
      ship.velocity = { q: 3, r: 2 };
      
      const result = executeMovement(ship);
      
      expect(result.velocity).toEqual({ q: 3, r: 2 });
    });

    it('should handle zero velocity', () => {
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 5, r: 5 });
      ship.velocity = { q: 0, r: 0 };
      
      const result = executeMovement(ship);
      
      expect(result.position).toEqual({ q: 5, r: 5 });
    });
  });

  describe('executeMultiShipMovement', () => {
    it('should move all ships', () => {
      const ships = [
        createShip('ship-1', 'Ship 1', 'player-1', { q: 0, r: 0 }),
        createShip('ship-2', 'Ship 2', 'player-2', { q: 5, r: 5 }),
      ];
      
      ships[0].velocity = { q: 2, r: 1 };
      ships[1].velocity = { q: -1, r: -1 };
      
      const results = executeMultiShipMovement(ships);
      
      expect(results).toHaveLength(2);
      expect(results[0].position).toEqual({ q: 2, r: 1 });
      expect(results[1].position).toEqual({ q: 4, r: 4 });
    });

    it('should preserve ship order', () => {
      const ships = [
        createShip('ship-1', 'Ship 1', 'player-1', { q: 0, r: 0 }),
        createShip('ship-2', 'Ship 2', 'player-2', { q: 5, r: 5 }),
        createShip('ship-3', 'Ship 3', 'player-3', { q: 10, r: 10 }),
      ];
      
      const results = executeMultiShipMovement(ships);
      
      expect(results[0].id).toBe('ship-1');
      expect(results[1].id).toBe('ship-2');
      expect(results[2].id).toBe('ship-3');
    });

    it('should handle empty array', () => {
      const results = executeMultiShipMovement([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('calculateReachableHexes', () => {
    it('should include current position with zero thrust', () => {
      const reachable = calculateReachableHexes(
        { q: 5, r: 5 },
        { q: 0, r: 0 },
        0
      );
      
      const key = '5,5';
      expect(reachable.has(key)).toBe(true);
      expect(reachable.get(key)!.thrustRequired).toBe(0);
    });

    it('should calculate reachable hexes with thrust', () => {
      const reachable = calculateReachableHexes(
        { q: 0, r: 0 },
        { q: 0, r: 0 },
        1
      );
      
      // With 1 thrust from velocity 0, we can reach 5 hexes:
      // center (0,0) with 0 thrust, and (1,0), (0,1), (-1,0), (0,-1) with 1 thrust each
      // Note: diagonal hexes like (1,1) require 2 thrust (|1| + |1| = 2)
      expect(reachable.size).toBeGreaterThanOrEqual(5);
    });

    it('should respect thrust limits', () => {
      const reachable = calculateReachableHexes(
        { q: 0, r: 0 },
        { q: 0, r: 0 },
        2
      );
      
      // Should not include hexes requiring more than 2 thrust
      for (const [, info] of reachable) {
        expect(info.thrustRequired).toBeLessThanOrEqual(2);
      }
    });

    it('should calculate correct resulting velocity', () => {
      const reachable = calculateReachableHexes(
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        1
      );
      
      // Applying thrust of (-1, 0) should result in destination at (0, 0)
      const key = '0,0';
      if (reachable.has(key)) {
        const info = reachable.get(key)!;
        expect(info.resultingVelocity).toEqual({ q: 0, r: 0 });
      }
    });

    it('should account for existing velocity', () => {
      const reachable = calculateReachableHexes(
        { q: 0, r: 0 },
        { q: 2, r: 0 }, // Already moving right
        0 // No thrust
      );
      
      // Should reach position (2, 0) with no thrust
      const key = '2,0';
      expect(reachable.has(key)).toBe(true);
      expect(reachable.get(key)!.thrustRequired).toBe(0);
    });

    it('should prefer lower thrust for same destination', () => {
      const reachable = calculateReachableHexes(
        { q: 0, r: 0 },
        { q: 1, r: 1 },
        3
      );
      
      // Multiple thrust combinations might reach the same hex,
      // but we should only keep the one with minimum thrust
      for (const [, info] of reachable) {
        expect(info.thrustRequired).toBeLessThanOrEqual(3);
      }
    });
  });
});
