// Unit tests for celestial body data model

import { describe, it, expect } from 'vitest';
import {
  SUN,
  MERCURY,
  VENUS,
  EARTH,
  MARS,
  CELESTIAL_BODIES,
  getCelestialBody,
  getPlanets,
} from '../src/celestial/data';
import {
  calculateOrbitalPosition,
  updatePlanetPosition,
  advancePlanetOrbit,
  distanceToCelestialBody,
  isInGravityZone,
  initializePlanetPositions,
} from '../src/celestial/orbital';

describe('Celestial Body Data', () => {
  describe('Sun', () => {
    it('should have correct basic properties', () => {
      expect(SUN.id).toBe('sun');
      expect(SUN.type).toBe('sun');
      expect(SUN.name).toBe('Sun');
    });

    it('should be positioned at origin', () => {
      expect(SUN.position.q).toBe(0);
      expect(SUN.position.r).toBe(0);
    });

    it('should have gravity wells defined', () => {
      expect(SUN.gravityWells).toBeDefined();
      expect(SUN.gravityWells.length).toBeGreaterThan(0);
    });

    it('should have three gravity zones (inner, middle, outer)', () => {
      expect(SUN.gravityWells.length).toBe(3);
      expect(SUN.gravityWells[0].zone).toBe('inner');
      expect(SUN.gravityWells[1].zone).toBe('middle');
      expect(SUN.gravityWells[2].zone).toBe('outer');
    });

    it('should have decreasing gravity strength from inner to outer zones', () => {
      expect(SUN.gravityWells[0].pullStrength).toBeGreaterThan(SUN.gravityWells[1].pullStrength);
      expect(SUN.gravityWells[1].pullStrength).toBeGreaterThan(SUN.gravityWells[2].pullStrength);
    });

    it('should have increasing zone radii from inner to outer', () => {
      expect(SUN.gravityWells[0].radius).toBeLessThan(SUN.gravityWells[1].radius);
      expect(SUN.gravityWells[1].radius).toBeLessThan(SUN.gravityWells[2].radius);
    });
  });

  describe('Mercury', () => {
    it('should have correct type and name', () => {
      expect(MERCURY.type).toBe('planet');
      expect(MERCURY.name).toBe('Mercury');
    });

    it('should have orbital properties', () => {
      expect(MERCURY.orbit).toBeDefined();
      expect(MERCURY.orbit.semiMajorAxis).toBeGreaterThan(0);
      expect(MERCURY.orbit.period).toBeGreaterThan(0);
    });

    it('should have the smallest orbital radius', () => {
      expect(MERCURY.orbit.semiMajorAxis).toBeLessThan(VENUS.orbit.semiMajorAxis);
      expect(MERCURY.orbit.semiMajorAxis).toBeLessThan(EARTH.orbit.semiMajorAxis);
      expect(MERCURY.orbit.semiMajorAxis).toBeLessThan(MARS.orbit.semiMajorAxis);
    });

    it('should have the shortest orbital period', () => {
      expect(MERCURY.orbit.period).toBeLessThan(VENUS.orbit.period);
      expect(MERCURY.orbit.period).toBeLessThan(EARTH.orbit.period);
      expect(MERCURY.orbit.period).toBeLessThan(MARS.orbit.period);
    });
  });

  describe('Venus', () => {
    it('should have correct type and name', () => {
      expect(VENUS.type).toBe('planet');
      expect(VENUS.name).toBe('Venus');
    });

    it('should have orbital properties between Mercury and Earth', () => {
      expect(VENUS.orbit.semiMajorAxis).toBeGreaterThan(MERCURY.orbit.semiMajorAxis);
      expect(VENUS.orbit.semiMajorAxis).toBeLessThan(EARTH.orbit.semiMajorAxis);
    });
  });

  describe('Earth', () => {
    it('should have correct type and name', () => {
      expect(EARTH.type).toBe('planet');
      expect(EARTH.name).toBe('Earth');
    });

    it('should have orbital properties between Venus and Mars', () => {
      expect(EARTH.orbit.semiMajorAxis).toBeGreaterThan(VENUS.orbit.semiMajorAxis);
      expect(EARTH.orbit.semiMajorAxis).toBeLessThan(MARS.orbit.semiMajorAxis);
    });
  });

  describe('Mars', () => {
    it('should have correct type and name', () => {
      expect(MARS.type).toBe('planet');
      expect(MARS.name).toBe('Mars');
    });

    it('should have the largest orbital radius of inner planets', () => {
      expect(MARS.orbit.semiMajorAxis).toBeGreaterThan(MERCURY.orbit.semiMajorAxis);
      expect(MARS.orbit.semiMajorAxis).toBeGreaterThan(VENUS.orbit.semiMajorAxis);
      expect(MARS.orbit.semiMajorAxis).toBeGreaterThan(EARTH.orbit.semiMajorAxis);
    });
  });

  describe('CELESTIAL_BODIES collection', () => {
    it('should contain all celestial bodies', () => {
      expect(CELESTIAL_BODIES.length).toBe(5); // Sun + 4 planets
    });

    it('should include the Sun', () => {
      expect(CELESTIAL_BODIES).toContain(SUN);
    });

    it('should include all planets', () => {
      expect(CELESTIAL_BODIES).toContain(MERCURY);
      expect(CELESTIAL_BODIES).toContain(VENUS);
      expect(CELESTIAL_BODIES).toContain(EARTH);
      expect(CELESTIAL_BODIES).toContain(MARS);
    });
  });

  describe('getCelestialBody', () => {
    it('should return celestial body by id', () => {
      expect(getCelestialBody('sun')).toBe(SUN);
      expect(getCelestialBody('mercury')).toBe(MERCURY);
      expect(getCelestialBody('venus')).toBe(VENUS);
      expect(getCelestialBody('earth')).toBe(EARTH);
      expect(getCelestialBody('mars')).toBe(MARS);
    });

    it('should return undefined for non-existent id', () => {
      expect(getCelestialBody('jupiter')).toBeUndefined();
      expect(getCelestialBody('unknown')).toBeUndefined();
    });
  });

  describe('getPlanets', () => {
    it('should return only planets', () => {
      const planets = getPlanets();
      expect(planets.length).toBe(4);
      expect(planets).not.toContain(SUN);
    });

    it('should return all four inner planets', () => {
      const planets = getPlanets();
      expect(planets).toContainEqual(MERCURY);
      expect(planets).toContainEqual(VENUS);
      expect(planets).toContainEqual(EARTH);
      expect(planets).toContainEqual(MARS);
    });
  });
});

