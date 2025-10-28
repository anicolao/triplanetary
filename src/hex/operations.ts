// Core hexagonal grid operations

import { HexCoordinate, CubeCoordinate, Point, HexLayout, HEX_DIRECTIONS } from './types';

/**
 * Creates a hex coordinate.
 */
export function createHex(q: number, r: number): HexCoordinate {
  return { q, r };
}

/**
 * Checks if two hex coordinates are equal.
 */
export function hexEquals(a: HexCoordinate, b: HexCoordinate): boolean {
  return a.q === b.q && a.r === b.r;
}

/**
 * Adds two hex coordinates.
 */
export function hexAdd(a: HexCoordinate, b: HexCoordinate): HexCoordinate {
  return { q: a.q + b.q, r: a.r + b.r };
}

/**
 * Subtracts hex coordinate b from a.
 */
export function hexSubtract(a: HexCoordinate, b: HexCoordinate): HexCoordinate {
  return { q: a.q - b.q, r: a.r - b.r };
}

/**
 * Multiplies a hex coordinate by a scalar.
 */
export function hexScale(hex: HexCoordinate, factor: number): HexCoordinate {
  return { q: hex.q * factor, r: hex.r * factor };
}

/**
 * Converts axial coordinates to cube coordinates.
 */
export function axialToCube(hex: HexCoordinate): CubeCoordinate {
  const q = hex.q;
  const r = hex.r;
  const s = -q - r;
  return { q, r, s };
}

/**
 * Converts cube coordinates to axial coordinates.
 */
export function cubeToAxial(cube: CubeCoordinate): HexCoordinate {
  return { q: cube.q, r: cube.r };
}

/**
 * Gets the neighbor hex in a specific direction (0-5).
 */
export function hexNeighbor(hex: HexCoordinate, direction: number): HexCoordinate {
  const dir = HEX_DIRECTIONS[direction % 6];
  return hexAdd(hex, dir);
}

/**
 * Gets all six neighbors of a hex.
 */
export function hexNeighbors(hex: HexCoordinate): HexCoordinate[] {
  return HEX_DIRECTIONS.map((dir) => hexAdd(hex, dir));
}

/**
 * Calculates the Manhattan distance (in hexes) between two hex coordinates.
 * This is the minimum number of hex steps to move from a to b.
 */
export function hexDistance(a: HexCoordinate, b: HexCoordinate): number {
  const ac = axialToCube(a);
  const bc = axialToCube(b);
  return (Math.abs(ac.q - bc.q) + Math.abs(ac.r - bc.r) + Math.abs(ac.s - bc.s)) / 2;
}

/**
 * Rounds fractional cube coordinates to the nearest integer hex.
 */
export function cubeRound(cube: CubeCoordinate): CubeCoordinate {
  let q = Math.round(cube.q);
  let r = Math.round(cube.r);
  let s = Math.round(cube.s);

  const qDiff = Math.abs(q - cube.q);
  const rDiff = Math.abs(r - cube.r);
  const sDiff = Math.abs(s - cube.s);

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  } else {
    s = -q - r;
  }

  return { q, r, s };
}

/**
 * Rounds fractional axial coordinates to the nearest integer hex.
 */
export function hexRound(hex: HexCoordinate): HexCoordinate {
  return cubeToAxial(cubeRound(axialToCube(hex)));
}

/**
 * Linear interpolation between two hex coordinates.
 * t should be between 0 and 1.
 */
export function hexLerp(a: HexCoordinate, b: HexCoordinate, t: number): HexCoordinate {
  return {
    q: a.q * (1 - t) + b.q * t,
    r: a.r * (1 - t) + b.r * t,
  };
}

/**
 * Returns all hexes in a line from a to b.
 */
export function hexLine(a: HexCoordinate, b: HexCoordinate): HexCoordinate[] {
  const distance = hexDistance(a, b);
  const results: HexCoordinate[] = [];

  for (let i = 0; i <= distance; i++) {
    const t = distance === 0 ? 0 : i / distance;
    results.push(hexRound(hexLerp(a, b, t)));
  }

  return results;
}

/**
 * Returns all hexes within a certain range (radius) of a center hex.
 */
export function hexRange(center: HexCoordinate, radius: number): HexCoordinate[] {
  const results: HexCoordinate[] = [];

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      results.push(hexAdd(center, { q, r }));
    }
  }

  return results;
}

/**
 * Returns all hexes exactly at a certain distance (ring) from a center hex.
 */
export function hexRing(center: HexCoordinate, radius: number): HexCoordinate[] {
  if (radius === 0) {
    return [center];
  }

  const results: HexCoordinate[] = [];
  let hex = hexAdd(center, hexScale(HEX_DIRECTIONS[4], radius)); // Start at NW direction

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push(hex);
      hex = hexNeighbor(hex, i);
    }
  }

  return results;
}

/**
 * Converts a hex coordinate to pixel coordinates.
 */
export function hexToPixel(hex: HexCoordinate, layout: HexLayout): Point {
  const size = layout.size;
  const origin = layout.origin;

  let x: number, y: number;

  if (layout.orientation === 'pointy') {
    // Pointy-top orientation
    x = size * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r);
    y = size * ((3 / 2) * hex.r);
  } else {
    // Flat-top orientation
    x = size * ((3 / 2) * hex.q);
    y = size * (Math.sqrt(3) / 2 * hex.q + Math.sqrt(3) * hex.r);
  }

  return { x: x + origin.x, y: y + origin.y };
}

/**
 * Converts pixel coordinates to hex coordinates.
 */
export function pixelToHex(point: Point, layout: HexLayout): HexCoordinate {
  const size = layout.size;
  const origin = layout.origin;

  // Translate to origin-relative coordinates
  const pt = { x: point.x - origin.x, y: point.y - origin.y };

  let q: number, r: number;

  if (layout.orientation === 'pointy') {
    // Pointy-top orientation
    q = ((Math.sqrt(3) / 3) * pt.x - (1 / 3) * pt.y) / size;
    r = ((2 / 3) * pt.y) / size;
  } else {
    // Flat-top orientation
    q = ((2 / 3) * pt.x) / size;
    r = ((-1 / 3) * pt.x + (Math.sqrt(3) / 3) * pt.y) / size;
  }

  return hexRound({ q, r });
}

/**
 * Gets the corners of a hex in pixel coordinates.
 * Returns 6 points starting from the top corner and going clockwise.
 */
export function hexCorners(hex: HexCoordinate, layout: HexLayout): Point[] {
  const center = hexToPixel(hex, layout);
  const corners: Point[] = [];
  const size = layout.size;

  for (let i = 0; i < 6; i++) {
    const angleDeg = layout.orientation === 'pointy' ? 60 * i - 30 : 60 * i;
    const angleRad = (Math.PI / 180) * angleDeg;
    corners.push({
      x: center.x + size * Math.cos(angleRad),
      y: center.y + size * Math.sin(angleRad),
    });
  }

  return corners;
}
