// Grid rendering system for hexagonal game board

import { HexCoordinate, HexLayout } from '../hex/types';
import { hexToPixel, hexCorners, hexRange } from '../hex/operations';

export interface GridRenderOptions {
  /** Whether to draw hex borders */
  showGrid: boolean;
  /** Grid line color */
  gridColor: string;
  /** Grid line width */
  gridLineWidth: number;
  /** Whether to show coordinate labels */
  showCoordinates: boolean;
  /** Coordinate label color */
  coordinateLabelColor: string;
  /** Coordinate label font size */
  coordinateFontSize: number;
  /** Background color */
  backgroundColor: string;
  /** Background image (optional) - if provided, will be drawn instead of solid color */
  backgroundImage?: HTMLImageElement;
}

export const DEFAULT_GRID_OPTIONS: GridRenderOptions = {
  showGrid: true,
  gridColor: '#444466',
  gridLineWidth: 1,
  showCoordinates: true,
  coordinateLabelColor: '#666688',
  coordinateFontSize: 10,
  backgroundColor: '#0a0a1a',
};

export class GridRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Renders the complete game board with background, grid, and labels.
   */
  renderGameBoard(
    layout: HexLayout,
    gridRadius: number,
    canvasWidth: number,
    canvasHeight: number,
    options: Partial<GridRenderOptions> = {}
  ): void {
    const opts: GridRenderOptions = { ...DEFAULT_GRID_OPTIONS, ...options };

    // Layer 1: Background
    if (opts.backgroundImage) {
      this.renderBackgroundImage(canvasWidth, canvasHeight, opts.backgroundImage);
    } else {
      this.renderBackground(canvasWidth, canvasHeight, opts.backgroundColor);
    }

    // Layer 2: Grid
    if (opts.showGrid) {
      this.renderHexGrid(layout, gridRadius, opts);
    }

    // Layer 3: Coordinate Labels
    if (opts.showCoordinates) {
      this.renderCoordinateLabels(layout, gridRadius, opts);
    }
  }

  /**
   * Renders the background layer.
   */
  private renderBackground(width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Renders a background image, scaled to fit the canvas while maintaining aspect ratio.
   */
  private renderBackgroundImage(width: number, height: number, image: HTMLImageElement): void {
    // Calculate scaling to fit image on canvas while maintaining aspect ratio
    const imageAspect = image.width / image.height;
    const canvasAspect = width / height;
    
    let drawWidth: number;
    let drawHeight: number;
    let offsetX: number = 0;
    let offsetY: number = 0;
    
    if (imageAspect > canvasAspect) {
      // Image is wider - fit to width
      drawWidth = width;
      drawHeight = width / imageAspect;
      offsetY = (height - drawHeight) / 2;
    } else {
      // Image is taller - fit to height
      drawHeight = height;
      drawWidth = height * imageAspect;
      offsetX = (width - drawWidth) / 2;
    }
    
    // Draw black background first
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw the image centered
    this.ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  }

  /**
   * Renders the hexagonal grid.
   */
  private renderHexGrid(
    layout: HexLayout,
    gridRadius: number,
    options: GridRenderOptions
  ): void {
    const hexes = hexRange({ q: 0, r: 0 }, gridRadius);

    this.ctx.strokeStyle = options.gridColor;
    this.ctx.lineWidth = options.gridLineWidth;

    hexes.forEach((hex) => {
      this.drawHexBorder(hex, layout);
    });
  }

  /**
   * Draws the border of a single hex.
   */
  private drawHexBorder(hex: HexCoordinate, layout: HexLayout): void {
    const corners = hexCorners(hex, layout);

    this.ctx.beginPath();
    this.ctx.moveTo(corners[0].x, corners[0].y);

    for (let i = 1; i < corners.length; i++) {
      this.ctx.lineTo(corners[i].x, corners[i].y);
    }

    this.ctx.closePath();
    this.ctx.stroke();
  }

  /**
   * Renders coordinate labels for hexes.
   */
  private renderCoordinateLabels(
    layout: HexLayout,
    gridRadius: number,
    options: GridRenderOptions
  ): void {
    const hexes = hexRange({ q: 0, r: 0 }, gridRadius);

    this.ctx.fillStyle = options.coordinateLabelColor;
    this.ctx.font = `${options.coordinateFontSize}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    hexes.forEach((hex) => {
      const center = hexToPixel(hex, layout);
      const label = `${hex.q},${hex.r}`;
      this.ctx.fillText(label, center.x, center.y);
    });
  }

  /**
   * Renders a filled hex at the specified coordinate.
   * Useful for highlighting or special hexes.
   */
  renderFilledHex(hex: HexCoordinate, layout: HexLayout, fillColor: string): void {
    const corners = hexCorners(hex, layout);

    this.ctx.fillStyle = fillColor;
    this.ctx.beginPath();
    this.ctx.moveTo(corners[0].x, corners[0].y);

    for (let i = 1; i < corners.length; i++) {
      this.ctx.lineTo(corners[i].x, corners[i].y);
    }

    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Renders multiple hexes with different colors.
   * Useful for highlighting reachable hexes, danger zones, etc.
   */
  renderColoredHexes(
    hexes: Array<{ hex: HexCoordinate; color: string }>,
    layout: HexLayout
  ): void {
    hexes.forEach(({ hex, color }) => {
      this.renderFilledHex(hex, layout, color);
    });
  }
}
