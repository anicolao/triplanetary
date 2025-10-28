// Type definitions for hexagonal grid system

/**
 * Axial coordinates for hexagonal grid.
 * Uses the "pointy-top" orientation with q (column) and r (row) axes.
 * 
 * The q axis points to the right, and the r axis points down and to the left.
 * This creates a coordinate system where:
 * - q increases to the right
 * - r increases down and to the left
 * - s = -q - r (derived third axis for cube coordinates)
 */
export interface HexCoordinate {
  q: number;  // Column (x-like axis)
  r: number;  // Row (y-like axis)
}

/**
 * Cube coordinates for hexagonal grid.
 * Uses three coordinates (q, r, s) where q + r + s = 0.
 * Useful for certain hex operations like rotation and reflection.
 */
export interface CubeCoordinate {
  q: number;
  r: number;
  s: number;
}

/**
 * Pixel coordinates for screen rendering.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Configuration for hex grid layout.
 */
export interface HexLayout {
  /** Size of hex (distance from center to corner) */
  size: number;
  /** Origin point in pixel coordinates */
  origin: Point;
  /** Orientation: 'pointy' for pointy-top hexes, 'flat' for flat-top hexes */
  orientation: 'pointy' | 'flat';
}

/**
 * Direction vectors for the six neighboring hexes in axial coordinates.
 * For pointy-top hexagons, the directions are:
 * 0: East (right)
 * 1: Southeast
 * 2: Southwest
 * 3: West (left)
 * 4: Northwest
 * 5: Northeast
 */
export const HEX_DIRECTIONS: HexCoordinate[] = [
  { q: 1, r: 0 },   // E
  { q: 0, r: 1 },   // SE
  { q: -1, r: 1 },  // SW
  { q: -1, r: 0 },  // W
  { q: 0, r: -1 },  // NW
  { q: 1, r: -1 },  // NE
];
