// Celestial body data for the Triplanetary solar system

import { Sun, Planet, AnyCelestialBody } from './types';
import { generateGravityHexes } from './gravityHexes';

/**
 * The Sun - central celestial body.
 * Position is always at the origin (0, 0).
 */
export const SUN: Sun = {
  id: 'sun',
  type: 'sun',
  name: 'Sun',
  position: { q: 0, r: 0 },
  visualRadius: 2, // Visual size in hexes
  color: '#FDB813', // Bright yellow/orange
  gravityHexes: generateGravityHexes({ q: 0, r: 0 }, false),
  gravityWells: [
    {
      zone: 'inner',
      radius: 3,
      pullStrength: 3, // Strong gravitational pull
    },
    {
      zone: 'middle',
      radius: 6,
      pullStrength: 2,
    },
    {
      zone: 'outer',
      radius: 10,
      pullStrength: 1,
    },
  ],
};

/**
 * Mercury - innermost planet.
 * Fast orbital period, small size, weak gravity.
 */
export const MERCURY: Planet = {
  id: 'mercury',
  type: 'planet',
  name: 'Mercury',
  position: { q: 0, r: 0 }, // Will be calculated based on orbital angle
  visualRadius: 0.5,
  color: '#8C7853', // Gray-brown
  orbit: {
    semiMajorAxis: 15, // Orbital radius in hexes
    eccentricity: 0.1, // Slightly elliptical
    period: 20, // Game turns for one complete orbit
    currentAngle: 0, // Starting position
  },
  gravityHexes: generateGravityHexes({ q: 0, r: 0 }, false),
  gravityWells: [
    {
      zone: 'inner',
      radius: 1,
      pullStrength: 1,
    },
    {
      zone: 'middle',
      radius: 2,
      pullStrength: 0.5,
    },
  ],
};

/**
 * Venus - second planet.
 * Similar size to Earth, thick atmosphere.
 */
export const VENUS: Planet = {
  id: 'venus',
  type: 'planet',
  name: 'Venus',
  position: { q: 0, r: 0 }, // Will be calculated based on orbital angle
  visualRadius: 1,
  color: '#E8C47D', // Yellowish
  orbit: {
    semiMajorAxis: 25, // Orbital radius in hexes
    eccentricity: 0.05, // Nearly circular
    period: 35, // Game turns for one complete orbit
    currentAngle: 90, // Starting at a different position
  },
  gravityHexes: generateGravityHexes({ q: 0, r: 0 }, false),
  gravityWells: [
    {
      zone: 'inner',
      radius: 2,
      pullStrength: 1.5,
    },
    {
      zone: 'middle',
      radius: 4,
      pullStrength: 1,
    },
  ],
};

/**
 * Earth - third planet.
 * Home planet, moderate gravity.
 */
export const EARTH: Planet = {
  id: 'earth',
  type: 'planet',
  name: 'Earth',
  position: { q: 0, r: 0 }, // Will be calculated based on orbital angle
  visualRadius: 1,
  color: '#4A90E2', // Blue
  orbit: {
    semiMajorAxis: 35, // Orbital radius in hexes
    eccentricity: 0.05, // Nearly circular
    period: 50, // Game turns for one complete orbit
    currentAngle: 180, // Starting opposite Mercury
  },
  gravityHexes: generateGravityHexes({ q: 0, r: 0 }, false),
  gravityWells: [
    {
      zone: 'inner',
      radius: 2,
      pullStrength: 1.5,
    },
    {
      zone: 'middle',
      radius: 4,
      pullStrength: 1,
    },
  ],
};

/**
 * Mars - fourth planet.
 * Smaller than Earth, red planet.
 */
export const MARS: Planet = {
  id: 'mars',
  type: 'planet',
  name: 'Mars',
  position: { q: 0, r: 0 }, // Will be calculated based on orbital angle
  visualRadius: 0.8,
  color: '#D4745E', // Reddish
  orbit: {
    semiMajorAxis: 50, // Orbital radius in hexes
    eccentricity: 0.1, // Slightly elliptical
    period: 80, // Game turns for one complete orbit
    currentAngle: 270, // Starting at yet another position
  },
  gravityHexes: generateGravityHexes({ q: 0, r: 0 }, false),
  gravityWells: [
    {
      zone: 'inner',
      radius: 1,
      pullStrength: 1,
    },
    {
      zone: 'middle',
      radius: 3,
      pullStrength: 0.5,
    },
  ],
};

/**
 * All celestial bodies in the solar system.
 * Includes the Sun and all inner planets.
 */
export const CELESTIAL_BODIES: AnyCelestialBody[] = [
  SUN,
  MERCURY,
  VENUS,
  EARTH,
  MARS,
];

/**
 * Get a celestial body by ID.
 * @param id - The celestial body ID
 * @returns The celestial body or undefined if not found
 */
export function getCelestialBody(id: string): AnyCelestialBody | undefined {
  return CELESTIAL_BODIES.find(body => body.id === id);
}

/**
 * Get all planets (excludes the Sun).
 * @returns Array of all planets
 */
export function getPlanets(): Planet[] {
  return CELESTIAL_BODIES.filter(body => body.type === 'planet') as Planet[];
}
