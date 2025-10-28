// Type definitions for celestial bodies in the Triplanetary solar system

import { HexCoordinate } from '../hex/types';

/**
 * Gravity well zone types.
 * Zones represent different strengths of gravitational influence.
 */
export type GravityZone = 'inner' | 'middle' | 'outer';

/**
 * Gravity well zone definition.
 * Defines the radius and strength of a gravity zone.
 */
export interface GravityWellZone {
  /** Zone type (inner, middle, or outer) */
  zone: GravityZone;
  /** Radius of the zone in hexes from the center of the celestial body */
  radius: number;
  /** Gravitational pull strength (hexes of velocity modification per turn) */
  pullStrength: number;
}

/**
 * Base celestial body interface.
 * Common properties for all celestial objects (Sun, planets, etc.)
 */
export interface CelestialBody {
  /** Unique identifier for the celestial body */
  id: string;
  /** Display name */
  name: string;
  /** Current position in hex coordinates */
  position: HexCoordinate;
  /** Gravity well zones (inner to outer) */
  gravityWells: GravityWellZone[];
  /** Visual radius for rendering (in hexes) */
  visualRadius: number;
  /** Color for rendering */
  color: string;
}

/**
 * The Sun - central body of the solar system.
 */
export interface Sun extends CelestialBody {
  type: 'sun';
  /** The Sun is always at the origin */
  position: { q: 0; r: 0 };
}

/**
 * Orbital properties for planets.
 */
export interface OrbitalProperties {
  /** Semi-major axis (average orbital radius in hexes) */
  semiMajorAxis: number;
  /** Eccentricity of the orbit (0 = circular, <1 = elliptical) */
  eccentricity: number;
  /** Orbital period in game turns (for position calculation) */
  period: number;
  /** Current angle in the orbit (0-360 degrees) */
  currentAngle: number;
}

/**
 * Planet in orbit around the Sun.
 */
export interface Planet extends CelestialBody {
  type: 'planet';
  /** Orbital properties */
  orbit: OrbitalProperties;
}

/**
 * Union type for all celestial bodies.
 */
export type AnyCelestialBody = Sun | Planet;

/**
 * Planet names in the inner solar system.
 */
export type PlanetName = 'Mercury' | 'Venus' | 'Earth' | 'Mars';
