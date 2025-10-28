// Unit tests for ship placement logic

import { describe, it, expect } from 'vitest';
import {
  isValidPosition,
  createShipsFromPlacements,
  getDefaultPlacements,
  getRacingPlacements,
  getCombatPlacements,
  ShipPlacement,
} from '../src/ship/placement';
import { DEFAULT_SCENARIO } from '../src/celestial';

describe('Ship Placement', () => {
  describe('isValidPosition', () => {
    it('should return true for position within bounds', () => {
      const position = { q: 0, r: 0 };
      expect(isValidPosition(position, DEFAULT_SCENARIO)).toBe(true);
    });

    it('should return true for positions at bounds edges', () => {
      const { minQ, maxQ, minR, maxR } = DEFAULT_SCENARIO.bounds;
      
      expect(isValidPosition({ q: minQ, r: 0 }, DEFAULT_SCENARIO)).toBe(true);
      expect(isValidPosition({ q: maxQ, r: 0 }, DEFAULT_SCENARIO)).toBe(true);
      expect(isValidPosition({ q: 0, r: minR }, DEFAULT_SCENARIO)).toBe(true);
      expect(isValidPosition({ q: 0, r: maxR }, DEFAULT_SCENARIO)).toBe(true);
    });

    it('should return false for position outside bounds', () => {
      const { minQ, maxQ, minR, maxR } = DEFAULT_SCENARIO.bounds;
      
      expect(isValidPosition({ q: minQ - 1, r: 0 }, DEFAULT_SCENARIO)).toBe(false);
      expect(isValidPosition({ q: maxQ + 1, r: 0 }, DEFAULT_SCENARIO)).toBe(false);
      expect(isValidPosition({ q: 0, r: minR - 1 }, DEFAULT_SCENARIO)).toBe(false);
      expect(isValidPosition({ q: 0, r: maxR + 1 }, DEFAULT_SCENARIO)).toBe(false);
    });

    it('should return false for positions far outside bounds', () => {
      expect(isValidPosition({ q: 1000, r: 1000 }, DEFAULT_SCENARIO)).toBe(false);
      expect(isValidPosition({ q: -1000, r: -1000 }, DEFAULT_SCENARIO)).toBe(false);
    });
  });

  describe('createShipsFromPlacements', () => {
    it('should create ships from valid placements', () => {
      const placements: ShipPlacement[] = [
        { playerId: 'p1', name: 'Ship 1', position: { q: 5, r: 3 } },
        { playerId: 'p2', name: 'Ship 2', position: { q: -5, r: -3 } },
      ];

      const ships = createShipsFromPlacements(placements, DEFAULT_SCENARIO);

      expect(ships.length).toBe(2);
      expect(ships[0].name).toBe('Ship 1');
      expect(ships[0].playerId).toBe('p1');
      expect(ships[0].position).toEqual({ q: 5, r: 3 });
      expect(ships[1].name).toBe('Ship 2');
      expect(ships[1].playerId).toBe('p2');
      expect(ships[1].position).toEqual({ q: -5, r: -3 });
    });

    it('should skip invalid placements', () => {
      const placements: ShipPlacement[] = [
        { playerId: 'p1', name: 'Valid Ship', position: { q: 5, r: 3 } },
        { playerId: 'p2', name: 'Invalid Ship', position: { q: 1000, r: 1000 } },
        { playerId: 'p3', name: 'Another Valid Ship', position: { q: -5, r: -3 } },
      ];

      const ships = createShipsFromPlacements(placements, DEFAULT_SCENARIO);

      expect(ships.length).toBe(2);
      expect(ships[0].name).toBe('Valid Ship');
      expect(ships[1].name).toBe('Another Valid Ship');
    });

    it('should apply custom stats to ships', () => {
      const placements: ShipPlacement[] = [
        {
          playerId: 'p1',
          name: 'Custom Ship',
          position: { q: 5, r: 3 },
          stats: {
            maxThrust: 5,
            weapons: 3,
          },
        },
      ];

      const ships = createShipsFromPlacements(placements, DEFAULT_SCENARIO);

      expect(ships.length).toBe(1);
      expect(ships[0].stats.maxThrust).toBe(5);
      expect(ships[0].stats.weapons).toBe(3);
      expect(ships[0].stats.maxHull).toBe(6); // default
    });

    it('should generate unique IDs for each ship', () => {
      const placements: ShipPlacement[] = [
        { playerId: 'p1', name: 'Ship 1', position: { q: 5, r: 3 } },
        { playerId: 'p2', name: 'Ship 2', position: { q: -5, r: -3 } },
        { playerId: 'p3', name: 'Ship 3', position: { q: 0, r: 0 } },
      ];

      const ships = createShipsFromPlacements(placements, DEFAULT_SCENARIO);

      const ids = ships.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('should initialize ships with zero velocity', () => {
      const placements: ShipPlacement[] = [
        { playerId: 'p1', name: 'Ship 1', position: { q: 5, r: 3 } },
      ];

      const ships = createShipsFromPlacements(placements, DEFAULT_SCENARIO);

      expect(ships[0].velocity).toEqual({ q: 0, r: 0 });
    });
  });

  describe('getDefaultPlacements', () => {
    it('should create placement for each player', () => {
      const playerIds = ['p1', 'p2', 'p3'];
      const placements = getDefaultPlacements(playerIds, DEFAULT_SCENARIO);

      expect(placements.length).toBe(3);
      expect(placements[0].playerId).toBe('p1');
      expect(placements[1].playerId).toBe('p2');
      expect(placements[2].playerId).toBe('p3');
    });

    it('should assign unique positions to each player', () => {
      const playerIds = ['p1', 'p2', 'p3'];
      const placements = getDefaultPlacements(playerIds, DEFAULT_SCENARIO);

      const positions = placements.map(p => `${p.position.q},${p.position.r}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(3);
    });

    it('should handle 6 players', () => {
      const playerIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
      const placements = getDefaultPlacements(playerIds, DEFAULT_SCENARIO);

      expect(placements.length).toBe(6);
      
      const positions = placements.map(p => `${p.position.q},${p.position.r}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(6);
    });

    it('should create valid placements within scenario bounds', () => {
      const playerIds = ['p1', 'p2', 'p3'];
      const placements = getDefaultPlacements(playerIds, DEFAULT_SCENARIO);

      placements.forEach(placement => {
        expect(isValidPosition(placement.position, DEFAULT_SCENARIO)).toBe(true);
      });
    });
  });

  describe('getRacingPlacements', () => {
    it('should create racing placements for all players', () => {
      const playerIds = ['p1', 'p2', 'p3'];
      const placements = getRacingPlacements(playerIds, DEFAULT_SCENARIO);

      expect(placements.length).toBe(3);
    });

    it('should create ships with racing stats', () => {
      const playerIds = ['p1', 'p2'];
      const placements = getRacingPlacements(playerIds, DEFAULT_SCENARIO);

      placements.forEach(placement => {
        expect(placement.stats?.maxThrust).toBe(3);
      });
    });

    it('should name ships as Racer', () => {
      const playerIds = ['p1', 'p2'];
      const placements = getRacingPlacements(playerIds, DEFAULT_SCENARIO);

      expect(placements[0].name).toBe('Racer 1');
      expect(placements[1].name).toBe('Racer 2');
    });

    it('should create valid placements within scenario bounds', () => {
      const playerIds = ['p1', 'p2', 'p3'];
      const placements = getRacingPlacements(playerIds, DEFAULT_SCENARIO);

      placements.forEach(placement => {
        expect(isValidPosition(placement.position, DEFAULT_SCENARIO)).toBe(true);
      });
    });

    it('should offset positions slightly for multiple ships', () => {
      const playerIds = ['p1', 'p2', 'p3'];
      const placements = getRacingPlacements(playerIds, DEFAULT_SCENARIO);

      const positions = placements.map(p => `${p.position.q},${p.position.r}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(3);
    });
  });

  describe('getCombatPlacements', () => {
    it('should create combat placements for all players', () => {
      const playerIds = ['p1', 'p2', 'p3', 'p4'];
      const placements = getCombatPlacements(playerIds, DEFAULT_SCENARIO);

      expect(placements.length).toBe(4);
    });

    it('should create ships with combat stats', () => {
      const playerIds = ['p1', 'p2'];
      const placements = getCombatPlacements(playerIds, DEFAULT_SCENARIO);

      placements.forEach(placement => {
        expect(placement.stats?.weapons).toBe(2);
        expect(placement.stats?.maxHull).toBe(8);
        expect(placement.stats?.currentHull).toBe(8);
      });
    });

    it('should name ships as Fighter', () => {
      const playerIds = ['p1', 'p2'];
      const placements = getCombatPlacements(playerIds, DEFAULT_SCENARIO);

      expect(placements[0].name).toBe('Fighter 1');
      expect(placements[1].name).toBe('Fighter 2');
    });

    it('should place teams on opposite sides', () => {
      const playerIds = ['p1', 'p2', 'p3', 'p4'];
      const placements = getCombatPlacements(playerIds, DEFAULT_SCENARIO);

      // First half should have negative q, second half positive q
      const team1Size = Math.ceil(playerIds.length / 2);
      
      for (let i = 0; i < team1Size; i++) {
        expect(placements[i].position.q).toBeLessThan(0);
      }
      
      for (let i = team1Size; i < playerIds.length; i++) {
        expect(placements[i].position.q).toBeGreaterThan(0);
      }
    });

    it('should create valid placements within scenario bounds', () => {
      const playerIds = ['p1', 'p2', 'p3', 'p4'];
      const placements = getCombatPlacements(playerIds, DEFAULT_SCENARIO);

      placements.forEach(placement => {
        expect(isValidPosition(placement.position, DEFAULT_SCENARIO)).toBe(true);
      });
    });
  });
});
