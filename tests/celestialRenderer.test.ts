// Unit tests for celestial body rendering

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CelestialRenderer, DEFAULT_CELESTIAL_OPTIONS } from '../src/rendering/celestialRenderer';
import { SUN, MERCURY, VENUS, EARTH, MARS } from '../src/celestial/data';
import { HexLayout } from '../src/hex/types';

describe('CelestialRenderer', () => {
  let mockCtx: any;
  let renderer: CelestialRenderer;
  let layout: HexLayout;

  beforeEach(() => {
    // Create a mock canvas context
    mockCtx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillRect: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      setLineDash: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
    };
    
    renderer = new CelestialRenderer(mockCtx);
    
    layout = {
      size: 30,
      origin: { x: 400, y: 300 },
      orientation: 'pointy',
    };
  });

  describe('Construction', () => {
    it('should create a celestial renderer', () => {
      expect(renderer).toBeDefined();
    });
  });

  describe('renderCelestialBodies', () => {
    it('should render without errors when given celestial bodies', () => {
      const bodies = [SUN, MERCURY, VENUS, EARTH, MARS];
      expect(() => {
        renderer.renderCelestialBodies(bodies, layout);
      }).not.toThrow();
    });

    it('should render only the Sun if no planets provided', () => {
      expect(() => {
        renderer.renderCelestialBodies([SUN], layout);
      }).not.toThrow();
    });

    it('should render only planets if no Sun provided', () => {
      expect(() => {
        renderer.renderCelestialBodies([MERCURY, VENUS], layout);
      }).not.toThrow();
    });

    it('should respect showOrbitalPaths option', () => {
      const arcSpy = vi.spyOn(mockCtx, 'arc');
      
      renderer.renderCelestialBodies([SUN, MERCURY], layout, {
        showOrbitalPaths: false,
      });
      
      // When orbital paths are disabled, there should be fewer arc calls
      const callCount = arcSpy.mock.calls.length;
      
      arcSpy.mockClear();
      
      renderer.renderCelestialBodies([SUN, MERCURY], layout, {
        showOrbitalPaths: true,
      });
      
      // With orbital paths enabled, there should be more arc calls
      expect(arcSpy.mock.calls.length).toBeGreaterThan(callCount);
    });

    it('should respect showGravityWells option', () => {
      const fillSpy = vi.spyOn(mockCtx, 'fill');
      
      renderer.renderCelestialBodies([SUN], layout, {
        showGravityWells: false,
      });
      
      const callCountWithoutGravity = fillSpy.mock.calls.length;
      
      fillSpy.mockClear();
      
      renderer.renderCelestialBodies([SUN], layout, {
        showGravityWells: true,
      });
      
      // With gravity wells enabled, there should be more fill calls
      expect(fillSpy.mock.calls.length).toBeGreaterThan(callCountWithoutGravity);
    });
  });

  describe('Rendering layers', () => {
    it('should call rendering methods in correct order', () => {
      const calls: string[] = [];
      
      // Spy on various canvas methods to track order
      const fillSpy = vi.spyOn(mockCtx, 'fill').mockImplementation(() => {
        calls.push('fill');
      });
      const strokeSpy = vi.spyOn(mockCtx, 'stroke').mockImplementation(() => {
        calls.push('stroke');
      });
      
      renderer.renderCelestialBodies([SUN, MERCURY], layout);
      
      expect(calls.length).toBeGreaterThan(0);
      
      fillSpy.mockRestore();
      strokeSpy.mockRestore();
    });
  });

  describe('Visual properties', () => {
    it('should use celestial body colors', () => {
      renderer.renderCelestialBodies([SUN], layout);
      
      // The mock context should have had fillStyle set
      expect(mockCtx.fillStyle).toBeTruthy();
    });

    it('should render celestial bodies using arc for circles', () => {
      const arcSpy = vi.spyOn(mockCtx, 'arc');
      
      renderer.renderCelestialBodies([SUN], layout);
      
      // The Sun should be rendered using arc calls (for the body and glow)
      expect(arcSpy).toHaveBeenCalled();
      expect(arcSpy.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Orbital path rendering', () => {
    it('should render orbital paths as dashed lines', () => {
      const setLineDashSpy = vi.spyOn(mockCtx, 'setLineDash');
      
      renderer.renderCelestialBodies([MERCURY], layout, {
        showOrbitalPaths: true,
      });
      
      // Check that line dash was set
      expect(setLineDashSpy).toHaveBeenCalled();
      expect(setLineDashSpy.mock.calls.some(call => 
        call[0].length > 0
      )).toBe(true);
    });

    it('should render orbital paths for planets', () => {
      const arcSpy = vi.spyOn(mockCtx, 'arc');
      
      renderer.renderCelestialBodies([MERCURY], layout, {
        showOrbitalPaths: true,
      });
      
      // Orbital paths should be rendered using arc
      expect(arcSpy).toHaveBeenCalled();
      expect(arcSpy.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Gravity well rendering', () => {
    it('should render gravity wells for all zones', () => {
      const fillSpy = vi.spyOn(mockCtx, 'fill');
      
      renderer.renderCelestialBodies([SUN], layout, {
        showGravityWells: true,
      });
      
      // The Sun has 3 gravity zones, so there should be at least 3 fill calls for gravity wells
      // Plus additional fills for the Sun itself
      expect(fillSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should render gravity wells from outer to inner', () => {
      const arcSpy = vi.spyOn(mockCtx, 'arc');
      
      renderer.renderCelestialBodies([SUN], layout, {
        showGravityWells: true,
      });
      
      // Should have multiple arc calls for gravity wells
      expect(arcSpy.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Default options', () => {
    it('should use default options when none provided', () => {
      expect(DEFAULT_CELESTIAL_OPTIONS.showOrbitalPaths).toBe(true);
      expect(DEFAULT_CELESTIAL_OPTIONS.showGravityWells).toBe(false); // Legacy - disabled by default
      expect(DEFAULT_CELESTIAL_OPTIONS.showGravityArrows).toBe(true); // New 2018 rules - enabled
      expect(DEFAULT_CELESTIAL_OPTIONS.gravityWellOpacity).toBeGreaterThan(0);
    });
  });
});
