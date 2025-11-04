// Tests for gravity effects with one-turn delay (2018 rules)

import { describe, it, expect } from 'vitest';
import {
  applyGravityEffects,
  detectGravityHexEntry,
  getAllGravityHexes,
} from '../src/physics/gravity';
import { Ship, createShip } from '../src/ship/types';
import { CelestialBody, GravityHex } from '../src/celestial/types';
import { HexCoordinate } from '../src/hex/types';
import { generateGravityHexes } from '../src/celestial/gravityHexes';

describe('Gravity Effects (2018 Rules)', () => {
  // Helper to create a test celestial body
  function createTestBody(
    id: string,
    position: HexCoordinate,
    isWeak: boolean = false
  ): CelestialBody {
    return {
      id,
      type: 'planet' as const,
      name: id,
      position,
      gravityHexes: generateGravityHexes(position, isWeak),
      visualRadius: 1,
      color: '#ffffff',
    };
  }

  describe('getAllGravityHexes', () => {
    it('should collect gravity hexes from all celestial bodies', () => {
      const body1 = createTestBody('body1', { q: 0, r: 0 });
      const body2 = createTestBody('body2', { q: 5, r: 5 });
      
      const allGravityHexes = getAllGravityHexes([body1, body2]);

      expect(allGravityHexes).toHaveLength(12); // 6 hexes per body
    });

    it('should handle empty array', () => {
      const allGravityHexes = getAllGravityHexes([]);

      expect(allGravityHexes).toHaveLength(0);
    });
  });

  describe('detectGravityHexEntry', () => {
    it('should detect when ship enters a gravity hex', () => {
      const body = createTestBody('body', { q: 0, r: 0 });
      const gravityHexes = body.gravityHexes;
      
      const shipPosition: HexCoordinate = { q: 1, r: 0 }; // Adjacent to body
      const entered = detectGravityHexEntry(shipPosition, gravityHexes);

      expect(entered).toHaveLength(1);
      expect(entered[0]).toEqual(shipPosition);
    });

    it('should return empty array when not in gravity hex', () => {
      const body = createTestBody('body', { q: 0, r: 0 });
      const gravityHexes = body.gravityHexes;
      
      const shipPosition: HexCoordinate = { q: 10, r: 10 }; // Far from body
      const entered = detectGravityHexEntry(shipPosition, gravityHexes);

      expect(entered).toHaveLength(0);
    });

    it('should detect multiple gravity hexes at same position', () => {
      const body1 = createTestBody('body1', { q: 0, r: 0 });
      const body2 = createTestBody('body2', { q: 2, r: 0 });
      
      const allGravityHexes = [...body1.gravityHexes, ...body2.gravityHexes];
      
      const shipPosition: HexCoordinate = { q: 1, r: 0 }; // Between both bodies
      const entered = detectGravityHexEntry(shipPosition, allGravityHexes);

      // Should be at least 1 (could be 2 if both bodies have gravity at this position)
      expect(entered.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('applyGravityEffects', () => {
    it('should apply no gravity if ship has no entered hexes', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.velocity = { q: 1, r: 1 };
      ship.gravityHexesEntered = [];

      const body = createTestBody('body', { q: 5, r: 5 });
      const updated = applyGravityEffects(ship, [body]);

      expect(updated.velocity).toEqual({ q: 1, r: 1 });
      expect(updated.gravityHexesEntered).toEqual([]);
    });

    it('should apply gravity effect with one-turn delay', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.velocity = { q: 1, r: 0 };
      
      // Ship entered gravity hex at (1, 0) which points toward body at (0, 0)
      // So direction is (-1, 0)
      ship.gravityHexesEntered = [{ q: 1, r: 0 }];

      const body = createTestBody('body', { q: 0, r: 0 });
      const updated = applyGravityEffects(ship, [body]);

      // Velocity should be shifted by (-1, 0)
      expect(updated.velocity).toEqual({ q: 0, r: 0 }); // 1 + (-1) = 0
      expect(updated.gravityHexesEntered).toEqual([]); // Cleared after applying
    });

    it('should apply cumulative effects from multiple gravity hexes', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.velocity = { q: 2, r: 2 };
      
      // Ship entered two gravity hexes
      ship.gravityHexesEntered = [
        { q: 1, r: 0 },  // Points toward (0, 0), direction (-1, 0)
        { q: 0, r: 1 },  // Points toward (0, 0), direction (0, -1)
      ];

      const body = createTestBody('body', { q: 0, r: 0 });
      const updated = applyGravityEffects(ship, [body]);

      // Velocity should be shifted by (-1, 0) + (0, -1) = (-1, -1)
      expect(updated.velocity).toEqual({ q: 1, r: 1 }); // (2, 2) + (-1, -1) = (1, 1)
    });

    it('should not apply gravity to destroyed ships', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.velocity = { q: 1, r: 1 };
      ship.gravityHexesEntered = [{ q: 1, r: 0 }];
      ship.destroyed = true;

      const body = createTestBody('body', { q: 0, r: 0 });
      const updated = applyGravityEffects(ship, [body]);

      expect(updated.velocity).toEqual({ q: 1, r: 1 }); // No change
    });

    it('should handle weak gravity with choice to ignore', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.velocity = { q: 1, r: 0 };
      ship.gravityHexesEntered = [{ q: 1, r: 0 }];

      const body = createTestBody('body', { q: 0, r: 0 }, true); // Weak gravity
      
      // Player chooses to ignore weak gravity
      const weakGravityChoices = new Map<string, boolean>();
      weakGravityChoices.set('1,0', false); // Ignore at position (1, 0)
      
      const updated = applyGravityEffects(ship, [body], weakGravityChoices);

      expect(updated.velocity).toEqual({ q: 1, r: 0 }); // No change
    });

    it('should handle weak gravity with choice to use', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.velocity = { q: 1, r: 0 };
      ship.gravityHexesEntered = [{ q: 1, r: 0 }];

      const body = createTestBody('body', { q: 0, r: 0 }, true); // Weak gravity
      
      // Player chooses to use weak gravity
      const weakGravityChoices = new Map<string, boolean>();
      weakGravityChoices.set('1,0', true); // Use at position (1, 0)
      
      const updated = applyGravityEffects(ship, [body], weakGravityChoices);

      expect(updated.velocity).toEqual({ q: 0, r: 0 }); // Shifted by (-1, 0)
    });

    it('should apply weak gravity by default if no choice specified', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.velocity = { q: 1, r: 0 };
      ship.gravityHexesEntered = [{ q: 1, r: 0 }];

      const body = createTestBody('body', { q: 0, r: 0 }, true); // Weak gravity
      
      // No choices specified - default behavior is to apply
      const updated = applyGravityEffects(ship, [body]);

      expect(updated.velocity).toEqual({ q: 0, r: 0 }); // Shifted by (-1, 0)
    });

    it('should apply effects in sequence when order matters', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 5, r: 5 });
      ship.velocity = { q: 0, r: 0 };
      
      // Multiple gravity hexes from different bodies
      const body1 = createTestBody('body1', { q: 0, r: 0 });
      const body2 = createTestBody('body2', { q: 10, r: 10 });
      
      // Ship entered gravity hexes that have different directions
      ship.gravityHexesEntered = [
        { q: 1, r: 0 },  // From body1: direction toward (0, 0) = (-1, 0)
      ];

      const updated = applyGravityEffects(ship, [body1, body2]);

      // Should apply effect from the entered hex
      expect(updated.velocity.q).not.toBe(0);
    });
  });
});
