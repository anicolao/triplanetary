// Unit tests for velocity management

import { describe, it, expect } from 'vitest';
import {
  applyThrust,
  isValidVelocity,
  resetThrust,
  updateShipVelocity,
  calculateRequiredThrust,
} from '../src/physics/velocity';
import { createShip } from '../src/ship/types';

describe('Velocity Management', () => {
  describe('applyThrust', () => {
    it('should apply thrust when sufficient points available', () => {
      const result = applyThrust(
        { q: 1, r: 1 },
        { q: 1, r: 0 },
        2
      );
      
      expect(result).not.toBeNull();
      expect(result!.velocity).toEqual({ q: 2, r: 1 });
      expect(result!.remainingThrust).toBe(1);
    });

    it('should apply zero thrust', () => {
      const result = applyThrust(
        { q: 1, r: 1 },
        { q: 0, r: 0 },
        2
      );
      
      expect(result).not.toBeNull();
      expect(result!.velocity).toEqual({ q: 1, r: 1 });
      expect(result!.remainingThrust).toBe(2);
    });

    it('should reject thrust when insufficient points', () => {
      const result = applyThrust(
        { q: 1, r: 1 },
        { q: 2, r: 2 },
        2
      );
      
      expect(result).toBeNull();
    });

    it('should apply diagonal thrust', () => {
      const result = applyThrust(
        { q: 0, r: 0 },
        { q: 1, r: 1 },
        2
      );
      
      expect(result).not.toBeNull();
      expect(result!.velocity).toEqual({ q: 1, r: 1 });
      expect(result!.remainingThrust).toBe(0);
    });

    it('should apply negative thrust', () => {
      const result = applyThrust(
        { q: 3, r: 2 },
        { q: -1, r: -1 },
        2
      );
      
      expect(result).not.toBeNull();
      expect(result!.velocity).toEqual({ q: 2, r: 1 });
      expect(result!.remainingThrust).toBe(0);
    });

    it('should consume exact amount of thrust', () => {
      const result = applyThrust(
        { q: 0, r: 0 },
        { q: 0, r: 2 },
        2
      );
      
      expect(result).not.toBeNull();
      expect(result!.remainingThrust).toBe(0);
    });
  });

  describe('isValidVelocity', () => {
    it('should validate any velocity when no limit', () => {
      expect(isValidVelocity({ q: 100, r: 100 })).toBe(true);
      expect(isValidVelocity({ q: -50, r: 75 })).toBe(true);
    });

    it('should validate velocity within limit', () => {
      expect(isValidVelocity({ q: 3, r: 4 }, 10)).toBe(true); // magnitude = 5
    });

    it('should invalidate velocity exceeding limit', () => {
      expect(isValidVelocity({ q: 5, r: 5 }, 5)).toBe(false); // magnitude ≈ 7.07
    });

    it('should validate velocity exactly at limit', () => {
      expect(isValidVelocity({ q: 3, r: 4 }, 5)).toBe(true); // magnitude = 5
    });

    it('should validate zero velocity', () => {
      expect(isValidVelocity({ q: 0, r: 0 }, 1)).toBe(true);
    });
  });

  describe('resetThrust', () => {
    it('should reset thrust to maximum', () => {
      const ship = createShip('test-1', 'Test Ship', 'player-1', { q: 0, r: 0 });
      ship.remainingThrust = 0;
      
      const result = resetThrust(ship);
      
      expect(result.remainingThrust).toBe(ship.stats.maxThrust);
    });

    it('should preserve other ship properties', () => {
      const ship = createShip('test-1', 'Test Ship', 'player-1', { q: 5, r: 3 });
      ship.remainingThrust = 0;
      ship.velocity = { q: 2, r: 1 };
      
      const result = resetThrust(ship);
      
      expect(result.id).toBe(ship.id);
      expect(result.name).toBe(ship.name);
      expect(result.position).toEqual(ship.position);
      expect(result.velocity).toEqual(ship.velocity);
    });

    it('should work with custom max thrust', () => {
      const ship = createShip('test-1', 'Test Ship', 'player-1', { q: 0, r: 0 }, {
        maxThrust: 5,
      });
      ship.remainingThrust = 1;
      
      const result = resetThrust(ship);
      
      expect(result.remainingThrust).toBe(5);
    });
  });

  describe('updateShipVelocity', () => {
    it('should update velocity and reduce thrust', () => {
      const ship = createShip('test-1', 'Test Ship', 'player-1', { q: 0, r: 0 });
      const newVelocity = { q: 2, r: 1 };
      
      const result = updateShipVelocity(ship, newVelocity, 1);
      
      expect(result.velocity).toEqual(newVelocity);
      expect(result.remainingThrust).toBe(ship.stats.maxThrust - 1);
    });

    it('should preserve other properties', () => {
      const ship = createShip('test-1', 'Test Ship', 'player-1', { q: 5, r: 3 });
      const newVelocity = { q: 1, r: 1 };
      
      const result = updateShipVelocity(ship, newVelocity, 1);
      
      expect(result.position).toEqual(ship.position);
      expect(result.id).toBe(ship.id);
      expect(result.stats).toEqual(ship.stats);
    });

    it('should allow using all thrust', () => {
      const ship = createShip('test-1', 'Test Ship', 'player-1', { q: 0, r: 0 });
      const newVelocity = { q: 2, r: 0 };
      
      const result = updateShipVelocity(ship, newVelocity, ship.stats.maxThrust);
      
      expect(result.remainingThrust).toBe(0);
    });
  });

  describe('calculateRequiredThrust', () => {
    it('should calculate zero thrust for same velocity', () => {
      const result = calculateRequiredThrust(
        { q: 2, r: 3 },
        { q: 2, r: 3 }
      );
      
      expect(result.thrustVector).toEqual({ q: 0, r: 0 });
      expect(result.thrustRequired).toBe(0);
    });

    it('should calculate thrust for acceleration', () => {
      const result = calculateRequiredThrust(
        { q: 1, r: 1 },
        { q: 3, r: 2 }
      );
      
      expect(result.thrustVector).toEqual({ q: 2, r: 1 });
      expect(result.thrustRequired).toBe(3); // |2| + |1|
    });

    it('should calculate thrust for deceleration', () => {
      const result = calculateRequiredThrust(
        { q: 5, r: 3 },
        { q: 2, r: 1 }
      );
      
      expect(result.thrustVector).toEqual({ q: -3, r: -2 });
      expect(result.thrustRequired).toBe(5); // |-3| + |-2|
    });

    it('should calculate thrust for direction change', () => {
      const result = calculateRequiredThrust(
        { q: 2, r: 0 },
        { q: 0, r: 2 }
      );
      
      expect(result.thrustVector).toEqual({ q: -2, r: 2 });
      expect(result.thrustRequired).toBe(4); // |-2| + |2|
    });

    it('should handle zero to non-zero velocity', () => {
      const result = calculateRequiredThrust(
        { q: 0, r: 0 },
        { q: 3, r: 4 }
      );
      
      expect(result.thrustVector).toEqual({ q: 3, r: 4 });
      expect(result.thrustRequired).toBe(7); // |3| + |4|
    });
  });
});
