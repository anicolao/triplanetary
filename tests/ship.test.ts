// Unit tests for ship data structure

import { describe, it, expect } from 'vitest';
import { createShip, generateShipId, Ship, ShipStats } from '../src/ship/types';

describe('Ship Data Structure', () => {
  describe('generateShipId', () => {
    it('should generate unique ship IDs', () => {
      const id1 = generateShipId();
      const id2 = generateShipId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^ship-/);
      expect(id2).toMatch(/^ship-/);
    });
  });

  describe('createShip', () => {
    it('should create a ship with default stats', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 5, r: 3 });
      
      expect(ship.id).toBe('ship-1');
      expect(ship.name).toBe('Enterprise');
      expect(ship.playerId).toBe('player-1');
      expect(ship.position).toEqual({ q: 5, r: 3 });
      expect(ship.velocity).toEqual({ q: 0, r: 0 });
      expect(ship.destroyed).toBe(false);
    });

    it('should initialize ship with default stats', () => {
      const ship = createShip('ship-1', 'Enterprise', 'player-1', { q: 0, r: 0 });
      
      expect(ship.stats.maxThrust).toBe(2);
      expect(ship.stats.maxHull).toBe(6);
      expect(ship.stats.currentHull).toBe(6);
      expect(ship.stats.weapons).toBe(1);
      expect(ship.stats.cargo).toBe(0);
      expect(ship.remainingThrust).toBe(2);
    });

    it('should allow custom stats', () => {
      const customStats: Partial<ShipStats> = {
        maxThrust: 4,
        maxHull: 10,
        currentHull: 8,
        weapons: 2,
        cargo: 5,
      };
      
      const ship = createShip('ship-1', 'Battleship', 'player-1', { q: 0, r: 0 }, customStats);
      
      expect(ship.stats.maxThrust).toBe(4);
      expect(ship.stats.maxHull).toBe(10);
      expect(ship.stats.currentHull).toBe(8);
      expect(ship.stats.weapons).toBe(2);
      expect(ship.stats.cargo).toBe(5);
      expect(ship.remainingThrust).toBe(4);
    });

    it('should allow partial custom stats', () => {
      const customStats: Partial<ShipStats> = {
        maxThrust: 3,
        weapons: 2,
      };
      
      const ship = createShip('ship-1', 'Cruiser', 'player-1', { q: 0, r: 0 }, customStats);
      
      expect(ship.stats.maxThrust).toBe(3);
      expect(ship.stats.maxHull).toBe(6); // default
      expect(ship.stats.currentHull).toBe(6); // default
      expect(ship.stats.weapons).toBe(2);
      expect(ship.stats.cargo).toBe(0); // default
      expect(ship.remainingThrust).toBe(3);
    });

    it('should initialize velocity to zero', () => {
      const ship = createShip('ship-1', 'Scout', 'player-1', { q: 10, r: -5 });
      
      expect(ship.velocity.q).toBe(0);
      expect(ship.velocity.r).toBe(0);
    });

    it('should initialize remainingThrust to maxThrust', () => {
      const ship1 = createShip('ship-1', 'Ship1', 'player-1', { q: 0, r: 0 });
      expect(ship1.remainingThrust).toBe(ship1.stats.maxThrust);

      const ship2 = createShip('ship-2', 'Ship2', 'player-1', { q: 0, r: 0 }, { maxThrust: 5 });
      expect(ship2.remainingThrust).toBe(5);
    });

    it('should initialize ship as not destroyed', () => {
      const ship = createShip('ship-1', 'Survivor', 'player-1', { q: 0, r: 0 });
      
      expect(ship.destroyed).toBe(false);
    });
  });

  describe('Ship properties', () => {
    it('should allow setting different positions', () => {
      const ship1 = createShip('ship-1', 'Ship1', 'player-1', { q: 0, r: 0 });
      const ship2 = createShip('ship-2', 'Ship2', 'player-1', { q: 10, r: -5 });
      const ship3 = createShip('ship-3', 'Ship3', 'player-1', { q: -3, r: 7 });
      
      expect(ship1.position).toEqual({ q: 0, r: 0 });
      expect(ship2.position).toEqual({ q: 10, r: -5 });
      expect(ship3.position).toEqual({ q: -3, r: 7 });
    });

    it('should allow setting different player IDs', () => {
      const ship1 = createShip('ship-1', 'Ship1', 'player-1', { q: 0, r: 0 });
      const ship2 = createShip('ship-2', 'Ship2', 'player-2', { q: 0, r: 0 });
      const ship3 = createShip('ship-3', 'Ship3', 'player-3', { q: 0, r: 0 });
      
      expect(ship1.playerId).toBe('player-1');
      expect(ship2.playerId).toBe('player-2');
      expect(ship3.playerId).toBe('player-3');
    });

    it('should allow different ship names', () => {
      const ship1 = createShip('ship-1', 'Enterprise', 'player-1', { q: 0, r: 0 });
      const ship2 = createShip('ship-2', 'Voyager', 'player-1', { q: 0, r: 0 });
      const ship3 = createShip('ship-3', 'Discovery', 'player-1', { q: 0, r: 0 });
      
      expect(ship1.name).toBe('Enterprise');
      expect(ship2.name).toBe('Voyager');
      expect(ship3.name).toBe('Discovery');
    });
  });

  describe('Ship type constraints', () => {
    it('should have valid property types', () => {
      const ship = createShip('ship-1', 'TestShip', 'player-1', { q: 5, r: 3 });
      
      expect(typeof ship.id).toBe('string');
      expect(typeof ship.name).toBe('string');
      expect(typeof ship.playerId).toBe('string');
      expect(typeof ship.position.q).toBe('number');
      expect(typeof ship.position.r).toBe('number');
      expect(typeof ship.velocity.q).toBe('number');
      expect(typeof ship.velocity.r).toBe('number');
      expect(typeof ship.stats.maxThrust).toBe('number');
      expect(typeof ship.stats.maxHull).toBe('number');
      expect(typeof ship.stats.currentHull).toBe('number');
      expect(typeof ship.stats.weapons).toBe('number');
      expect(typeof ship.stats.cargo).toBe('number');
      expect(typeof ship.remainingThrust).toBe('number');
      expect(typeof ship.destroyed).toBe('boolean');
    });
  });
});
