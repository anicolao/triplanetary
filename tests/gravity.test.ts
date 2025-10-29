// Unit tests for gravity simulation

import { describe, it, expect } from 'vitest';
import {
  getGravityZone,
  calculateGravityDirection,
  calculateGravitationalForce,
  applyGravity,
  applyGravityToAll,
  calculateOrbitalVelocity,
  isInStableOrbit,
  calculateGravityAssist,
} from '../src/physics/gravity';
import { createShip } from '../src/ship/types';
import { CelestialBody } from '../src/celestial/types';

describe('Gravity Simulation', () => {
  // Helper function to create a test celestial body
  const createTestBody = (): CelestialBody => ({
    id: 'test-planet',
    name: 'Test Planet',
    type: 'planet',
    position: { q: 10, r: 10 },
    gravityWells: [
      { zone: 'inner', radius: 2, pullStrength: 2 },
      { zone: 'middle', radius: 5, pullStrength: 1 },
      { zone: 'outer', radius: 10, pullStrength: 0.5 },
    ],
    visualRadius: 1,
    color: '#FF0000',
    orbit: {
      semiMajorAxis: 50,
      eccentricity: 0,
      period: 100,
      currentAngle: 0,
    },
  });

  describe('getGravityZone', () => {
    it('should return null for position outside all zones', () => {
      const body = createTestBody();
      const position = { q: 25, r: 25 }; // Far away
      
      const zone = getGravityZone(position, body);
      expect(zone).toBeNull();
    });

    it('should return inner zone for closest positions', () => {
      const body = createTestBody();
      const position = { q: 10, r: 11 }; // Distance 1
      
      const zone = getGravityZone(position, body);
      expect(zone).not.toBeNull();
      expect(zone!.zone).toBe('inner');
    });

    it('should return middle zone for intermediate positions', () => {
      const body = createTestBody();
      const position = { q: 10, r: 13 }; // Distance 3
      
      const zone = getGravityZone(position, body);
      expect(zone).not.toBeNull();
      expect(zone!.zone).toBe('middle');
    });

    it('should return outer zone for far positions', () => {
      const body = createTestBody();
      const position = { q: 10, r: 18 }; // Distance 8
      
      const zone = getGravityZone(position, body);
      expect(zone).not.toBeNull();
      expect(zone!.zone).toBe('outer');
    });

    it('should return zone at exact boundary', () => {
      const body = createTestBody();
      const position = { q: 10, r: 15 }; // Distance 5 (middle boundary)
      
      const zone = getGravityZone(position, body);
      expect(zone).not.toBeNull();
      expect(zone!.zone).toBe('middle');
    });

    it('should return strongest zone at center', () => {
      const body = createTestBody();
      const position = { q: 10, r: 10 }; // Same as body
      
      const zone = getGravityZone(position, body);
      expect(zone).not.toBeNull();
      expect(zone!.zone).toBe('inner');
    });
  });

  describe('calculateGravityDirection', () => {
    it('should return zero vector when at same position', () => {
      const direction = calculateGravityDirection(
        { q: 10, r: 10 },
        { q: 10, r: 10 }
      );
      
      expect(direction).toEqual({ q: 0, r: 0 });
    });

    it('should point toward body from positive offset', () => {
      const direction = calculateGravityDirection(
        { q: 15, r: 15 },
        { q: 10, r: 10 }
      );
      
      // Should point in negative q and r direction (toward 10,10)
      expect(direction.q).toBeLessThan(0);
      expect(direction.r).toBeLessThan(0);
    });

    it('should point toward body from negative offset', () => {
      const direction = calculateGravityDirection(
        { q: 5, r: 5 },
        { q: 10, r: 10 }
      );
      
      // Should point in positive q and r direction (toward 10,10)
      expect(direction.q).toBeGreaterThan(0);
      expect(direction.r).toBeGreaterThan(0);
    });

    it('should have unit-like magnitude', () => {
      const direction = calculateGravityDirection(
        { q: 15, r: 10 },
        { q: 10, r: 10 }
      );
      
      const magnitude = Math.sqrt(direction.q * direction.q + direction.r * direction.r);
      expect(magnitude).toBeCloseTo(1, 5);
    });
  });

  describe('calculateGravitationalForce', () => {
    it('should return zero force outside gravity zones', () => {
      const body = createTestBody();
      const force = calculateGravitationalForce({ q: 50, r: 50 }, body);
      
      expect(force).toEqual({ q: 0, r: 0 });
    });

    it('should return stronger force in inner zone', () => {
      const body = createTestBody();
      const innerForce = calculateGravitationalForce({ q: 11, r: 10 }, body);
      const outerForce = calculateGravitationalForce({ q: 18, r: 10 }, body);
      
      const innerMag = Math.sqrt(innerForce.q ** 2 + innerForce.r ** 2);
      const outerMag = Math.sqrt(outerForce.q ** 2 + outerForce.r ** 2);
      
      expect(innerMag).toBeGreaterThan(outerMag);
    });

    it('should point toward celestial body', () => {
      const body = createTestBody();
      const position = { q: 15, r: 10 };
      const force = calculateGravitationalForce(position, body);
      
      // Force should point toward body (negative q direction)
      expect(force.q).toBeLessThan(0);
    });

    it('should scale by zone pull strength', () => {
      const body = createTestBody();
      const position = { q: 11, r: 10 }; // In inner zone (pullStrength = 2)
      const force = calculateGravitationalForce(position, body);
      
      // Magnitude should be approximately equal to pullStrength
      const magnitude = Math.sqrt(force.q ** 2 + force.r ** 2);
      expect(magnitude).toBeCloseTo(2, 1);
    });
  });

  describe('applyGravity', () => {
    it('should not modify velocity of ship outside gravity zones', () => {
      const body = createTestBody();
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 50, r: 50 });
      ship.velocity = { q: 2, r: 1 };
      
      const result = applyGravity(ship, [body]);
      
      expect(result.velocity).toEqual({ q: 2, r: 1 });
    });

    it('should modify velocity of ship in gravity zone', () => {
      const body = createTestBody();
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 15, r: 10 });
      ship.velocity = { q: 0, r: 0 };
      
      const result = applyGravity(ship, [body]);
      
      // Velocity should be modified (ship should be pulled toward body)
      expect(result.velocity.q).not.toBe(0);
    });

    it('should not modify destroyed ships', () => {
      const body = createTestBody();
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 15, r: 10 });
      ship.velocity = { q: 2, r: 1 };
      ship.destroyed = true;
      
      const result = applyGravity(ship, [body]);
      
      expect(result.velocity).toEqual({ q: 2, r: 1 });
    });

    it('should apply gravity from multiple bodies', () => {
      const body1 = createTestBody();
      body1.position = { q: 10, r: 10 };
      
      const body2 = createTestBody();
      body2.position = { q: 20, r: 10 };
      
      // Place ship closer to body1 to avoid forces canceling
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 12, r: 10 });
      ship.velocity = { q: 0, r: 0 };
      
      const result = applyGravity(ship, [body1, body2]);
      
      // Velocity should be affected by both bodies
      // Ship is closer to body1, so should be pulled more strongly
      const magnitude = Math.sqrt(result.velocity.q ** 2 + result.velocity.r ** 2);
      expect(magnitude).toBeGreaterThan(0);
    });

    it('should preserve ship properties', () => {
      const body = createTestBody();
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 15, r: 10 });
      
      const result = applyGravity(ship, [body]);
      
      expect(result.id).toBe(ship.id);
      expect(result.position).toEqual(ship.position);
      expect(result.stats).toEqual(ship.stats);
    });
  });

  describe('applyGravityToAll', () => {
    it('should apply gravity to all ships', () => {
      const body = createTestBody();
      const ships = [
        createShip('ship-1', 'Ship 1', 'player-1', { q: 12, r: 10 }),
        createShip('ship-2', 'Ship 2', 'player-2', { q: 14, r: 10 }),
      ];
      
      ships[0].velocity = { q: 0, r: 0 };
      ships[1].velocity = { q: 0, r: 0 };
      
      const results = applyGravityToAll(ships, [body]);
      
      expect(results).toHaveLength(2);
      expect(results[0].velocity.q).not.toBe(0);
      expect(results[1].velocity.q).not.toBe(0);
    });

    it('should preserve ship order', () => {
      const body = createTestBody();
      const ships = [
        createShip('ship-1', 'Ship 1', 'player-1', { q: 12, r: 10 }),
        createShip('ship-2', 'Ship 2', 'player-2', { q: 14, r: 10 }),
        createShip('ship-3', 'Ship 3', 'player-3', { q: 16, r: 10 }),
      ];
      
      const results = applyGravityToAll(ships, [body]);
      
      expect(results[0].id).toBe('ship-1');
      expect(results[1].id).toBe('ship-2');
      expect(results[2].id).toBe('ship-3');
    });

    it('should handle empty arrays', () => {
      const body = createTestBody();
      const results = applyGravityToAll([], [body]);
      expect(results).toHaveLength(0);
    });
  });

  describe('calculateOrbitalVelocity', () => {
    it('should return zero for zero distance', () => {
      const velocity = calculateOrbitalVelocity(0, 10);
      expect(velocity).toBe(0);
    });

    it('should return positive velocity for positive distance', () => {
      const velocity = calculateOrbitalVelocity(5, 10);
      expect(velocity).toBeGreaterThan(0);
    });

    it('should decrease with distance', () => {
      const v1 = calculateOrbitalVelocity(5, 10);
      const v2 = calculateOrbitalVelocity(10, 10);
      
      expect(v1).toBeGreaterThan(v2);
    });

    it('should increase with body mass', () => {
      const v1 = calculateOrbitalVelocity(5, 10);
      const v2 = calculateOrbitalVelocity(5, 20);
      
      expect(v2).toBeGreaterThan(v1);
    });
  });

  describe('isInStableOrbit', () => {
    it('should return false for ship at zero distance', () => {
      const body = createTestBody();
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 10, r: 10 });
      ship.velocity = { q: 1, r: 0 };
      
      expect(isInStableOrbit(ship, body)).toBe(false);
    });

    it('should return true for ship with appropriate velocity', () => {
      const body = createTestBody();
      const distance = 5;
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 15, r: 10 });
      
      // Calculate required velocity
      const strongestZone = body.gravityWells[0];
      const bodyMass = strongestZone.pullStrength * strongestZone.radius;
      const requiredV = calculateOrbitalVelocity(distance, bodyMass);
      
      ship.velocity = { q: requiredV, r: 0 };
      
      expect(isInStableOrbit(ship, body)).toBe(true);
    });

    it('should return false for ship moving too fast', () => {
      const body = createTestBody();
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 15, r: 10 });
      ship.velocity = { q: 100, r: 0 }; // Very fast
      
      expect(isInStableOrbit(ship, body)).toBe(false);
    });

    it('should return false for stationary ship', () => {
      const body = createTestBody();
      const ship = createShip('ship-1', 'Ship 1', 'player-1', { q: 15, r: 10 });
      ship.velocity = { q: 0, r: 0 };
      
      expect(isInStableOrbit(ship, body)).toBe(false);
    });
  });

  describe('calculateGravityAssist', () => {
    it('should return zero assist outside gravity zones', () => {
      const body = createTestBody();
      const assist = calculateGravityAssist(
        { q: 2, r: 1 },
        { q: 50, r: 50 },
        body
      );
      
      expect(assist).toEqual({ q: 0, r: 0 });
    });

    it('should provide assist in gravity zone', () => {
      const body = createTestBody();
      const assist = calculateGravityAssist(
        { q: 2, r: 1 },
        { q: 15, r: 10 },
        body
      );
      
      // Assist should not be zero when in gravity zone with velocity
      const magnitude = Math.sqrt(assist.q ** 2 + assist.r ** 2);
      expect(magnitude).toBeGreaterThan(0);
    });

    it('should return zero assist for zero velocity', () => {
      const body = createTestBody();
      const assist = calculateGravityAssist(
        { q: 0, r: 0 },
        { q: 15, r: 10 },
        body
      );
      
      expect(assist).toEqual({ q: 0, r: 0 });
    });
  });
});
