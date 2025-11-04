// Tests for hex-based gravity system (2018 rules)

import { describe, it, expect } from 'vitest';
import {
  generateGravityHexes,
  getGravityHexesAt,
  hasGravityAt,
  normalizeDirection,
} from '../src/celestial/gravityHexes';
import { HexCoordinate } from '../src/hex/types';

describe('Gravity Hexes', () => {
  describe('generateGravityHexes', () => {
    it('should generate 6 gravity hexes around a celestial body', () => {
      const bodyPosition: HexCoordinate = { q: 0, r: 0 };
      const gravityHexes = generateGravityHexes(bodyPosition, false);

      expect(gravityHexes).toHaveLength(6);
    });

    it('should have gravity hexes adjacent to the body', () => {
      const bodyPosition: HexCoordinate = { q: 5, r: 3 };
      const gravityHexes = generateGravityHexes(bodyPosition, false);

      // Check that each gravity hex is exactly 1 hex away from the body
      gravityHexes.forEach(gh => {
        const distance = Math.max(
          Math.abs(gh.position.q - bodyPosition.q),
          Math.abs(gh.position.r - bodyPosition.r),
          Math.abs((gh.position.q + gh.position.r) - (bodyPosition.q + bodyPosition.r))
        );
        expect(distance).toBe(1);
      });
    });

    it('should have arrows pointing toward the body', () => {
      const bodyPosition: HexCoordinate = { q: 0, r: 0 };
      const gravityHexes = generateGravityHexes(bodyPosition, false);

      gravityHexes.forEach(gh => {
        // Direction should point from gravity hex toward body
        // So adding direction to position should get closer to body
        const withDirection = {
          q: gh.position.q + gh.direction.q,
          r: gh.position.r + gh.direction.r,
        };
        
        // The position with direction applied should be the body position
        expect(withDirection.q).toBe(bodyPosition.q);
        expect(withDirection.r).toBe(bodyPosition.r);
      });
    });

    it('should mark weak gravity hexes correctly', () => {
      const bodyPosition: HexCoordinate = { q: 0, r: 0 };
      const weakGravityHexes = generateGravityHexes(bodyPosition, true);
      const normalGravityHexes = generateGravityHexes(bodyPosition, false);

      weakGravityHexes.forEach(gh => {
        expect(gh.isWeak).toBe(true);
      });

      normalGravityHexes.forEach(gh => {
        expect(gh.isWeak).toBe(false);
      });
    });
  });

  describe('getGravityHexesAt', () => {
    it('should find gravity hexes at a specific position', () => {
      const bodyPosition: HexCoordinate = { q: 0, r: 0 };
      const gravityHexes = generateGravityHexes(bodyPosition, false);
      
      const position: HexCoordinate = { q: 1, r: 0 };
      const found = getGravityHexesAt(position, gravityHexes);

      expect(found).toHaveLength(1);
      expect(found[0].position).toEqual(position);
    });

    it('should return empty array if no gravity hexes at position', () => {
      const bodyPosition: HexCoordinate = { q: 0, r: 0 };
      const gravityHexes = generateGravityHexes(bodyPosition, false);
      
      const position: HexCoordinate = { q: 10, r: 10 };
      const found = getGravityHexesAt(position, gravityHexes);

      expect(found).toHaveLength(0);
    });

    it('should handle multiple gravity hexes at same position', () => {
      // This can happen when gravity hexes from multiple bodies overlap
      const body1Position: HexCoordinate = { q: 0, r: 0 };
      const body2Position: HexCoordinate = { q: 2, r: 0 };
      
      const gravityHexes1 = generateGravityHexes(body1Position, false);
      const gravityHexes2 = generateGravityHexes(body2Position, false);
      
      const allGravityHexes = [...gravityHexes1, ...gravityHexes2];
      
      // Position (1, 0) is between both bodies and should have gravity from both
      const position: HexCoordinate = { q: 1, r: 0 };
      const found = getGravityHexesAt(position, allGravityHexes);

      expect(found.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('hasGravityAt', () => {
    it('should return true when gravity hex exists at position', () => {
      const bodyPosition: HexCoordinate = { q: 0, r: 0 };
      const gravityHexes = generateGravityHexes(bodyPosition, false);
      
      const position: HexCoordinate = { q: 1, r: 0 };
      const hasGravity = hasGravityAt(position, gravityHexes);

      expect(hasGravity).toBe(true);
    });

    it('should return false when no gravity hex at position', () => {
      const bodyPosition: HexCoordinate = { q: 0, r: 0 };
      const gravityHexes = generateGravityHexes(bodyPosition, false);
      
      const position: HexCoordinate = { q: 10, r: 10 };
      const hasGravity = hasGravityAt(position, gravityHexes);

      expect(hasGravity).toBe(false);
    });
  });

  describe('normalizeDirection', () => {
    it('should not change single-hex directions', () => {
      const direction: HexCoordinate = { q: 1, r: 0 };
      const normalized = normalizeDirection(direction);

      expect(normalized).toEqual(direction);
    });

    it('should normalize larger directions', () => {
      const direction: HexCoordinate = { q: 3, r: 4 };
      const normalized = normalizeDirection(direction);

      // Should be scaled to unit magnitude
      const magnitude = Math.sqrt(
        normalized.q * normalized.q + normalized.r * normalized.r
      );
      expect(magnitude).toBeCloseTo(1, 5);
    });

    it('should handle zero direction', () => {
      const direction: HexCoordinate = { q: 0, r: 0 };
      const normalized = normalizeDirection(direction);

      expect(normalized).toEqual({ q: 0, r: 0 });
    });
  });
});
