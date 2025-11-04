// Gravity hex generation for celestial bodies per 2018 rules

import { HexCoordinate } from '../hex/types';
import { hexNeighbors, hexSubtract } from '../hex/operations';
import { GravityHex } from './types';

/**
 * Generates gravity hexes for a celestial body.
 * Gravity hexes are in the hexes adjacent to the body, with arrows pointing toward it.
 * 
 * @param bodyPosition - The position of the celestial body
 * @param isWeak - Whether this is weak gravity (e.g., Luna, Io)
 * @returns Array of gravity hexes
 */
export function generateGravityHexes(
  bodyPosition: HexCoordinate,
  isWeak: boolean = false
): GravityHex[] {
  const neighbors = hexNeighbors(bodyPosition);
  
  return neighbors.map(neighborPos => {
    // Direction points from neighbor toward the body (inward)
    const direction = hexSubtract(bodyPosition, neighborPos);
    
    return {
      position: neighborPos,
      direction,
      isWeak,
    };
  });
}

/**
 * Finds all gravity hexes at a specific position from an array of gravity hexes.
 * 
 * @param position - The position to check
 * @param gravityHexes - Array of all gravity hexes
 * @returns Array of gravity hexes at that position
 */
export function getGravityHexesAt(
  position: HexCoordinate,
  gravityHexes: GravityHex[]
): GravityHex[] {
  return gravityHexes.filter(gh => 
    gh.position.q === position.q && gh.position.r === position.r
  );
}

/**
 * Checks if a position has any gravity hexes.
 * 
 * @param position - The position to check
 * @param gravityHexes - Array of all gravity hexes
 * @returns true if position has gravity hexes
 */
export function hasGravityAt(
  position: HexCoordinate,
  gravityHexes: GravityHex[]
): boolean {
  return getGravityHexesAt(position, gravityHexes).length > 0;
}

/**
 * Normalizes a direction vector to ensure it represents a valid hex direction.
 * This is useful for rendering arrows.
 * 
 * @param direction - The direction vector
 * @returns Normalized direction
 */
export function normalizeDirection(direction: HexCoordinate): HexCoordinate {
  // For single-hex directions, no normalization needed
  if (Math.abs(direction.q) <= 1 && Math.abs(direction.r) <= 1) {
    return direction;
  }
  
  // For larger directions, scale to unit magnitude
  const magnitude = Math.sqrt(direction.q * direction.q + direction.r * direction.r);
  if (magnitude === 0) {
    return { q: 0, r: 0 };
  }
  
  return {
    q: direction.q / magnitude,
    r: direction.r / magnitude,
  };
}
