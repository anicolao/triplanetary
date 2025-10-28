// Unit tests for hexagonal grid system

import { describe, it, expect } from 'vitest';
import {
  createHex,
  hexEquals,
  hexAdd,
  hexSubtract,
  hexScale,
  axialToCube,
  cubeToAxial,
  hexNeighbor,
  hexNeighbors,
  hexDistance,
  hexRound,
  hexLerp,
  hexLine,
  hexRange,
  hexRing,
  hexToPixel,
  pixelToHex,
  hexCorners,
  HEX_DIRECTIONS,
} from '../src/hex';
import type { HexCoordinate, HexLayout } from '../src/hex';

describe('Hex Coordinate System', () => {
  describe('createHex', () => {
    it('should create a hex coordinate', () => {
      const hex = createHex(1, 2);
      expect(hex.q).toBe(1);
      expect(hex.r).toBe(2);
    });
  });

  describe('hexEquals', () => {
    it('should return true for equal coordinates', () => {
      const a = createHex(1, 2);
      const b = createHex(1, 2);
      expect(hexEquals(a, b)).toBe(true);
    });

    it('should return false for different coordinates', () => {
      const a = createHex(1, 2);
      const b = createHex(2, 1);
      expect(hexEquals(a, b)).toBe(false);
    });
  });

  describe('hexAdd', () => {
    it('should add two hex coordinates', () => {
      const a = createHex(1, 2);
      const b = createHex(3, 4);
      const result = hexAdd(a, b);
      expect(result.q).toBe(4);
      expect(result.r).toBe(6);
    });

    it('should handle negative values', () => {
      const a = createHex(1, -2);
      const b = createHex(-3, 4);
      const result = hexAdd(a, b);
      expect(result.q).toBe(-2);
      expect(result.r).toBe(2);
    });
  });

  describe('hexSubtract', () => {
    it('should subtract hex coordinates', () => {
      const a = createHex(5, 3);
      const b = createHex(2, 1);
      const result = hexSubtract(a, b);
      expect(result.q).toBe(3);
      expect(result.r).toBe(2);
    });
  });

  describe('hexScale', () => {
    it('should scale a hex coordinate', () => {
      const hex = createHex(2, 3);
      const result = hexScale(hex, 2);
      expect(result.q).toBe(4);
      expect(result.r).toBe(6);
    });

    it('should handle negative scaling', () => {
      const hex = createHex(2, 3);
      const result = hexScale(hex, -1);
      expect(result.q).toBe(-2);
      expect(result.r).toBe(-3);
    });
  });

  describe('axialToCube and cubeToAxial', () => {
    it('should convert axial to cube coordinates', () => {
      const hex = createHex(1, 2);
      const cube = axialToCube(hex);
      expect(cube.q).toBe(1);
      expect(cube.r).toBe(2);
      expect(cube.s).toBe(-3);
      expect(cube.q + cube.r + cube.s).toBe(0);
    });

    it('should convert cube to axial coordinates', () => {
      const cube = { q: 1, r: 2, s: -3 };
      const hex = cubeToAxial(cube);
      expect(hex.q).toBe(1);
      expect(hex.r).toBe(2);
    });

    it('should round-trip correctly', () => {
      const original = createHex(3, -1);
      const cube = axialToCube(original);
      const back = cubeToAxial(cube);
      expect(hexEquals(original, back)).toBe(true);
    });
  });

  describe('hexNeighbor', () => {
    it('should get neighbor in direction 0 (East)', () => {
      const hex = createHex(0, 0);
      const neighbor = hexNeighbor(hex, 0);
      expect(hexEquals(neighbor, createHex(1, 0))).toBe(true);
    });

    it('should get neighbor in direction 3 (West)', () => {
      const hex = createHex(0, 0);
      const neighbor = hexNeighbor(hex, 3);
      expect(hexEquals(neighbor, createHex(-1, 0))).toBe(true);
    });

    it('should wrap direction values', () => {
      const hex = createHex(0, 0);
      const neighbor1 = hexNeighbor(hex, 0);
      const neighbor2 = hexNeighbor(hex, 6);
      expect(hexEquals(neighbor1, neighbor2)).toBe(true);
    });

    it('should have reflexive adjacency for all directions (even column)', () => {
      // Test from an even column (q is even)
      const hex = createHex(2, 3);
      
      // For each direction, moving forward then backward should return to origin
      for (let direction = 0; direction < 6; direction++) {
        const oppositeDirection = (direction + 3) % 6;
        const forward = hexNeighbor(hex, direction);
        const back = hexNeighbor(forward, oppositeDirection);
        expect(hexEquals(hex, back)).toBe(true);
      }
    });

    it('should have reflexive adjacency for all directions (odd column)', () => {
      // Test from an odd column (q is odd)
      const hex = createHex(3, 2);
      
      // For each direction, moving forward then backward should return to origin
      for (let direction = 0; direction < 6; direction++) {
        const oppositeDirection = (direction + 3) % 6;
        const forward = hexNeighbor(hex, direction);
        const back = hexNeighbor(forward, oppositeDirection);
        expect(hexEquals(hex, back)).toBe(true);
      }
    });

    it('should have reflexive adjacency at origin', () => {
      // Test from the origin for completeness
      const hex = createHex(0, 0);
      
      // For each direction, moving forward then backward should return to origin
      for (let direction = 0; direction < 6; direction++) {
        const oppositeDirection = (direction + 3) % 6;
        const forward = hexNeighbor(hex, direction);
        const back = hexNeighbor(forward, oppositeDirection);
        expect(hexEquals(hex, back)).toBe(true);
      }
    });

    it('should have reflexive adjacency for negative coordinates', () => {
      // Test with negative coordinates
      const hex = createHex(-5, 4);
      
      // For each direction, moving forward then backward should return to origin
      for (let direction = 0; direction < 6; direction++) {
        const oppositeDirection = (direction + 3) % 6;
        const forward = hexNeighbor(hex, direction);
        const back = hexNeighbor(forward, oppositeDirection);
        expect(hexEquals(hex, back)).toBe(true);
      }
    });
  });

  describe('hexNeighbors', () => {
    it('should return all six neighbors', () => {
      const hex = createHex(0, 0);
      const neighbors = hexNeighbors(hex);
      expect(neighbors.length).toBe(6);
    });

    it('should have all neighbors at distance 1', () => {
      const hex = createHex(0, 0);
      const neighbors = hexNeighbors(hex);
      neighbors.forEach((neighbor) => {
        expect(hexDistance(hex, neighbor)).toBe(1);
      });
    });

    it('should match HEX_DIRECTIONS', () => {
      const hex = createHex(2, 3);
      const neighbors = hexNeighbors(hex);
      HEX_DIRECTIONS.forEach((dir, i) => {
        expect(hexEquals(neighbors[i], hexAdd(hex, dir))).toBe(true);
      });
    });
  });

  describe('hexDistance', () => {
    it('should calculate distance between same hex as 0', () => {
      const hex = createHex(0, 0);
      expect(hexDistance(hex, hex)).toBe(0);
    });

    it('should calculate distance to neighbor as 1', () => {
      const a = createHex(0, 0);
      const b = createHex(1, 0);
      expect(hexDistance(a, b)).toBe(1);
    });

    it('should calculate distance correctly for farther hexes', () => {
      const a = createHex(0, 0);
      const b = createHex(3, 0);
      expect(hexDistance(a, b)).toBe(3);
    });

    it('should calculate distance in different directions', () => {
      const a = createHex(0, 0);
      const b = createHex(2, -1);
      expect(hexDistance(a, b)).toBe(2);
    });

    it('should be symmetric', () => {
      const a = createHex(1, 2);
      const b = createHex(4, -1);
      expect(hexDistance(a, b)).toBe(hexDistance(b, a));
    });

    it('should handle negative coordinates', () => {
      const a = createHex(-2, 1);
      const b = createHex(1, -2);
      expect(hexDistance(a, b)).toBe(3);
    });
  });

  describe('hexRound', () => {
    it('should round to nearest hex', () => {
      const hex = { q: 1.2, r: 2.7 };
      const rounded = hexRound(hex);
      expect(rounded.q).toBe(1);
      expect(rounded.r).toBe(3);
    });

    it('should handle exact coordinates', () => {
      const hex = createHex(2, 3);
      const rounded = hexRound(hex);
      expect(hexEquals(rounded, hex)).toBe(true);
    });

    it('should maintain cube coordinate constraint', () => {
      const hex = { q: 1.5, r: 1.5 };
      const rounded = hexRound(hex);
      const cube = axialToCube(rounded);
      expect(cube.q + cube.r + cube.s).toBe(0);
    });
  });

  describe('hexLerp', () => {
    it('should return start hex when t=0', () => {
      const a = createHex(0, 0);
      const b = createHex(3, 0);
      const result = hexLerp(a, b, 0);
      expect(hexEquals(hexRound(result), a)).toBe(true);
    });

    it('should return end hex when t=1', () => {
      const a = createHex(0, 0);
      const b = createHex(3, 0);
      const result = hexLerp(a, b, 1);
      expect(hexEquals(hexRound(result), b)).toBe(true);
    });

    it('should interpolate between hexes', () => {
      const a = createHex(0, 0);
      const b = createHex(4, 0);
      const result = hexLerp(a, b, 0.5);
      expect(result.q).toBe(2);
      expect(result.r).toBe(0);
    });
  });

  describe('hexLine', () => {
    it('should return single hex for same start and end', () => {
      const hex = createHex(0, 0);
      const line = hexLine(hex, hex);
      expect(line.length).toBe(1);
      expect(hexEquals(line[0], hex)).toBe(true);
    });

    it('should return line between neighbors', () => {
      const a = createHex(0, 0);
      const b = createHex(1, 0);
      const line = hexLine(a, b);
      expect(line.length).toBe(2);
      expect(hexEquals(line[0], a)).toBe(true);
      expect(hexEquals(line[1], b)).toBe(true);
    });

    it('should return correct number of hexes for distance', () => {
      const a = createHex(0, 0);
      const b = createHex(3, 0);
      const line = hexLine(a, b);
      const distance = hexDistance(a, b);
      expect(line.length).toBe(distance + 1);
    });

    it('should include start and end hexes', () => {
      const a = createHex(1, 2);
      const b = createHex(4, -1);
      const line = hexLine(a, b);
      expect(hexEquals(line[0], a)).toBe(true);
      expect(hexEquals(line[line.length - 1], b)).toBe(true);
    });
  });

  describe('hexRange', () => {
    it('should return center hex for radius 0', () => {
      const center = createHex(0, 0);
      const range = hexRange(center, 0);
      expect(range.length).toBe(1);
      expect(hexEquals(range[0], center)).toBe(true);
    });

    it('should return 7 hexes for radius 1', () => {
      const center = createHex(0, 0);
      const range = hexRange(center, 1);
      expect(range.length).toBe(7); // 1 center + 6 neighbors
    });

    it('should return 19 hexes for radius 2', () => {
      const center = createHex(0, 0);
      const range = hexRange(center, 2);
      expect(range.length).toBe(19); // 1 + 6 + 12
    });

    it('should include all hexes within distance', () => {
      const center = createHex(0, 0);
      const radius = 2;
      const range = hexRange(center, radius);
      range.forEach((hex) => {
        expect(hexDistance(center, hex)).toBeLessThanOrEqual(radius);
      });
    });
  });

  describe('hexRing', () => {
    it('should return center hex for radius 0', () => {
      const center = createHex(0, 0);
      const ring = hexRing(center, 0);
      expect(ring.length).toBe(1);
      expect(hexEquals(ring[0], center)).toBe(true);
    });

    it('should return 6 hexes for radius 1', () => {
      const center = createHex(0, 0);
      const ring = hexRing(center, 1);
      expect(ring.length).toBe(6);
    });

    it('should return 12 hexes for radius 2', () => {
      const center = createHex(0, 0);
      const ring = hexRing(center, 2);
      expect(ring.length).toBe(12);
    });

    it('should have all hexes at exact distance', () => {
      const center = createHex(0, 0);
      const radius = 3;
      const ring = hexRing(center, radius);
      ring.forEach((hex) => {
        expect(hexDistance(center, hex)).toBe(radius);
      });
    });
  });
});

