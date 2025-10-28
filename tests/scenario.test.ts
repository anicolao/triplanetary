// Unit tests for scenario and map initialization

import { describe, it, expect } from 'vitest';
import {
  calculateDefaultBounds,
  createStation,
  createAsteroid,
  createAsteroidField,
  DEFAULT_SCENARIO,
  initializeMap,
  getInitialViewPosition,
} from '../src/celestial/scenario';

describe('Map Initialization (Phase 3.3)', () => {
  describe('calculateDefaultBounds', () => {
    it('should return bounds that encompass the solar system', () => {
      const bounds = calculateDefaultBounds();
      
      expect(bounds.minQ).toBeLessThan(0);
      expect(bounds.maxQ).toBeGreaterThan(0);
      expect(bounds.minR).toBeLessThan(0);
      expect(bounds.maxR).toBeGreaterThan(0);
      
      // Mars orbit is at ~50, so bounds should be larger
      expect(bounds.maxQ).toBeGreaterThan(50);
      expect(bounds.maxR).toBeGreaterThan(50);
    });

    it('should apply custom padding', () => {
      const bounds1 = calculateDefaultBounds(10);
      const bounds2 = calculateDefaultBounds(20);
      
      expect(bounds2.maxQ).toBeGreaterThan(bounds1.maxQ);
      expect(bounds2.maxR).toBeGreaterThan(bounds1.maxR);
    });
  });

  describe('createStation', () => {
    it('should create a space station with correct properties', () => {
      const station = createStation('test-station', 'Test Station', { q: 10, r: 20 });
      
      expect(station.type).toBe('station');
      expect(station.id).toBe('test-station');
      expect(station.name).toBe('Test Station');
      expect(station.position.q).toBe(10);
      expect(station.position.r).toBe(20);
      expect(station.visualRadius).toBeGreaterThan(0);
      expect(station.color).toBeDefined();
    });
  });

  describe('createAsteroid', () => {
    it('should create an asteroid with correct properties', () => {
      const asteroid = createAsteroid('test-asteroid', { q: 5, r: 15 });
      
      expect(asteroid.type).toBe('asteroid');
      expect(asteroid.id).toBe('test-asteroid');
      expect(asteroid.position.q).toBe(5);
      expect(asteroid.position.r).toBe(15);
      expect(asteroid.visualRadius).toBeGreaterThan(0);
      expect(asteroid.color).toBeDefined();
    });
  });

  describe('createAsteroidField', () => {
    it('should create multiple asteroids', () => {
      const asteroids = createAsteroidField(0, 0, 10, 5);
      
      expect(asteroids.length).toBe(10);
      expect(asteroids.every(a => a.type === 'asteroid')).toBe(true);
    });

    it('should spread asteroids around center point', () => {
      const centerQ = 20;
      const centerR = 30;
      const spread = 10;
      const asteroids = createAsteroidField(centerQ, centerR, 20, spread);
      
      asteroids.forEach(asteroid => {
        // Each asteroid should be within spread distance of center
        expect(Math.abs(asteroid.position.q - centerQ)).toBeLessThanOrEqual(spread);
        expect(Math.abs(asteroid.position.r - centerR)).toBeLessThanOrEqual(spread);
      });
    });

    it('should create unique IDs for each asteroid', () => {
      const asteroids = createAsteroidField(0, 0, 5, 3, 'belt');
      const ids = asteroids.map(a => a.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(asteroids.length);
    });
  });

  describe('DEFAULT_SCENARIO', () => {
    it('should have required properties', () => {
      expect(DEFAULT_SCENARIO.id).toBeDefined();
      expect(DEFAULT_SCENARIO.name).toBeDefined();
      expect(DEFAULT_SCENARIO.description).toBeDefined();
      expect(DEFAULT_SCENARIO.bounds).toBeDefined();
      expect(DEFAULT_SCENARIO.stations).toBeDefined();
      expect(DEFAULT_SCENARIO.asteroids).toBeDefined();
    });

    it('should have valid map bounds', () => {
      const { bounds } = DEFAULT_SCENARIO;
      expect(bounds.minQ).toBeLessThan(bounds.maxQ);
      expect(bounds.minR).toBeLessThan(bounds.maxR);
    });

    it('should include space stations', () => {
      expect(DEFAULT_SCENARIO.stations.length).toBeGreaterThan(0);
      DEFAULT_SCENARIO.stations.forEach(station => {
        expect(station.type).toBe('station');
        expect(station.id).toBeDefined();
        expect(station.name).toBeDefined();
        expect(station.position).toBeDefined();
      });
    });

    it('should include asteroids', () => {
      expect(DEFAULT_SCENARIO.asteroids.length).toBeGreaterThan(0);
      DEFAULT_SCENARIO.asteroids.forEach(asteroid => {
        expect(asteroid.type).toBe('asteroid');
        expect(asteroid.id).toBeDefined();
        expect(asteroid.position).toBeDefined();
      });
    });
  });

  describe('initializeMap', () => {
    it('should return all map objects for a scenario', () => {
      const mapObjects = initializeMap(DEFAULT_SCENARIO);
      
      expect(mapObjects.length).toBeGreaterThan(0);
      
      // Should include celestial bodies (Sun + 4 planets)
      const celestialBodies = mapObjects.filter(obj => 
        obj.type === 'sun' || obj.type === 'planet'
      );
      expect(celestialBodies.length).toBe(5);
      
      // Should include stations
      const stations = mapObjects.filter(obj => obj.type === 'station');
      expect(stations.length).toBe(DEFAULT_SCENARIO.stations.length);
      
      // Should include asteroids
      const asteroids = mapObjects.filter(obj => obj.type === 'asteroid');
      expect(asteroids.length).toBe(DEFAULT_SCENARIO.asteroids.length);
    });

    it('should include the Sun at origin', () => {
      const mapObjects = initializeMap(DEFAULT_SCENARIO);
      const sun = mapObjects.find(obj => obj.type === 'sun');
      
      expect(sun).toBeDefined();
      expect(sun?.position.q).toBe(0);
      expect(sun?.position.r).toBe(0);
    });

    it('should have planets with calculated positions', () => {
      const mapObjects = initializeMap(DEFAULT_SCENARIO);
      const planets = mapObjects.filter(obj => obj.type === 'planet');
      
      expect(planets.length).toBe(4);
      planets.forEach(planet => {
        expect(planet.position).toBeDefined();
        expect(typeof planet.position.q).toBe('number');
        expect(typeof planet.position.r).toBe('number');
      });
    });
  });

  describe('getInitialViewPosition', () => {
    it('should return the origin', () => {
      const viewPos = getInitialViewPosition();
      expect(viewPos.q).toBe(0);
      expect(viewPos.r).toBe(0);
    });
  });
});
