// Gravity simulation for celestial bodies per 2018 rules
// Gravity is represented by arrows in hexes adjacent to celestial bodies.
// Each gravity hex applies exactly one hex of acceleration in the arrow direction.
// Effects are applied on the turn AFTER entering the hex (one-turn delay).

import { Ship, VelocityVector } from '../ship/types';
import { HexCoordinate } from '../hex/types';
import { CelestialBody, GravityWellZone, GravityHex } from '../celestial/types';
import { hexDistance, hexAdd } from '../hex/operations';
import { vectorAdd } from './vector';
import { getGravityHexesAt } from '../celestial/gravityHexes';

/**
 * Legacy function - Determines which gravity well zone a position is in.
 * Returns null if the position is outside all gravity zones.
 * 
 * @deprecated Use new hex-based gravity system instead
 */
export function getGravityZone(
  position: HexCoordinate,
  body: CelestialBody
): GravityWellZone | null {
  if (!body.gravityWells) {
    return null;
  }
  
  const distance = hexDistance(position, body.position);
  
  // Check zones from innermost to outermost
  for (const zone of body.gravityWells) {
    if (distance <= zone.radius) {
      return zone;
    }
  }
  
  return null;
}

/**
 * Legacy function - Calculates the direction vector from a position toward a celestial body.
 * 
 * @deprecated Use new hex-based gravity system instead
 */
export function calculateGravityDirection(
  position: HexCoordinate,
  bodyPosition: HexCoordinate
): VelocityVector {
  const direction: VelocityVector = {
    q: bodyPosition.q - position.q,
    r: bodyPosition.r - position.r,
  };
  
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
 * Legacy function - Calculates gravitational force for zone-based system.
 * 
 * @deprecated Use new hex-based gravity system instead
 */
export function calculateGravitationalForce(
  shipPosition: HexCoordinate,
  body: CelestialBody
): VelocityVector {
  const zone = getGravityZone(shipPosition, body);
  
  if (!zone) {
    return { q: 0, r: 0 };
  }
  
  const direction = calculateGravityDirection(shipPosition, body.position);
  
  return {
    q: direction.q * zone.pullStrength,
    r: direction.r * zone.pullStrength,
  };
}

/**
 * Gets all gravity hexes from all celestial bodies.
 * 
 * @param celestialBodies - Array of celestial bodies
 * @returns Array of all gravity hexes
 */
export function getAllGravityHexes(celestialBodies: CelestialBody[]): GravityHex[] {
  const allGravityHexes: GravityHex[] = [];
  
  for (const body of celestialBodies) {
    allGravityHexes.push(...body.gravityHexes);
  }
  
  return allGravityHexes;
}

/**
 * Detects which gravity hexes a ship enters during its movement.
 * This is called during movement execution to track gravity hex entry.
 * 
 * @param newPosition - The ship's new position after movement
 * @param gravityHexes - Array of all gravity hexes
 * @returns Array of gravity hexes entered
 */
export function detectGravityHexEntry(
  newPosition: HexCoordinate,
  gravityHexes: GravityHex[]
): HexCoordinate[] {
  const hexesEntered = getGravityHexesAt(newPosition, gravityHexes);
  return hexesEntered.map(gh => gh.position);
}

/**
 * Applies gravity effects from previously entered gravity hexes (one-turn delay).
 * Each gravity hex shifts the endpoint by exactly one hex in the arrow direction.
 * Multiple gravity hexes are applied cumulatively in sequence.
 * 
 * @param ship - The ship to apply gravity to
 * @param celestialBodies - Array of celestial bodies
 * @param weakGravityChoices - Map of weak gravity hex positions to whether to use them
 * @returns Updated ship with gravity effects applied
 */
export function applyGravityEffects(
  ship: Ship,
  celestialBodies: CelestialBody[],
  weakGravityChoices: Map<string, boolean> = new Map()
): Ship {
  if (ship.destroyed || !ship.gravityHexesEntered || ship.gravityHexesEntered.length === 0) {
    return ship;
  }
  
  const allGravityHexes = getAllGravityHexes(celestialBodies);
  let cumulativeShift: HexCoordinate = { q: 0, r: 0 };
  
  // Apply each gravity hex effect in sequence
  for (const enteredHexPos of ship.gravityHexesEntered) {
    const gravityHexes = getGravityHexesAt(enteredHexPos, allGravityHexes);
    
    for (const gravityHex of gravityHexes) {
      // Check if this is weak gravity and player chose to ignore it
      if (gravityHex.isWeak) {
        const key = `${gravityHex.position.q},${gravityHex.position.r}`;
        const useWeakGravity = weakGravityChoices.get(key);
        if (useWeakGravity === false) {
          continue; // Player chose to ignore this weak gravity hex
        }
      }
      
      // Each gravity hex shifts endpoint by exactly one hex in arrow direction
      cumulativeShift = hexAdd(cumulativeShift, gravityHex.direction);
    }
  }
  
  // Apply cumulative shift to velocity
  const newVelocity: VelocityVector = {
    q: ship.velocity.q + cumulativeShift.q,
    r: ship.velocity.r + cumulativeShift.r,
  };
  
  return {
    ...ship,
    velocity: newVelocity,
    gravityHexesEntered: [], // Clear after applying
  };
}

/**
 * Legacy function - Applies gravity from all celestial bodies using old zone system.
 * 
 * @deprecated Use applyGravityEffects instead
 */
export function applyGravity(ship: Ship, celestialBodies: CelestialBody[]): Ship {
  if (ship.destroyed) {
    return ship;
  }
  
  let newVelocity = { ...ship.velocity };
  
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
 * Legacy function - Applies gravity to all ships using old zone system.
 * 
 * @deprecated Use applyGravityEffects instead
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
  
  // Get the strongest gravity zone to estimate body mass (legacy function)
  if (!body.gravityWells || body.gravityWells.length === 0) {
    return false; // No gravity wells to orbit around
  }
  
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