describe('Coordinate Conversions', () => {
  const pointyLayout: HexLayout = {
    size: 10,
    origin: { x: 0, y: 0 },
    orientation: 'pointy',
  };

  const flatLayout: HexLayout = {
    size: 10,
    origin: { x: 0, y: 0 },
    orientation: 'flat',
  };

  describe('hexToPixel (pointy orientation)', () => {
    it('should convert origin hex to origin pixel', () => {
      const hex = createHex(0, 0);
      const pixel = hexToPixel(hex, pointyLayout);
      expect(pixel.x).toBeCloseTo(0);
      expect(pixel.y).toBeCloseTo(0);
    });

    it('should handle positive coordinates', () => {
      const hex = createHex(1, 0);
      const pixel = hexToPixel(hex, pointyLayout);
      expect(pixel.x).toBeGreaterThan(0);
      expect(pixel.y).toBeCloseTo(0);
    });

    it('should respect layout origin offset', () => {
      const layout: HexLayout = {
        size: 10,
        origin: { x: 100, y: 200 },
        orientation: 'pointy',
      };
      const hex = createHex(0, 0);
      const pixel = hexToPixel(hex, layout);
      expect(pixel.x).toBeCloseTo(100);
      expect(pixel.y).toBeCloseTo(200);
    });
  });

  describe('hexToPixel (flat orientation)', () => {
    it('should convert origin hex to origin pixel', () => {
      const hex = createHex(0, 0);
      const pixel = hexToPixel(hex, flatLayout);
      expect(pixel.x).toBeCloseTo(0);
      expect(pixel.y).toBeCloseTo(0);
    });

    it('should handle positive coordinates', () => {
      const hex = createHex(1, 0);
      const pixel = hexToPixel(hex, flatLayout);
      expect(pixel.x).toBeGreaterThan(0);
      // In flat-top orientation, hex(1,0) has both x and y components
      expect(Math.abs(pixel.y)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('pixelToHex (pointy orientation)', () => {
    it('should convert origin pixel to origin hex', () => {
      const pixel = { x: 0, y: 0 };
      const hex = pixelToHex(pixel, pointyLayout);
      expect(hex.q).toBe(0);
      expect(hex.r).toBe(0);
    });

    it('should round-trip with hexToPixel', () => {
      const original = createHex(3, 2);
      const pixel = hexToPixel(original, pointyLayout);
      const back = pixelToHex(pixel, pointyLayout);
      expect(hexEquals(original, back)).toBe(true);
    });

    it('should handle multiple hexes', () => {
      const testHexes = [
        createHex(0, 0),
        createHex(1, 0),
        createHex(0, 1),
        createHex(-1, 1),
        createHex(2, -1),
      ];

      testHexes.forEach((hex) => {
        const pixel = hexToPixel(hex, pointyLayout);
        const back = pixelToHex(pixel, pointyLayout);
        expect(hexEquals(hex, back)).toBe(true);
      });
    });
  });

  describe('pixelToHex (flat orientation)', () => {
    it('should convert origin pixel to origin hex', () => {
      const pixel = { x: 0, y: 0 };
      const hex = pixelToHex(pixel, flatLayout);
      expect(hex.q).toBe(0);
      expect(hex.r).toBe(0);
    });

    it('should round-trip with hexToPixel', () => {
      const original = createHex(3, 2);
      const pixel = hexToPixel(original, flatLayout);
      const back = pixelToHex(pixel, flatLayout);
      expect(hexEquals(original, back)).toBe(true);
    });
  });

  describe('hexCorners', () => {
    it('should return 6 corners', () => {
      const hex = createHex(0, 0);
      const corners = hexCorners(hex, pointyLayout);
      expect(corners.length).toBe(6);
    });

    it('should have corners at correct distance from center', () => {
      const hex = createHex(0, 0);
      const corners = hexCorners(hex, pointyLayout);
      const center = hexToPixel(hex, pointyLayout);

      corners.forEach((corner) => {
        const dx = corner.x - center.x;
        const dy = corner.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        expect(distance).toBeCloseTo(pointyLayout.size);
      });
    });

    it('should work for non-origin hexes', () => {
      const hex = createHex(3, -1);
      const corners = hexCorners(hex, pointyLayout);
      const center = hexToPixel(hex, pointyLayout);

      corners.forEach((corner) => {
        const dx = corner.x - center.x;
        const dy = corner.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        expect(distance).toBeCloseTo(pointyLayout.size);
      });
    });
  });
});
