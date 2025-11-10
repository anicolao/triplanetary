// Ship rendering functions

import { Ship } from '../ship/types';
import { HexLayout, Point } from '../hex/types';
import { hexToPixel, hexAdd } from '../hex/operations';

export interface ShipRenderOptions {
  /** Whether to show velocity vectors */
  showVelocity?: boolean;
  /** Whether to show status indicators */
  showStatus?: boolean;
  /** Whether to show movement history */
  showHistory?: boolean;
  /** ID of the selected ship (if any) for highlighting */
  selectedShipId?: string | null;
}

export class ShipRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Render all ships on the game board.
   */
  renderShips(
    ships: Ship[],
    layout: HexLayout,
    playerColors: Map<string, string>,
    options: ShipRenderOptions = {}
  ): void {
    const { showVelocity = true, showStatus = true, showHistory = true, selectedShipId = null } = options;

    // Render movement history first (underneath everything)
    if (showHistory) {
      ships.forEach((ship) => {
        if (!ship.destroyed) {
          const color = playerColors.get(ship.playerId) || '#FFFFFF';
          this.renderMovementHistory(ship, layout, color);
        }
      });
    }

    // Render velocity vectors (above history, below ships)
    if (showVelocity) {
      ships.forEach((ship) => {
        if (!ship.destroyed) {
          const color = playerColors.get(ship.playerId) || '#FFFFFF';
          this.renderVelocityVector(ship, layout, color);
        }
      });
    }

    // Then render ships
    ships.forEach((ship) => {
      if (!ship.destroyed) {
        const color = playerColors.get(ship.playerId) || '#FFFFFF';
        const isSelected = ship.id === selectedShipId;
        this.renderShip(ship, layout, color, isSelected);
      }
    });

    // Finally render status indicators on top
    if (showStatus) {
      ships.forEach((ship) => {
        if (!ship.destroyed) {
          const color = playerColors.get(ship.playerId) || '#FFFFFF';
          this.renderShipStatus(ship, layout, color);
        }
      });
    }
  }

  /**
   * Render a single ship as a triangle (spacecraft icon).
   */
  private renderShip(
    ship: Ship,
    layout: HexLayout,
    color: string,
    isSelected: boolean
  ): void {
    const center = hexToPixel(ship.position, layout);
    const size = layout.size * 0.6; // Ship is 60% of hex size

    // Calculate ship orientation based on velocity
    // If velocity is zero, point upward (north)
    let angle = -Math.PI / 2; // Default: point up
    if (ship.velocity.q !== 0 || ship.velocity.r !== 0) {
      // Calculate angle from velocity vector
      const velocityEnd = hexAdd(ship.position, ship.velocity);
      const velocityPixel = hexToPixel(velocityEnd, layout);
      angle = Math.atan2(
        velocityPixel.y - center.y,
        velocityPixel.x - center.x
      );
    }

    // Draw selection highlight if selected
    if (isSelected) {
      this.ctx.strokeStyle = '#FFFF00'; // Yellow highlight
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y, size * 1.3, 0, 2 * Math.PI);
      this.ctx.stroke();
    }

    // Draw ship as a triangle pointing in the direction of movement
    this.ctx.save();
    this.ctx.translate(center.x, center.y);
    this.ctx.rotate(angle);

    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    this.ctx.moveTo(size, 0); // Nose (pointing right before rotation)
    this.ctx.lineTo(-size * 0.5, size * 0.6); // Bottom left
    this.ctx.lineTo(-size * 0.5, -size * 0.6); // Top left
    this.ctx.closePath();

    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Render the velocity vector as an arrow.
   */
  private renderVelocityVector(
    ship: Ship,
    layout: HexLayout,
    color: string
  ): void {
    // Don't draw velocity vector if velocity is zero
    if (ship.velocity.q === 0 && ship.velocity.r === 0) {
      return;
    }

    const start = hexToPixel(ship.position, layout);
    const velocityEnd = hexAdd(ship.position, ship.velocity);
    const end = hexToPixel(velocityEnd, layout);

    // Draw arrow line
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.6; // Semi-transparent

    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowSize = 8;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(end.x, end.y);
    this.ctx.lineTo(
      end.x - arrowSize * Math.cos(angle - Math.PI / 6),
      end.y - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.lineTo(
      end.x - arrowSize * Math.cos(angle + Math.PI / 6),
      end.y - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.globalAlpha = 1.0; // Reset alpha
  }

  /**
   * Render the movement history as faded arrows.
   */
  private renderMovementHistory(
    ship: Ship,
    layout: HexLayout,
    color: string
  ): void {
    if (!ship.movementHistory || ship.movementHistory.length === 0) {
      return;
    }

    // Render each historical move as a faded arrow
    ship.movementHistory.forEach((historyEntry, index) => {
      const { fromPosition, velocity } = historyEntry;

      // Skip if velocity is zero
      if (velocity.q === 0 && velocity.r === 0) {
        return;
      }

      const start = hexToPixel(fromPosition, layout);
      const velocityEnd = hexAdd(fromPosition, velocity);
      const end = hexToPixel(velocityEnd, layout);

      // Calculate alpha based on how old the move is
      // Newer moves are more visible, older moves fade out
      const fadeRatio = (index + 1) / (ship.movementHistory.length + 1);
      const alpha = 0.15 + (fadeRatio * 0.25); // Alpha ranges from 0.15 to 0.4

      // Draw arrow line
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 1.5;
      this.ctx.globalAlpha = alpha;

      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();

      // Draw arrowhead
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const arrowSize = 6;

      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(end.x, end.y);
      this.ctx.lineTo(
        end.x - arrowSize * Math.cos(angle - Math.PI / 6),
        end.y - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      this.ctx.lineTo(
        end.x - arrowSize * Math.cos(angle + Math.PI / 6),
        end.y - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      this.ctx.closePath();
      this.ctx.fill();
    });

    this.ctx.globalAlpha = 1.0; // Reset alpha
  }

  /**
   * Render ship status indicators (hull, thrust).
   */
  private renderShipStatus(
    ship: Ship,
    layout: HexLayout,
    color: string
  ): void {
    const center = hexToPixel(ship.position, layout);
    const size = layout.size;

    // Position status indicators below the ship
    const statusY = center.y + size * 1.2;

    // Hull indicator
    const hullPercent = ship.stats.currentHull / ship.stats.maxHull;
    const hullBarWidth = size * 1.2;
    const hullBarHeight = 4;

    // Background bar
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(
      center.x - hullBarWidth / 2,
      statusY,
      hullBarWidth,
      hullBarHeight
    );

    // Hull bar color: green -> yellow -> red based on health
    let hullColor: string;
    if (hullPercent > 0.6) {
      hullColor = '#00FF00'; // Green
    } else if (hullPercent > 0.3) {
      hullColor = '#FFFF00'; // Yellow
    } else {
      hullColor = '#FF0000'; // Red
    }

    this.ctx.fillStyle = hullColor;
    this.ctx.fillRect(
      center.x - hullBarWidth / 2,
      statusY,
      hullBarWidth * hullPercent,
      hullBarHeight
    );

    // Thrust indicator (dots)
    const thrustY = statusY + 8;
    const dotRadius = 2;
    const dotSpacing = 6;
    const thrustStart =
      center.x - ((ship.stats.maxThrust - 1) * dotSpacing) / 2;

    for (let i = 0; i < ship.stats.maxThrust; i++) {
      this.ctx.fillStyle = i < ship.remainingThrust ? color : '#333333';
      this.ctx.beginPath();
      this.ctx.arc(
        thrustStart + i * dotSpacing,
        thrustY,
        dotRadius,
        0,
        2 * Math.PI
      );
      this.ctx.fill();
    }

    // Out of fuel indicator
    if (ship.remainingThrust === 0) {
      this.ctx.fillStyle = '#FF0000';
      this.ctx.font = 'bold 10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText('NO FUEL', center.x, thrustY + 6);
    }

    // Damaged indicator (if hull < 50%)
    if (hullPercent < 0.5) {
      this.ctx.fillStyle = '#FF0000';
      this.ctx.font = 'bold 10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'bottom';
      this.ctx.fillText('DAMAGED', center.x, center.y - size);
    }
  }

  /**
   * Get pixel position for a ship.
   */
  getShipPixelPosition(ship: Ship, layout: HexLayout): Point {
    return hexToPixel(ship.position, layout);
  }

  /**
   * Check if a pixel point is within a ship's bounds.
   */
  isPointInShip(point: Point, ship: Ship, layout: HexLayout): boolean {
    const center = hexToPixel(ship.position, layout);
    const size = layout.size * 0.6;
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= size * 1.3; // Slightly larger than ship for easier clicking
  }
}
