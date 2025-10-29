// Vector mathematics for physics calculations

import { HexCoordinate } from '../hex/types';
import { VelocityVector } from '../ship/types';

/**
 * Calculates the magnitude (length) of a velocity vector.
 * In hex coordinates, this represents the distance the ship will travel.
 */
export function vectorMagnitude(vector: VelocityVector): number {
  return Math.sqrt(vector.q * vector.q + vector.r * vector.r);
}

/**
 * Normalizes a velocity vector to unit length.
 * Returns a vector pointing in the same direction but with magnitude 1.
 * Returns { q: 0, r: 0 } if the input vector has zero magnitude.
 */
export function vectorNormalize(vector: VelocityVector): VelocityVector {
  const magnitude = vectorMagnitude(vector);
  if (magnitude === 0) {
    return { q: 0, r: 0 };
  }
  return {
    q: vector.q / magnitude,
    r: vector.r / magnitude,
  };
}

/**
 * Adds two velocity vectors.
 */
export function vectorAdd(a: VelocityVector, b: VelocityVector): VelocityVector {
  return {
    q: a.q + b.q,
    r: a.r + b.r,
  };
}

/**
 * Subtracts velocity vector b from a.
 */
export function vectorSubtract(a: VelocityVector, b: VelocityVector): VelocityVector {
  return {
    q: a.q - b.q,
    r: a.r - b.r,
  };
}

/**
 * Scales a velocity vector by a scalar factor.
 */
export function vectorScale(vector: VelocityVector, scale: number): VelocityVector {
  return {
    q: vector.q * scale,
    r: vector.r * scale,
  };
}

/**
 * Converts a velocity vector to a hex coordinate offset.
 * The velocity vector represents the change in position per turn.
 */
export function vectorToHex(vector: VelocityVector): HexCoordinate {
  return {
    q: Math.round(vector.q),
    r: Math.round(vector.r),
  };
}

/**
 * Creates a velocity vector from a hex coordinate offset.
 */
export function hexToVector(hex: HexCoordinate): VelocityVector {
  return {
    q: hex.q,
    r: hex.r,
  };
}

/**
 * Calculates the dot product of two velocity vectors.
 * Useful for determining angle relationships between vectors.
 */
export function vectorDot(a: VelocityVector, b: VelocityVector): number {
  return a.q * b.q + a.r * b.r;
}
