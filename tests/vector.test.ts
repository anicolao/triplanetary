// Unit tests for vector mathematics

import { describe, it, expect } from 'vitest';
import {
  vectorMagnitude,
  vectorNormalize,
  vectorAdd,
  vectorSubtract,
  vectorScale,
  vectorToHex,
  hexToVector,
  vectorDot,
} from '../src/physics/vector';

describe('Vector Mathematics', () => {
  describe('vectorMagnitude', () => {
    it('should calculate magnitude of zero vector', () => {
      expect(vectorMagnitude({ q: 0, r: 0 })).toBe(0);
    });

    it('should calculate magnitude of unit vectors', () => {
      expect(vectorMagnitude({ q: 1, r: 0 })).toBe(1);
      expect(vectorMagnitude({ q: 0, r: 1 })).toBe(1);
    });

    it('should calculate magnitude of diagonal vector', () => {
      const magnitude = vectorMagnitude({ q: 3, r: 4 });
      expect(magnitude).toBe(5); // 3-4-5 triangle
    });

    it('should calculate magnitude of negative vector', () => {
      expect(vectorMagnitude({ q: -3, r: -4 })).toBe(5);
    });
  });

  describe('vectorNormalize', () => {
    it('should normalize zero vector to zero', () => {
      const result = vectorNormalize({ q: 0, r: 0 });
      expect(result).toEqual({ q: 0, r: 0 });
    });

    it('should normalize unit vector to itself', () => {
      const result = vectorNormalize({ q: 1, r: 0 });
      expect(result.q).toBeCloseTo(1, 5);
      expect(result.r).toBeCloseTo(0, 5);
    });

    it('should normalize to unit length', () => {
      const result = vectorNormalize({ q: 3, r: 4 });
      expect(result.q).toBeCloseTo(0.6, 5);
      expect(result.r).toBeCloseTo(0.8, 5);
      expect(vectorMagnitude(result)).toBeCloseTo(1, 5);
    });

    it('should preserve direction', () => {
      const input = { q: 5, r: 5 };
      const result = vectorNormalize(input);
      expect(result.q).toBeCloseTo(result.r, 5); // Should stay equal
    });
  });

  describe('vectorAdd', () => {
    it('should add zero vectors', () => {
      const result = vectorAdd({ q: 0, r: 0 }, { q: 0, r: 0 });
      expect(result).toEqual({ q: 0, r: 0 });
    });

    it('should add positive vectors', () => {
      const result = vectorAdd({ q: 1, r: 2 }, { q: 3, r: 4 });
      expect(result).toEqual({ q: 4, r: 6 });
    });

    it('should add negative vectors', () => {
      const result = vectorAdd({ q: -1, r: -2 }, { q: -3, r: -4 });
      expect(result).toEqual({ q: -4, r: -6 });
    });

    it('should add mixed sign vectors', () => {
      const result = vectorAdd({ q: 5, r: -3 }, { q: -2, r: 7 });
      expect(result).toEqual({ q: 3, r: 4 });
    });
  });

  describe('vectorSubtract', () => {
    it('should subtract zero vectors', () => {
      const result = vectorSubtract({ q: 5, r: 3 }, { q: 0, r: 0 });
      expect(result).toEqual({ q: 5, r: 3 });
    });

    it('should subtract equal vectors to zero', () => {
      const result = vectorSubtract({ q: 5, r: 3 }, { q: 5, r: 3 });
      expect(result).toEqual({ q: 0, r: 0 });
    });

    it('should subtract vectors correctly', () => {
      const result = vectorSubtract({ q: 7, r: 9 }, { q: 2, r: 3 });
      expect(result).toEqual({ q: 5, r: 6 });
    });

    it('should handle negative results', () => {
      const result = vectorSubtract({ q: 2, r: 3 }, { q: 7, r: 9 });
      expect(result).toEqual({ q: -5, r: -6 });
    });
  });

  describe('vectorScale', () => {
    it('should scale by zero to get zero vector', () => {
      const result = vectorScale({ q: 5, r: 3 }, 0);
      expect(result).toEqual({ q: 0, r: 0 });
    });

    it('should scale by one to get same vector', () => {
      const result = vectorScale({ q: 5, r: 3 }, 1);
      expect(result).toEqual({ q: 5, r: 3 });
    });

    it('should scale by positive factor', () => {
      const result = vectorScale({ q: 2, r: 3 }, 3);
      expect(result).toEqual({ q: 6, r: 9 });
    });

    it('should scale by negative factor', () => {
      const result = vectorScale({ q: 2, r: 3 }, -2);
      expect(result).toEqual({ q: -4, r: -6 });
    });

    it('should scale by fractional factor', () => {
      const result = vectorScale({ q: 10, r: 20 }, 0.5);
      expect(result).toEqual({ q: 5, r: 10 });
    });
  });

  describe('vectorToHex', () => {
    it('should convert integer vector to hex', () => {
      const result = vectorToHex({ q: 3, r: 4 });
      expect(result).toEqual({ q: 3, r: 4 });
    });

    it('should round fractional vector to nearest hex', () => {
      const result = vectorToHex({ q: 3.4, r: 4.6 });
      expect(result).toEqual({ q: 3, r: 5 });
    });

    it('should round negative values correctly', () => {
      const result = vectorToHex({ q: -2.3, r: -2.7 });
      expect(result).toEqual({ q: -2, r: -3 });
    });

    it('should round 0.5 up', () => {
      const result = vectorToHex({ q: 2.5, r: 3.5 });
      expect(result).toEqual({ q: 3, r: 4 });
    });
  });

  describe('hexToVector', () => {
    it('should convert hex to vector', () => {
      const result = hexToVector({ q: 3, r: 4 });
      expect(result).toEqual({ q: 3, r: 4 });
    });

    it('should convert negative hex to vector', () => {
      const result = hexToVector({ q: -2, r: -5 });
      expect(result).toEqual({ q: -2, r: -5 });
    });

    it('should convert zero hex to zero vector', () => {
      const result = hexToVector({ q: 0, r: 0 });
      expect(result).toEqual({ q: 0, r: 0 });
    });
  });

  describe('vectorDot', () => {
    it('should calculate dot product of perpendicular vectors', () => {
      const result = vectorDot({ q: 1, r: 0 }, { q: 0, r: 1 });
      expect(result).toBe(0);
    });

    it('should calculate dot product of parallel vectors', () => {
      const result = vectorDot({ q: 2, r: 3 }, { q: 4, r: 6 });
      expect(result).toBe(26); // 2*4 + 3*6
    });

    it('should calculate dot product of opposite vectors', () => {
      const result = vectorDot({ q: 1, r: 1 }, { q: -1, r: -1 });
      expect(result).toBe(-2); // 1*(-1) + 1*(-1)
    });

    it('should calculate dot product with zero vector', () => {
      const result = vectorDot({ q: 5, r: 7 }, { q: 0, r: 0 });
      expect(result).toBe(0);
    });
  });

  describe('round-trip conversions', () => {
    it('should preserve integer values through hex-vector-hex conversion', () => {
      const original = { q: 3, r: 4 };
      const vector = hexToVector(original);
      const result = vectorToHex(vector);
      expect(result).toEqual(original);
    });
  });
});
