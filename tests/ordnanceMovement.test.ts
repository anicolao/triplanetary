// Unit tests for ordnance movement

import { describe, it, expect } from 'vitest';
import { moveOrdnance, checkOrdnanceCollisions } from '../src/physics/ordnanceMovement';
import { createOrdnance, OrdnanceType } from '../src/ordnance/types';

describe('Ordnance Movement', () => {
  describe('moveOrdnance', () => {
    it('should move torpedo with velocity', () => {
      const torpedo = createOrdnance(
        'torpedo-1',
        OrdnanceType.Torpedo,
        'player-1',
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        1
      );

      const result = moveOrdnance([torpedo], 1);

      expect(result).toHaveLength(1);
      expect(result[0].position).toEqual({ q: 1, r: 0 });
    });

    it('should not move mine (zero velocity)', () => {
      const mine = createOrdnance(
        'mine-1',
        OrdnanceType.Mine,
        'player-1',
        { q: 5, r: 5 },
        { q: 0, r: 0 },
        1
      );

      const result = moveOrdnance([mine], 1);

      expect(result).toHaveLength(1);
      expect(result[0].position).toEqual({ q: 5, r: 5 });
    });

    it('should filter out expired ordnance', () => {
      const torpedo = createOrdnance(
        'torpedo-1',
        OrdnanceType.Torpedo,
        'player-1',
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        1
      );

      // Torpedo has lifetime of 10 turns
      // At round 12, it should be removed (age = 12 - 1 = 11 >= 10)
      const result = moveOrdnance([torpedo], 12);

      expect(result).toHaveLength(0);
    });

    it('should keep mines indefinitely', () => {
      const mine = createOrdnance(
        'mine-1',
        OrdnanceType.Mine,
        'player-1',
        { q: 5, r: 5 },
        { q: 0, r: 0 },
        1
      );

      // Even after many rounds, mine should still be there
      const result = moveOrdnance([mine], 100);

      expect(result).toHaveLength(1);
    });
  });

  describe('checkOrdnanceCollisions', () => {
    it('should detect collision between ordnance and ship', () => {
      const torpedo = createOrdnance(
        'torpedo-1',
        OrdnanceType.Torpedo,
        'player-1',
        { q: 2, r: 0 },
        { q: 1, r: 0 },
        1
      );

      const ships = [
        { id: 'ship-1', position: { q: 2, r: 0 }, destroyed: false },
      ];

      const result = checkOrdnanceCollisions([torpedo], ships);

      expect(result).toEqual(['torpedo-1']);
    });

    it('should not detect collision when positions differ', () => {
      const torpedo = createOrdnance(
        'torpedo-1',
        OrdnanceType.Torpedo,
        'player-1',
        { q: 1, r: 0 },
        { q: 1, r: 0 },
        1
      );

      const ships = [
        { id: 'ship-1', position: { q: 2, r: 0 }, destroyed: false },
      ];

      const result = checkOrdnanceCollisions([torpedo], ships);

      expect(result).toEqual([]);
    });

    it('should ignore destroyed ships', () => {
      const torpedo = createOrdnance(
        'torpedo-1',
        OrdnanceType.Torpedo,
        'player-1',
        { q: 2, r: 0 },
        { q: 1, r: 0 },
        1
      );

      const ships = [
        { id: 'ship-1', position: { q: 2, r: 0 }, destroyed: true },
      ];

      const result = checkOrdnanceCollisions([torpedo], ships);

      expect(result).toEqual([]);
    });
  });
});
