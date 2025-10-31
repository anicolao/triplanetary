// Tests for ordnance types and functionality

import { describe, it, expect } from 'vitest';
import {
  OrdnanceType,
  createOrdnance,
  generateOrdnanceId,
  createDefaultInventory,
} from '../src/ordnance/types';

describe('Ordnance', () => {
  describe('createOrdnance', () => {
    it('should create a mine with correct properties', () => {
      const mine = createOrdnance(
        'mine-1',
        OrdnanceType.Mine,
        'player-1',
        { q: 0, r: 0 },
        { q: 0, r: 0 },
        1
      );

      expect(mine.id).toBe('mine-1');
      expect(mine.type).toBe(OrdnanceType.Mine);
      expect(mine.playerId).toBe('player-1');
      expect(mine.position).toEqual({ q: 0, r: 0 });
      expect(mine.velocity).toEqual({ q: 0, r: 0 });
      expect(mine.damage).toBe(4);
      expect(mine.lifetime).toBe(-1); // Mines persist indefinitely
      expect(mine.launchedTurn).toBe(1);
      expect(mine.detonated).toBe(false);
    });

    it('should create a torpedo with correct properties', () => {
      const torpedo = createOrdnance(
        'torpedo-1',
        OrdnanceType.Torpedo,
        'player-1',
        { q: 0, r: 0 },
        { q: 1, r: 0 },
        1
      );

      expect(torpedo.id).toBe('torpedo-1');
      expect(torpedo.type).toBe(OrdnanceType.Torpedo);
      expect(torpedo.damage).toBe(3);
      expect(torpedo.lifetime).toBe(10);
      expect(torpedo.velocity).toEqual({ q: 1, r: 0 });
      expect(torpedo.detonated).toBe(false);
    });

    it('should create a missile with correct properties', () => {
      const missile = createOrdnance(
        'missile-1',
        OrdnanceType.Missile,
        'player-1',
        { q: 0, r: 0 },
        { q: 1, r: 1 },
        1
      );

      expect(missile.id).toBe('missile-1');
      expect(missile.type).toBe(OrdnanceType.Missile);
      expect(missile.damage).toBe(2);
      expect(missile.lifetime).toBe(15);
      expect(missile.velocity).toEqual({ q: 1, r: 1 });
      expect(missile.detonated).toBe(false);
    });
  });

  describe('generateOrdnanceId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateOrdnanceId();
      const id2 = generateOrdnanceId();

      expect(id1).toMatch(/^ordnance-/);
      expect(id2).toMatch(/^ordnance-/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('createDefaultInventory', () => {
    it('should create default ordnance inventory', () => {
      const inventory = createDefaultInventory();

      expect(inventory.mines).toBe(2);
      expect(inventory.torpedoes).toBe(2);
      expect(inventory.missiles).toBe(2);
    });
  });
});
