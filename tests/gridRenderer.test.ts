// Unit tests for grid rendering system

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GridRenderer, DEFAULT_GRID_OPTIONS } from '../src/rendering/gridRenderer';
import { HexLayout } from '../src/hex/types';

describe('GridRenderer', () => {
  let mockCtx: any;
  let gridRenderer: GridRenderer;

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
    };

    gridRenderer = new GridRenderer(mockCtx);
  });

  describe('renderGameBoard', () => {
    it('should render background, grid, and coordinates', () => {
      const layout: HexLayout = {
        size: 30,
        origin: { x: 400, y: 300 },
        orientation: 'pointy',
      };

      gridRenderer.renderGameBoard(layout, 3, 800, 600);

      // Should fill background
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);

      // Should draw hex borders
      expect(mockCtx.stroke).toHaveBeenCalled();

      // Should draw coordinate labels
      expect(mockCtx.fillText).toHaveBeenCalled();
    });

    it('should respect showGrid option', () => {
      const layout: HexLayout = {
        size: 30,
        origin: { x: 400, y: 300 },
        orientation: 'pointy',
      };

      vi.clearAllMocks();
      gridRenderer.renderGameBoard(layout, 3, 800, 600, { showGrid: false });

      // Should fill background but not stroke hexes
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(mockCtx.stroke).not.toHaveBeenCalled();
    });

    it('should respect showCoordinates option', () => {
      const layout: HexLayout = {
        size: 30,
        origin: { x: 400, y: 300 },
        orientation: 'pointy',
      };

      vi.clearAllMocks();
      gridRenderer.renderGameBoard(layout, 3, 800, 600, { showCoordinates: false });

      // Should not draw text
      expect(mockCtx.fillText).not.toHaveBeenCalled();
    });

    it('should use custom background color', () => {
      const layout: HexLayout = {
        size: 30,
        origin: { x: 400, y: 300 },
        orientation: 'pointy',
      };

      // Capture fillStyle when fillRect is called
      let capturedFillStyle: string = '';
      mockCtx.fillRect = vi.fn((x, y, w, h) => {
        if (x === 0 && y === 0 && w === 800 && h === 600) {
          capturedFillStyle = mockCtx.fillStyle;
        }
      });

      gridRenderer.renderGameBoard(layout, 3, 800, 600, { backgroundColor: '#ff0000' });

      expect(capturedFillStyle).toBe('#ff0000');
    });
  });

  describe('renderFilledHex', () => {
    it('should draw a filled hexagon', () => {
      const layout: HexLayout = {
        size: 30,
        origin: { x: 400, y: 300 },
        orientation: 'pointy',
      };

      vi.clearAllMocks();
      gridRenderer.renderFilledHex({ q: 0, r: 0 }, layout, '#00ff00');

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.closePath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.fillStyle).toBe('#00ff00');
    });

    it('should draw hex with 6 corners', () => {
      const layout: HexLayout = {
        size: 30,
        origin: { x: 400, y: 300 },
        orientation: 'pointy',
      };

      vi.clearAllMocks();
      gridRenderer.renderFilledHex({ q: 1, r: 1 }, layout, '#0000ff');

      // Should call moveTo once and lineTo 5 times (6 corners total)
      expect(mockCtx.moveTo).toHaveBeenCalledTimes(1);
      expect(mockCtx.lineTo).toHaveBeenCalledTimes(5);
    });
  });

  describe('renderColoredHexes', () => {
    it('should render multiple hexes with different colors', () => {
      const layout: HexLayout = {
        size: 30,
        origin: { x: 400, y: 300 },
        orientation: 'pointy',
      };

      const hexes = [
        { hex: { q: 0, r: 0 }, color: '#ff0000' },
        { hex: { q: 1, r: 0 }, color: '#00ff00' },
        { hex: { q: 0, r: 1 }, color: '#0000ff' },
      ];

      vi.clearAllMocks();
      gridRenderer.renderColoredHexes(hexes, layout);

      // Should call fill 3 times (once per hex)
      expect(mockCtx.fill).toHaveBeenCalledTimes(3);
    });

    it('should handle empty hex array', () => {
      const layout: HexLayout = {
        size: 30,
        origin: { x: 400, y: 300 },
        orientation: 'pointy',
      };

      vi.clearAllMocks();
      gridRenderer.renderColoredHexes([], layout);

      expect(mockCtx.fill).not.toHaveBeenCalled();
    });
  });

  describe('DEFAULT_GRID_OPTIONS', () => {
    it('should have sensible defaults', () => {
      expect(DEFAULT_GRID_OPTIONS.showGrid).toBe(true);
      expect(DEFAULT_GRID_OPTIONS.showCoordinates).toBe(true);
      expect(DEFAULT_GRID_OPTIONS.gridColor).toBeTruthy();
      expect(DEFAULT_GRID_OPTIONS.gridLineWidth).toBeGreaterThan(0);
      expect(DEFAULT_GRID_OPTIONS.backgroundColor).toBeTruthy();
    });
  });
});
