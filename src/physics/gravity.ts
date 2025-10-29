// Gravity simulation for celestial bodies

import { Ship, VelocityVector } from '../ship/types';
import { HexCoordinate } from '../hex/types';
import { CelestialBody, GravityWellZone } from '../celestial/types';
import { hexDistance } from '../hex/operations';
import { vectorAdd } from './vector';

/**
 * Determines which gravity well zone a position is in relative to a celestial body.
 * Returns null if the position is outside all gravity zones.
 * 
 * @param position - The position to check
 * @param body - The celestial body with gravity wells
 * @returns The gravity well zone the position is in, or null
 */
export function getGravityZone(
  position: HexCoordinate,
  body: CelestialBody
): GravityWellZone | null {
  const distance = hexDistance(position, body.position);
  
  // Check zones from innermost to outermost
  // Zones are assumed to be sorted by radius in the data
  for (const zone of body.gravityWells) {
    if (distance <= zone.radius) {
      return zone;
    }
  }
  
  return null;
}

/**
 * Calculates the direction vector from a position toward a celestial body.
 * Returns a normalized direction (unit vector concept adapted for hex grid).
 * 
 * @param position - The position to calculate from
 * @param bodyPosition - The position of the celestial body
 * @returns A velocity vector pointing toward the body
 */
export function calculateGravityDirection(
  position: HexCoordinate,
  bodyPosition: HexCoordinate
): VelocityVector {
  const direction: VelocityVector = {
    q: bodyPosition.q - position.q,
    r: bodyPosition.r - position.r,
  };
  
  // Normalize to unit magnitude for hex grid
  const magnitude = Math.sqrt(direction.q * direction.q + direction.r * direction.r);
  
  if (magnitude === 0) {
    return { q: 0, r: 0 };
  }
  
  return {
    q: direction.q / magnitude,
    r: direction.r / magnitude,
  };
}

/**
 * Calculates the gravitational force applied to a ship from a celestial body.
 * The force is based on the gravity well zone the ship is in.
 * 
 * @param shipPosition - The ship's position
 * @param body - The celestial body exerting gravity
 * @returns The velocity change due to gravity (as a vector)
 */
export function calculateGravitationalForce(
  shipPosition: HexCoordinate,
  body: CelestialBody
): VelocityVector {
  const zone = getGravityZone(shipPosition, body);
  
  if (!zone) {
    return { q: 0, r: 0 }; // Outside all gravity zones
  }
  
  const direction = calculateGravityDirection(shipPosition, body.position);
  
  // Scale direction by pull strength
  return {
    q: direction.q * zone.pullStrength,
    r: direction.r * zone.pullStrength,
  };
}

/**
 * Applies gravity from all celestial bodies to a ship's velocity.
 * 
 * @param ship - The ship to apply gravity to
 * @param celestialBodies - Array of all celestial bodies in the system
 * @returns A new ship object with gravity-modified velocity
 */
export function applyGravity(ship: Ship, celestialBodies: CelestialBody[]): Ship {
  if (ship.destroyed) {
    return ship;
  }
  
  let newVelocity = { ...ship.velocity };
  
  // Apply gravity from each celestial body
  for (const body of celestialBodies) {
    const gravityForce = calculateGravitationalForce(ship.position, body);
    newVelocity = vectorAdd(newVelocity, gravityForce);
  }
  
  return {
    ...ship,
    velocity: newVelocity,
  };
}

/**
 * Applies gravity to all ships in the game.
 * 
 * @param ships - Array of ships
 * @param celestialBodies - Array of celestial bodies
 * @returns Array of ships with gravity-modified velocities
 */
export function applyGravityToAll(
  ships: Ship[],
  celestialBodies: CelestialBody[]
): Ship[] {
  return ships.map(ship => applyGravity(ship, celestialBodies));
}

/**
 * Calculates the orbital velocity required for a circular orbit at a given distance.
 * This is a simplified calculation for the hex grid system.
 * 
 * @param distance - Distance from the celestial body (in hexes)
 * @param bodyMass - Effective "mass" of the body (based on gravity well strength)
 * @returns The orbital velocity magnitude
 */
export function calculateOrbitalVelocity(distance: number, bodyMass: number): number {
  if (distance === 0) {
    return 0;
  }
  
  // Simplified orbital mechanics: v = sqrt(GM/r)
  // For hex grid, we use a simplified version
  return Math.sqrt(bodyMass / distance);
}

/**
 * Checks if a ship is in a stable orbit around a celestial body.
 * A stable orbit means the ship's velocity is appropriate for its distance.
 * 
 * @param ship - The ship to check
 * @param body - The celestial body
 * @returns true if the ship is in a stable orbit
 */
export function isInStableOrbit(ship: Ship, body: CelestialBody): boolean {
  const distance = hexDistance(ship.position, body.position);
  
  if (distance === 0) {
    return false; // Can't orbit at zero distance
  }
  
  // Get the strongest gravity zone to estimate body mass
  const strongestZone = body.gravityWells.reduce((prev, current) => 
    current.pullStrength > prev.pullStrength ? current : prev
  );
  
  const bodyMass = strongestZone.pullStrength * strongestZone.radius;
  const requiredVelocity = calculateOrbitalVelocity(distance, bodyMass);
  
  const actualVelocity = Math.sqrt(
    ship.velocity.q * ship.velocity.q + ship.velocity.r * ship.velocity.r
  );
  
  // Allow some tolerance (within 20% of required velocity)
  const tolerance = 0.2;
  const lowerBound = requiredVelocity * (1 - tolerance);
  const upperBound = requiredVelocity * (1 + tolerance);
  
  return actualVelocity >= lowerBound && actualVelocity <= upperBound;
}

/**
 * Calculates the gravity assist (velocity change) a ship gets from passing near a body.
 * This is a simplified model of the slingshot effect.
 * 
 * @param shipVelocity - The ship's current velocity
 * @param shipPosition - The ship's position
 * @param body - The celestial body providing the assist
 * @returns The velocity boost from the gravity assist
 */
export function calculateGravityAssist(
  shipVelocity: VelocityVector,
  shipPosition: HexCoordinate,
  body: CelestialBody
): VelocityVector {
  const zone = getGravityZone(shipPosition, body);
  
  if (!zone) {
    return { q: 0, r: 0 }; // No assist outside gravity zones
  }
  
  // No assist for zero velocity
  const velocityMag = Math.sqrt(shipVelocity.q ** 2 + shipVelocity.r ** 2);
  if (velocityMag === 0) {
    return { q: 0, r: 0 };
  }
  
  // Calculate perpendicular component of velocity (for slingshot)
  const direction = calculateGravityDirection(shipPosition, body.position);
  
  // The assist is proportional to the pull strength and perpendicular velocity
  const perpComponent = {
    q: shipVelocity.q - direction.q,
    r: shipVelocity.r - direction.r,
  };
  
  const assistStrength = zone.pullStrength * 0.5; // Simplified model
  
  return {
    q: perpComponent.q * assistStrength,
    r: perpComponent.r * assistStrength,
  };
}
