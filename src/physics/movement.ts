// Movement calculation and path planning for ships

import { Ship, VelocityVector } from '../ship/types';
import { HexCoordinate } from '../hex/types';
import { hexAdd, hexLine, hexEquals } from '../hex/operations';
import { vectorToHex } from './vector';

/**
 * Calculates the destination hex for a ship based on current position and velocity.
 * 
 * @param position - Current position of the ship
 * @param velocity - Current velocity vector of the ship
 * @returns The destination hex coordinate
 */
export function calculateDestination(
  position: HexCoordinate,
  velocity: VelocityVector
): HexCoordinate {
  const velocityHex = vectorToHex(velocity);
  return hexAdd(position, velocityHex);
}

/**
 * Calculates the path a ship will take from its current position following its velocity.
 * Returns all hexes the ship passes through.
 * 
 * @param position - Starting position
 * @param velocity - Velocity vector
 * @returns Array of hex coordinates representing the path
 */
export function calculateMovementPath(
  position: HexCoordinate,
  velocity: VelocityVector
): HexCoordinate[] {
  const destination = calculateDestination(position, velocity);
  return hexLine(position, destination);
}

/**
 * Checks if two ships will collide based on their destination positions.
 * 
 * @param ship1 - First ship
 * @param ship2 - Second ship
 * @returns true if ships will be in the same hex after movement
 */
export function checkCollision(ship1: Ship, ship2: Ship): boolean {
  const dest1 = calculateDestination(ship1.position, ship1.velocity);
  const dest2 = calculateDestination(ship2.position, ship2.velocity);
  return hexEquals(dest1, dest2);
}

/**
 * Detects all collisions among a group of ships after they move.
 * 
 * @param ships - Array of ships to check
 * @returns Array of collision pairs (ship IDs)
 */
export function detectCollisions(ships: Ship[]): Array<[string, string]> {
  const collisions: Array<[string, string]> = [];
  
  // Build a map of destinations to ship IDs
  const destinationMap = new Map<string, string[]>();
  
  for (const ship of ships) {
    if (ship.destroyed) continue;
    
    const destination = calculateDestination(ship.position, ship.velocity);
    const key = `${destination.q},${destination.r}`;
    
    if (!destinationMap.has(key)) {
      destinationMap.set(key, []);
    }
    destinationMap.get(key)!.push(ship.id);
  }
  
  // Find all hexes with multiple ships
  for (const [, shipIds] of destinationMap) {
    if (shipIds.length > 1) {
      // Add all pairs of colliding ships
      for (let i = 0; i < shipIds.length; i++) {
        for (let j = i + 1; j < shipIds.length; j++) {
          collisions.push([shipIds[i], shipIds[j]]);
        }
      }
    }
  }
  
  return collisions;
}

/**
 * Validates that a movement is legal (doesn't violate game rules).
 * For now, all movements following physics are legal.
 * This can be extended to check for map boundaries, obstacles, etc.
 * 
 * @param position - Starting position
 * @param velocity - Velocity vector
 * @returns true if the movement is legal
 */
export function isValidMovement(
  position: HexCoordinate,
  velocity: VelocityVector
): boolean {
  // Basic validation - ensure we can calculate a destination
  try {
    calculateDestination(position, velocity);
    return true;
  } catch {
    return false;
  }
}

/**
 * Updates a ship's position based on its velocity.
 * 
 * @param ship - The ship to move
 * @returns A new ship object with updated position
 */
export function executeMovement(ship: Ship): Ship {
  if (ship.destroyed) {
    return ship;
  }
  
  const newPosition = calculateDestination(ship.position, ship.velocity);
  
  return {
    ...ship,
    position: newPosition,
  };
}

/**
 * Executes movement for all ships simultaneously.
 * 
 * @param ships - Array of ships to move
 * @returns Array of ships with updated positions
 */
export function executeMultiShipMovement(ships: Ship[]): Ship[] {
  return ships.map(ship => executeMovement(ship));
}

/**
 * Calculates all reachable hexes from a position given current velocity and available thrust.
 * This is used for highlighting possible destinations during the Plot Phase.
 * 
 * @param position - Current position
 * @param velocity - Current velocity
 * @param availableThrust - Number of thrust points available
 * @returns Map of reachable hex coordinates to required thrust and resulting velocity
 */
export function calculateReachableHexes(
  position: HexCoordinate,
  velocity: VelocityVector,
  availableThrust: number
): Map<string, { hex: HexCoordinate; thrustRequired: number; resultingVelocity: VelocityVector }> {
  const reachable = new Map<string, { hex: HexCoordinate; thrustRequired: number; resultingVelocity: VelocityVector }>();
  
  // Try all possible thrust applications within the available thrust
  for (let dq = -availableThrust; dq <= availableThrust; dq++) {
    for (let dr = -availableThrust; dr <= availableThrust; dr++) {
      const thrustMagnitude = Math.abs(dq) + Math.abs(dr);
      
      if (thrustMagnitude <= availableThrust) {
        const resultingVelocity: VelocityVector = {
          q: velocity.q + dq,
          r: velocity.r + dr,
        };
        
        const destination = calculateDestination(position, resultingVelocity);
        const key = `${destination.q},${destination.r}`;
        
        // Only add if we haven't seen this hex yet, or if this requires less thrust
        if (!reachable.has(key) || reachable.get(key)!.thrustRequired > thrustMagnitude) {
          reachable.set(key, {
            hex: destination,
            thrustRequired: thrustMagnitude,
            resultingVelocity,
          });
        }
      }
    }
  }
  
  return reachable;
}
