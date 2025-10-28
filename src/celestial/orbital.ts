// Orbital mechanics and position calculations for celestial bodies

import { HexCoordinate } from '../hex/types';
import { Planet, OrbitalProperties } from './types';

/**
 * Calculate the position of a planet based on its orbital properties.
 * Uses simplified circular/elliptical orbit calculations.
 * 
 * @param orbit - The orbital properties of the planet
 * @returns The hex coordinate position of the planet
 */
export function calculateOrbitalPosition(orbit: OrbitalProperties): HexCoordinate {
  // Convert angle to radians
  const angleRad = (orbit.currentAngle * Math.PI) / 180;
  
  // For simplicity, we use circular orbits (ignoring eccentricity for MVP)
  // In a future enhancement, we could implement full elliptical orbit calculations
  const radius = orbit.semiMajorAxis;
  
  // Calculate cartesian coordinates
  const x = radius * Math.cos(angleRad);
  const y = radius * Math.sin(angleRad);
  
  // Convert cartesian to axial hex coordinates
  // For pointy-top hexagons:
  // q = x
  // r = y (approximately, with adjustment for hex grid)
  const q = Math.round(x);
  const r = Math.round(y);
  
  return { q, r };
}

/**
 * Update a planet's position based on its current orbital angle.
 * This modifies the planet object in place.
 * 
 * @param planet - The planet to update
 * @returns The updated planet
 */
export function updatePlanetPosition(planet: Planet): Planet {
  const newPosition = calculateOrbitalPosition(planet.orbit);
  return {
    ...planet,
    position: newPosition,
  };
}

/**
 * Advance a planet's orbital position by one time step.
 * Calculates the new angle based on the orbital period.
 * 
 * @param planet - The planet to advance
 * @param turns - Number of turns to advance (default 1)
 * @returns The updated planet with new position and angle
 */
export function advancePlanetOrbit(planet: Planet, turns: number = 1): Planet {
  // Calculate angular velocity (degrees per turn)
  const angularVelocity = 360 / planet.orbit.period;
  
  // Calculate new angle
  let newAngle = planet.orbit.currentAngle + (angularVelocity * turns);
  
  // Normalize angle to 0-360 range
  newAngle = newAngle % 360;
  if (newAngle < 0) {
    newAngle += 360;
  }
  
  // Create updated planet with new angle
  const updatedPlanet: Planet = {
    ...planet,
    orbit: {
      ...planet.orbit,
      currentAngle: newAngle,
    },
  };
  
  // Calculate and update position
  return updatePlanetPosition(updatedPlanet);
}

/**
 * Calculate the distance from a hex coordinate to a celestial body.
 * Uses standard hex distance calculation.
 * 
 * @param from - The hex coordinate to measure from
 * @param bodyPosition - The position of the celestial body
 * @returns The distance in hexes
 */
export function distanceToCelestialBody(
  from: HexCoordinate,
  bodyPosition: HexCoordinate
): number {
  // Axial distance calculation for hexagons
  const dq = Math.abs(from.q - bodyPosition.q);
  const dr = Math.abs(from.r - bodyPosition.r);
  const ds = Math.abs((from.q + from.r) - (bodyPosition.q + bodyPosition.r));
  
  return Math.max(dq, dr, ds);
}

/**
 * Check if a hex coordinate is within a specific gravity well zone.
 * 
 * @param position - The hex coordinate to check
 * @param bodyPosition - The position of the celestial body
 * @param zoneRadius - The radius of the gravity zone
 * @returns True if the position is within the zone
 */
export function isInGravityZone(
  position: HexCoordinate,
  bodyPosition: HexCoordinate,
  zoneRadius: number
): boolean {
  const distance = distanceToCelestialBody(position, bodyPosition);
  return distance <= zoneRadius;
}

/**
 * Initialize all planets with their starting positions.
 * Calculates positions based on their initial orbital angles.
 * 
 * @param planets - Array of planets to initialize
 * @returns Array of planets with calculated positions
 */
export function initializePlanetPositions(planets: Planet[]): Planet[] {
  return planets.map(planet => updatePlanetPosition(planet));
}