describe('Orbital Calculations', () => {
  describe('calculateOrbitalPosition', () => {
    it('should calculate position at 0 degrees (right)', () => {
      const pos = calculateOrbitalPosition({
        semiMajorAxis: 10,
        eccentricity: 0,
        period: 100,
        currentAngle: 0,
      });
      expect(pos.q).toBeCloseTo(10, 0);
      expect(pos.r).toBeCloseTo(0, 0);
    });

    it('should calculate position at 90 degrees (up)', () => {
      const pos = calculateOrbitalPosition({
        semiMajorAxis: 10,
        eccentricity: 0,
        period: 100,
        currentAngle: 90,
      });
      expect(pos.q).toBeCloseTo(0, 0);
      expect(pos.r).toBeCloseTo(10, 0);
    });

    it('should calculate position at 180 degrees (left)', () => {
      const pos = calculateOrbitalPosition({
        semiMajorAxis: 10,
        eccentricity: 0,
        period: 100,
        currentAngle: 180,
      });
      expect(pos.q).toBeCloseTo(-10, 0);
      expect(pos.r).toBeCloseTo(0, 0);
    });

    it('should calculate position at 270 degrees (down)', () => {
      const pos = calculateOrbitalPosition({
        semiMajorAxis: 10,
        eccentricity: 0,
        period: 100,
        currentAngle: 270,
      });
      expect(pos.q).toBeCloseTo(0, 0);
      expect(pos.r).toBeCloseTo(-10, 0);
    });
  });

  describe('updatePlanetPosition', () => {
    it('should update planet position based on current angle', () => {
      const updatedMercury = updatePlanetPosition(MERCURY);
      expect(updatedMercury.position).toBeDefined();
      expect(updatedMercury.position.q).toBeDefined();
      expect(updatedMercury.position.r).toBeDefined();
    });

    it('should not modify original planet object', () => {
      const originalPosition = { ...MERCURY.position };
      updatePlanetPosition(MERCURY);
      expect(MERCURY.position).toEqual(originalPosition);
    });
  });

  describe('advancePlanetOrbit', () => {
    it('should advance orbit by one turn', () => {
      const advanced = advancePlanetOrbit(MERCURY, 1);
      const expectedAngleDelta = 360 / MERCURY.orbit.period;
      expect(advanced.orbit.currentAngle).toBeCloseTo(
        (MERCURY.orbit.currentAngle + expectedAngleDelta) % 360,
        1
      );
    });

    it('should advance orbit by multiple turns', () => {
      const turns = 5;
      const advanced = advancePlanetOrbit(MERCURY, turns);
      const expectedAngleDelta = (360 / MERCURY.orbit.period) * turns;
      expect(advanced.orbit.currentAngle).toBeCloseTo(
        (MERCURY.orbit.currentAngle + expectedAngleDelta) % 360,
        1
      );
    });

    it('should wrap angle correctly after full orbit', () => {
      const advanced = advancePlanetOrbit(MERCURY, MERCURY.orbit.period);
      expect(advanced.orbit.currentAngle).toBeCloseTo(MERCURY.orbit.currentAngle, 1);
    });

    it('should update position after advancing orbit', () => {
      const advanced = advancePlanetOrbit(EARTH, 1);
      const positionAtAngle = calculateOrbitalPosition(advanced.orbit);
      expect(advanced.position).toEqual(positionAtAngle);
    });
  });

  describe('distanceToCelestialBody', () => {
    it('should calculate distance of 0 for same position', () => {
      const distance = distanceToCelestialBody({ q: 0, r: 0 }, { q: 0, r: 0 });
      expect(distance).toBe(0);
    });

    it('should calculate distance along q axis', () => {
      const distance = distanceToCelestialBody({ q: 0, r: 0 }, { q: 5, r: 0 });
      expect(distance).toBe(5);
    });

    it('should calculate distance along r axis', () => {
      const distance = distanceToCelestialBody({ q: 0, r: 0 }, { q: 0, r: 5 });
      expect(distance).toBe(5);
    });

    it('should calculate distance correctly for diagonal movement', () => {
      const distance = distanceToCelestialBody({ q: 0, r: 0 }, { q: 3, r: 3 });
      expect(distance).toBe(6);
    });

    it('should be symmetric', () => {
      const dist1 = distanceToCelestialBody({ q: 2, r: 3 }, { q: 5, r: 1 });
      const dist2 = distanceToCelestialBody({ q: 5, r: 1 }, { q: 2, r: 3 });
      expect(dist1).toBe(dist2);
    });
  });

  describe('isInGravityZone', () => {
    it('should return true for position within zone', () => {
      expect(isInGravityZone({ q: 1, r: 0 }, { q: 0, r: 0 }, 5)).toBe(true);
    });

    it('should return false for position outside zone', () => {
      expect(isInGravityZone({ q: 10, r: 0 }, { q: 0, r: 0 }, 5)).toBe(false);
    });

    it('should return true for position exactly at zone boundary', () => {
      expect(isInGravityZone({ q: 5, r: 0 }, { q: 0, r: 0 }, 5)).toBe(true);
    });

    it('should work with Sun gravity zones', () => {
      const innerZone = SUN.gravityWells[0];
      expect(isInGravityZone({ q: 1, r: 1 }, SUN.position, innerZone.radius)).toBe(true);
      
      const outerZone = SUN.gravityWells[2];
      expect(isInGravityZone({ q: 15, r: 0 }, SUN.position, outerZone.radius)).toBe(false);
    });
  });

  describe('initializePlanetPositions', () => {
    it('should initialize positions for all planets', () => {
      const planets = [MERCURY, VENUS, EARTH, MARS];
      const initialized = initializePlanetPositions(planets);
      
      expect(initialized.length).toBe(4);
      initialized.forEach(planet => {
        expect(planet.position).toBeDefined();
        expect(typeof planet.position.q).toBe('number');
        expect(typeof planet.position.r).toBe('number');
      });
    });

    it('should not modify original planet array', () => {
      const planets = [MERCURY, VENUS];
      const originalPositions = planets.map(p => ({ ...p.position }));
      
      initializePlanetPositions(planets);
      
      planets.forEach((planet, i) => {
        expect(planet.position).toEqual(originalPositions[i]);
      });
    });

    it('should calculate positions based on orbital angles', () => {
      const testPlanet = {
        ...MERCURY,
        orbit: {
          ...MERCURY.orbit,
          currentAngle: 0,
          semiMajorAxis: 20,
        },
      };
      
      const [initialized] = initializePlanetPositions([testPlanet]);
      expect(initialized.position.q).toBeCloseTo(20, 0);
      expect(initialized.position.r).toBeCloseTo(0, 0);
    });
  });
});

