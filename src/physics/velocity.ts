// Velocity management for ship physics

import { Ship, VelocityVector } from '../ship/types';
import { vectorAdd, vectorToHex } from './vector';

/**
 * Applies thrust to modify a ship's velocity.
 * Each thrust point allows the ship to change its velocity by one hex in any direction.
 * 
 * @param currentVelocity - The ship's current velocity vector
 * @param thrustVector - The thrust application as a velocity change
 * @param availableThrust - The number of thrust points available
 * @returns The new velocity vector and remaining thrust, or null if invalid
 */
export function applyThrust(
  currentVelocity: VelocityVector,
  thrustVector: VelocityVector,
  availableThrust: number
): { velocity: VelocityVector; remainingThrust: number } | null {
  // Calculate the magnitude of thrust application (rounded to nearest hex)
  const thrustHex = vectorToHex(thrustVector);
  const thrustMagnitude = Math.abs(thrustHex.q) + Math.abs(thrustHex.r);
  
  // Check if we have enough thrust points
  if (thrustMagnitude > availableThrust) {
    return null;
  }
  
  // Apply the thrust to velocity
  const newVelocity = vectorAdd(currentVelocity, thrustVector);
  
  return {
    velocity: newVelocity,
    remainingThrust: availableThrust - thrustMagnitude,
  };
}

/**
 * Validates that a velocity is within acceptable limits.
 * In Triplanetary, there's generally no hard velocity limit,
 * but this function can be used for specific scenarios or game modes.
 * 
 * @param velocity - The velocity to validate
 * @param maxVelocity - Optional maximum velocity magnitude
 * @returns true if velocity is valid, false otherwise
 */
export function isValidVelocity(velocity: VelocityVector, maxVelocity?: number): boolean {
  if (maxVelocity === undefined) {
    return true; // No limit
  }
  
  const magnitude = Math.sqrt(velocity.q * velocity.q + velocity.r * velocity.r);
  return magnitude <= maxVelocity;
}

/**
 * Resets a ship's thrust points at the start of a new turn.
 * 
 * @param ship - The ship to reset thrust for
 * @returns A new ship object with thrust points reset to maximum
 */
export function resetThrust(ship: Ship): Ship {
  return {
    ...ship,
    remainingThrust: ship.stats.maxThrust,
  };
}

/**
 * Updates a ship's velocity and thrust after thrust application.
 * 
 * @param ship - The ship to update
 * @param newVelocity - The new velocity vector
 * @param thrustUsed - The number of thrust points used
 * @returns A new ship object with updated velocity and remaining thrust
 */
export function updateShipVelocity(
  ship: Ship,
  newVelocity: VelocityVector,
  thrustUsed: number
): Ship {
  return {
    ...ship,
    velocity: newVelocity,
    remainingThrust: ship.remainingThrust - thrustUsed,
  };
}

/**
 * Calculates the thrust required to achieve a target velocity from current velocity.
 * 
 * @param currentVelocity - The ship's current velocity
 * @param targetVelocity - The desired velocity
 * @returns The thrust vector needed and its magnitude
 */
export function calculateRequiredThrust(
  currentVelocity: VelocityVector,
  targetVelocity: VelocityVector
): { thrustVector: VelocityVector; thrustRequired: number } {
  const thrustVector: VelocityVector = {
    q: targetVelocity.q - currentVelocity.q,
    r: targetVelocity.r - currentVelocity.r,
  };
  
  const thrustHex = vectorToHex(thrustVector);
  const thrustRequired = Math.abs(thrustHex.q) + Math.abs(thrustHex.r);
  
  return { thrustVector, thrustRequired };
}
