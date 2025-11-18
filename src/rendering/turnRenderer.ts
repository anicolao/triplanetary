// Renderer for turn management UI elements

import { TurnUILayout } from './turnUI';

export class TurnRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  renderTurnUI(layout: TurnUILayout): void {
    this.renderInfoBox(
      layout.phaseBoxX,
      layout.phaseBoxY,
      layout.phaseBoxWidth,
      layout.phaseBoxHeight,
      layout.phaseText,
      '#4a90e2' // Blue for phase
    );

    this.renderInfoBox(
      layout.playerBoxX,
      layout.playerBoxY,
      layout.playerBoxWidth,
      layout.playerBoxHeight,
      layout.playerText,
      layout.playerColor // Use player's color
    );

    this.renderInfoBox(
      layout.roundBoxX,
      layout.roundBoxY,
      layout.roundBoxWidth,
      layout.roundBoxHeight,
      layout.roundText,
      '#e2a64a' // Orange for round
    );

    // Render victory box if game is won
    if (layout.showVictory && layout.victoryBoxX !== undefined && 
        layout.victoryBoxY !== undefined && layout.victoryText !== undefined &&
        layout.victoryColor !== undefined && layout.victoryBoxWidth !== undefined &&
        layout.victoryBoxHeight !== undefined) {
      this.renderInfoBox(
        layout.victoryBoxX,
        layout.victoryBoxY,
        layout.victoryBoxWidth,
        layout.victoryBoxHeight,
        layout.victoryText,
        layout.victoryColor
      );
    }

    this.renderButton(layout.nextPhaseButton);
    this.renderButton(layout.mapLayoutButton);
    this.renderButton(layout.mapManipulationButton);
    if (layout.homeButton) {
      this.renderButton(layout.homeButton);
    }
  }

  private renderInfoBox(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    color: string
  ): void {
    // Draw background with transparency
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(x, y, width, height);

    // Draw colored left border
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, 4, height);

    // Draw border
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    // Draw text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x + 10, y + height / 2);
  }

  private renderButton(button: {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    enabled: boolean;
  }): void {
    // Draw button background
    if (button.enabled) {
      this.ctx.fillStyle = 'rgba(74, 144, 226, 0.9)';
    } else {
      this.ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
    }
    this.ctx.fillRect(button.x, button.y, button.width, button.height);

    // Draw button border
    this.ctx.strokeStyle = button.enabled ? '#4a90e2' : '#666666';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(button.x, button.y, button.width, button.height);

    // Draw button text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      button.text,
      button.x + button.width / 2,
      button.y + button.height / 2
    );
  }
}