describe('Gravity Well Zones', () => {
  describe('All planets should have gravity wells', () => {
    it('Mercury should have gravity wells', () => {
      expect(MERCURY.gravityWells.length).toBeGreaterThan(0);
    });

    it('Venus should have gravity wells', () => {
      expect(VENUS.gravityWells.length).toBeGreaterThan(0);
    });

    it('Earth should have gravity wells', () => {
      expect(EARTH.gravityWells.length).toBeGreaterThan(0);
    });

    it('Mars should have gravity wells', () => {
      expect(MARS.gravityWells.length).toBeGreaterThan(0);
    });
  });

  describe('Gravity well properties', () => {
    it('each zone should have a valid type', () => {
      const validZones = ['inner', 'middle', 'outer'];
      CELESTIAL_BODIES.forEach(body => {
        body.gravityWells.forEach(well => {
          expect(validZones).toContain(well.zone);
        });
      });
    });

    it('each zone should have positive radius', () => {
      CELESTIAL_BODIES.forEach(body => {
        body.gravityWells.forEach(well => {
          expect(well.radius).toBeGreaterThan(0);
        });
      });
    });

    it('each zone should have non-negative pull strength', () => {
      CELESTIAL_BODIES.forEach(body => {
        body.gravityWells.forEach(well => {
          expect(well.pullStrength).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});
