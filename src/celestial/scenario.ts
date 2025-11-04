// Scenario definitions and map initialization for Triplanetary

import { HexCoordinate } from '../hex/types';
import { SpaceStation, Asteroid, MapObject } from './types';
import { SUN, getPlanets } from './data';
import { initializePlanetPositions } from './orbital';
import { AnyVictoryCondition, VictoryConditionType } from '../victory/types';

/**
 * Map bounds definition.
 * Defines the playable area of the map in hex coordinates.
 */
export interface MapBounds {
  /** Minimum q coordinate */
  minQ: number;
  /** Maximum q coordinate */
  maxQ: number;
  /** Minimum r coordinate */
  minR: number;
  /** Maximum r coordinate */
  maxR: number;
}

/**
 * Scenario configuration.
 * Defines the initial setup for a game scenario.
 */
export interface Scenario {
  /** Unique identifier for the scenario */
  id: string;
  /** Display name */
  name: string;
  /** Description of the scenario */
  description: string;
  /** Map bounds for this scenario */
  bounds: MapBounds;
  /** Space stations in this scenario */
  stations: SpaceStation[];
  /** Asteroids in this scenario */
  asteroids: Asteroid[];
  /** Victory condition for this scenario */
  victoryCondition: AnyVictoryCondition;
}

/**
 * Calculate default map bounds based on celestial body positions.
 * Ensures all celestial bodies are visible with some padding.
 * 
 * @param padding - Extra space around the outermost objects (default: 10 hexes)
 * @returns Map bounds that encompass all celestial bodies
 */
export function calculateDefaultBounds(padding: number = 10): MapBounds {
  // Mars has the largest orbit at radius 50
  // Add padding for visibility and gameplay
  const maxRadius = 50 + padding;
  
  return {
    minQ: -maxRadius,
    maxQ: maxRadius,
    minR: -maxRadius,
    maxR: maxRadius,
  };
}

/**
 * Create a space station.
 * 
 * @param id - Unique identifier
 * @param name - Display name
 * @param position - Hex coordinate position
 * @returns Space station object
 */
export function createStation(
  id: string,
  name: string,
  position: HexCoordinate
): SpaceStation {
  return {
    type: 'station',
    id,
    name,
    position,
    visualRadius: 1,
    color: '#888888', // Gray
  };
}

/**
 * Create an asteroid.
 * 
 * @param id - Unique identifier
 * @param position - Hex coordinate position
 * @returns Asteroid object
 */
export function createAsteroid(
  id: string,
  position: HexCoordinate
): Asteroid {
  return {
    type: 'asteroid',
    id,
    position,
    visualRadius: 0.5,
    color: '#666666', // Dark gray
  };
}

/**
 * Create an asteroid field.
 * Generates multiple asteroids in a region.
 * 
 * Note: Uses Math.random() for variation. For deterministic placement,
 * the asteroid positions could be made configurable in the scenario definition.
 * 
 * @param centerQ - Center q coordinate
 * @param centerR - Center r coordinate
 * @param count - Number of asteroids to generate
 * @param spread - How far from center asteroids can be placed
 * @param baseId - Base identifier for asteroids (will add index)
 * @returns Array of asteroids
 */
export function createAsteroidField(
  centerQ: number,
  centerR: number,
  count: number,
  spread: number,
  baseId: string = 'asteroid'
): Asteroid[] {
  const asteroids: Asteroid[] = [];
  
  for (let i = 0; i < count; i++) {
    // Random position within spread
    // For deterministic placement, these could be pre-calculated positions in scenario
    const offsetQ = Math.floor(Math.random() * spread * 2 - spread);
    const offsetR = Math.floor(Math.random() * spread * 2 - spread);
    
    asteroids.push(
      createAsteroid(
        `${baseId}-${i}`,
        { q: centerQ + offsetQ, r: centerR + offsetR }
      )
    );
  }
  
  return asteroids;
}

/**
 * Default scenario - basic solar system with minimal additions.
 * Suitable for learning and testing.
 */
export const DEFAULT_SCENARIO: Scenario = {
  id: 'default',
  name: 'Solar System',
  description: 'Basic solar system scenario with a few stations',
  bounds: calculateDefaultBounds(),
  stations: [
    createStation('station-earth', 'Earth Station', { q: 35, r: 5 }),
    createStation('station-mars', 'Mars Station', { q: -30, r: 40 }),
  ],
  asteroids: createAsteroidField(42, 8, 15, 5, 'belt'),
  victoryCondition: {
    type: VictoryConditionType.Elimination,
    description: 'Eliminate all enemy ships',
  },
};

/**
 * Initialize map objects for a scenario.
 * Combines celestial bodies with scenario-specific objects.
 * 
 * @param scenario - The scenario to initialize
 * @returns Array of all map objects (celestial bodies, stations, asteroids)
 */
export function initializeMap(scenario: Scenario): MapObject[] {
  // Start with celestial bodies
  const celestialBodies: MapObject[] = [
    SUN,
    ...initializePlanetPositions(getPlanets()),
  ];
  
  // Add scenario-specific objects
  return [
    ...celestialBodies,
    ...scenario.stations,
    ...scenario.asteroids,
  ];
}

/**
 * Get initial view position for the map.
 * Centers the view on the Sun at the origin.
 * 
 * @returns Hex coordinate for the center of the view
 */
export function getInitialViewPosition(): HexCoordinate {
  return { q: 0, r: 0 };
}
