// Rendering functions for Plot Phase UI

import { HexLayout, HexCoordinate } from '../hex/types';
import { Ship, VelocityVector } from '../ship/types';
import { hexToPixel } from '../hex/operations';

export interface PlotUIElements {
  thrustButtons: ThrustButton[];
  coastButton: Button;
  confirmButton: Button | null;
  undoButton: Button | null;
  toggleHighlightButton: Button;
  statusPanel: StatusPanel;
}

export interface ThrustButton {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: VelocityVector;
  label: string;
  enabled: boolean;
}

export interface Button {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  enabled: boolean;
}

export interface StatusPanel {
  x: number;
  y: number;
  width: number;
  height: number;
  shipName: string;
  currentVelocity: VelocityVector;
  remainingThrust: number;
  maxThrust: number;
}

export class PlotRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Renders reachable hexes with highlighting
   */
  renderReachableHexes(
    reachableHexes: Map<string, { hex: HexCoordinate; thrustRequired: number; resultingVelocity: VelocityVector }>,
    layout: HexLayout
  ): void {
    for (const [, data] of reachableHexes) {
      const { hex, thrustRequired } = data;
      const pixel = hexToPixel(hex, layout);
      
      // Color based on thrust required
      let alpha = 0.3;
      let color = '#00FF00'; // Green for low thrust
      
      if (thrustRequired === 0) {
        color = '#FFFF00'; // Yellow for zero thrust (current trajectory)
        alpha = 0.4;
      } else if (thrustRequired === 1) {
        color = '#00FF00'; // Green
      } else if (thrustRequired === 2) {
        color = '#FFA500'; // Orange
      } else {
        color = '#FF4500'; // Red for high thrust
      }
      
      // Draw hex highlight
      this.ctx.fillStyle = color;
      this.ctx.globalAlpha = alpha;
      this.ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = pixel.x + layout.size * Math.cos(angle);
        const y = pixel.y + layout.size * Math.sin(angle);
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
      
      // Draw thrust requirement number
      if (thrustRequired > 0) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `${layout.size * 0.6}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(thrustRequired.toString(), pixel.x, pixel.y);
      }
    }
  }

  /**
   * Renders velocity vector preview
   */
  renderVelocityPreview(
    position: HexCoordinate,
    velocity: VelocityVector,
    layout: HexLayout,
    color: string = '#FFFF00'
  ): void {
    const startPixel = hexToPixel(position, layout);
    const endPixel = hexToPixel({
      q: position.q + velocity.q,
      r: position.r + velocity.r,
    }, layout);

    // Draw dashed line for preview
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.moveTo(startPixel.x, startPixel.y);
    this.ctx.lineTo(endPixel.x, endPixel.y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw arrowhead
    const angle = Math.atan2(endPixel.y - startPixel.y, endPixel.x - startPixel.x);
    const arrowSize = layout.size * 0.5;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(endPixel.x, endPixel.y);
    this.ctx.lineTo(
      endPixel.x - arrowSize * Math.cos(angle - Math.PI / 6),
      endPixel.y - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.lineTo(
      endPixel.x - arrowSize * Math.cos(angle + Math.PI / 6),
      endPixel.y - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Renders the Plot Phase UI elements
   */
  renderPlotUI(
    elements: PlotUIElements
  ): void {
    // Render status panel
    this.renderStatusPanel(elements.statusPanel);

    // Render thrust direction buttons
    elements.thrustButtons.forEach(button => {
      this.renderThrustButton(button);
    });

    // Render action buttons
    if (elements.confirmButton) {
      this.renderButton(elements.confirmButton, '#4CAF50');
    }
    if (elements.undoButton) {
      this.renderButton(elements.undoButton, '#FF9800');
    }
    this.renderButton(elements.coastButton, '#9C27B0');
    this.renderButton(elements.toggleHighlightButton, '#2196F3');
  }

  private renderStatusPanel(panel: StatusPanel): void {
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(panel.x, panel.y, panel.width, panel.height);
    
    // Border
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);

    // Title
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 18px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText('PLOT PHASE', panel.x + 10, panel.y + 10);

    // Ship name
    this.ctx.font = '16px sans-serif';
    this.ctx.fillText(`Ship: ${panel.shipName}`, panel.x + 10, panel.y + 35);

    // Velocity
    this.ctx.fillText(
      `Velocity: (${panel.currentVelocity.q}, ${panel.currentVelocity.r})`,
      panel.x + 10,
      panel.y + 55
    );

    // Thrust
    this.ctx.fillText(
      `Thrust: ${panel.remainingThrust}/${panel.maxThrust}`,
      panel.x + 10,
      panel.y + 75
    );
  }

  private renderThrustButton(button: ThrustButton): void {
    // Background
    this.ctx.fillStyle = button.enabled ? '#4CAF50' : '#555555';
    this.ctx.fillRect(button.x, button.y, button.width, button.height);

    // Border
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(button.x, button.y, button.width, button.height);

    // Label
    this.ctx.fillStyle = button.enabled ? '#FFFFFF' : '#999999';
    this.ctx.font = `${button.height * 0.4}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      button.label,
      button.x + button.width / 2,
      button.y + button.height / 2
    );
  }

  private renderButton(button: Button, color: string): void {
    // Background
    this.ctx.fillStyle = button.enabled ? color : '#555555';
    this.ctx.fillRect(button.x, button.y, button.width, button.height);

    // Border
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(button.x, button.y, button.width, button.height);

    // Text
    this.ctx.fillStyle = button.enabled ? '#FFFFFF' : '#999999';
    this.ctx.font = `${button.height * 0.35}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      button.text,
      button.x + button.width / 2,
      button.y + button.height / 2
    );
  }
}

/**
 * Creates thrust direction buttons for the Plot UI
 */
export function createThrustButtons(
  canvasWidth: number,
  canvasHeight: number,
  remainingThrust: number
): ThrustButton[] {
  const buttonSize = 60;
  const spacing = 10;
  const centerX = canvasWidth - 250;
  const centerY = canvasHeight / 2;

  const directions: Array<{ dir: VelocityVector; label: string; offsetX: number; offsetY: number }> = [
    { dir: { q: 0, r: -1 }, label: '↑', offsetX: 0, offsetY: -1 },
    { dir: { q: 1, r: -1 }, label: '↗', offsetX: 1, offsetY: -1 },
    { dir: { q: 1, r: 0 }, label: '→', offsetX: 1, offsetY: 0 },
    { dir: { q: 0, r: 1 }, label: '↓', offsetX: 0, offsetY: 1 },
    { dir: { q: -1, r: 1 }, label: '↙', offsetX: -1, offsetY: 1 },
    { dir: { q: -1, r: 0 }, label: '←', offsetX: -1, offsetY: 0 },
  ];

  return directions.map(({ dir, label, offsetX, offsetY }) => ({
    x: centerX + offsetX * (buttonSize + spacing),
    y: centerY + offsetY * (buttonSize + spacing),
    width: buttonSize,
    height: buttonSize,
    direction: dir,
    label,
    enabled: remainingThrust > 0,
  }));
}

/**
 * Creates the Plot UI elements based on current game state
 */
export function createPlotUIElements(
  selectedShip: Ship,
  canvasWidth: number,
  canvasHeight: number,
  hasPlottedMove: boolean
): PlotUIElements {
  const thrustButtons = createThrustButtons(
    canvasWidth,
    canvasHeight,
    selectedShip.remainingThrust
  );

  const statusPanel: StatusPanel = {
    x: 10,
    y: canvasHeight - 120,
    width: 220,
    height: 100,
    shipName: selectedShip.name,
    currentVelocity: selectedShip.velocity,
    remainingThrust: selectedShip.remainingThrust,
    maxThrust: selectedShip.stats.maxThrust,
  };

  const buttonY = 10;
  const buttonHeight = 40;
  const buttonWidth = 120;
  let buttonX = canvasWidth - buttonWidth - 10;

  const toggleHighlightButton: Button = {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight,
    text: 'Toggle Hexes',
    enabled: true,
  };

  buttonX -= buttonWidth + 10;
  const coastButton: Button = {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight,
    text: 'Coast',
    enabled: true,
  };

  buttonX -= buttonWidth + 10;
  const undoButton: Button | null = hasPlottedMove ? {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight,
    text: 'Undo',
    enabled: true,
  } : null;

  buttonX -= buttonWidth + 10;
  const confirmButton: Button | null = hasPlottedMove ? {
    x: buttonX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight,
    text: 'Confirm',
    enabled: true,
  } : null;

  return {
    thrustButtons,
    coastButton,
    confirmButton,
    undoButton,
    toggleHighlightButton,
    statusPanel,
  };
}
