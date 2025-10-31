// Combat phase rendering

import { CombatUILayout, CombatUIButton, TargetIndicator } from './combatUI';

export class CombatRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Render the complete Combat UI
   */
  renderCombatUI(layout: CombatUILayout): void {
    // Render ship info panel
    this.renderShipInfoPanel(layout);
    
    // Render target indicators on map
    layout.targetIndicators.forEach(indicator => this.renderTargetIndicator(indicator));
    
    // Render attack info panel if visible
    if (layout.attackInfoVisible) {
      this.renderAttackInfoPanel(layout);
    }
    
    // Render declare attack button if present
    if (layout.declareAttackButton) {
      this.renderButton(layout.declareAttackButton);
    }
    
    // Render cancel attack button if present
    if (layout.cancelAttackButton) {
      this.renderButton(layout.cancelAttackButton);
    }
    
    // Render end combat button
    this.renderButton(layout.endCombatButton);
    
    // Render combat log
    if (layout.combatLogEntries.length > 0) {
      this.renderCombatLog(layout);
    }
  }

  /**
   * Render ship info panel
   */
  private renderShipInfoPanel(layout: CombatUILayout): void {
    const { shipInfoX, shipInfoY, shipInfoWidth, shipInfoHeight } = layout;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(shipInfoX, shipInfoY, shipInfoWidth, shipInfoHeight);
    
    // Border
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(shipInfoX, shipInfoY, shipInfoWidth, shipInfoHeight);
    
    // Title
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 18px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText('Combat', shipInfoX + 10, shipInfoY + 10);
    
    // Instructions
    this.ctx.font = '14px sans-serif';
    this.ctx.fillStyle = '#cccccc';
    this.ctx.fillText('1. Click on target ship', shipInfoX + 10, shipInfoY + 45);
    this.ctx.fillText('2. Declare attack', shipInfoX + 10, shipInfoY + 70);
    this.ctx.fillText('3. End combat phase', shipInfoX + 10, shipInfoY + 95);
  }

  /**
   * Render attack info panel
   */
  private renderAttackInfoPanel(layout: CombatUILayout): void {
    const { attackInfoX, attackInfoY, attackInfoWidth, attackInfoHeight } = layout;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(attackInfoX, attackInfoY, attackInfoWidth, attackInfoHeight);
    
    // Border
    this.ctx.strokeStyle = '#FFA500';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(attackInfoX, attackInfoY, attackInfoWidth, attackInfoHeight);
    
    // Title
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText('Attack Info', attackInfoX + 10, attackInfoY + 10);
  }

  /**
   * Render a button
   */
  private renderButton(button: CombatUIButton): void {
    // Button background
    if (button.enabled) {
      switch (button.action) {
        case 'declare-attack':
          this.ctx.fillStyle = '#4CAF50';
          break;
        case 'cancel-attack':
          this.ctx.fillStyle = '#f44336';
          break;
        case 'end-combat':
          this.ctx.fillStyle = '#FF9800';
          break;
        default:
          this.ctx.fillStyle = '#555555';
      }
    } else {
      this.ctx.fillStyle = '#333333';
    }
    
    this.ctx.fillRect(button.x, button.y, button.width, button.height);
    
    // Button border
    this.ctx.strokeStyle = button.enabled ? '#ffffff' : '#666666';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(button.x, button.y, button.width, button.height);
    
    // Button text
    this.ctx.fillStyle = button.enabled ? '#ffffff' : '#888888';
    this.ctx.font = '16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      button.text,
      button.x + button.width / 2,
      button.y + button.height / 2
    );
  }

  /**
   * Render target indicator on map
   */
  private renderTargetIndicator(indicator: TargetIndicator): void {
    const { x, y, radius, selected } = indicator;
    
    // Draw circle around target
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    
    if (selected) {
      this.ctx.strokeStyle = '#FF0000';
      this.ctx.lineWidth = 3;
    } else {
      this.ctx.strokeStyle = '#FFA500';
      this.ctx.lineWidth = 2;
    }
    
    this.ctx.stroke();
    
    // Draw crosshair
    if (selected) {
      this.ctx.strokeStyle = '#FF0000';
      this.ctx.lineWidth = 2;
      
      // Horizontal line
      this.ctx.beginPath();
      this.ctx.moveTo(x - radius * 1.5, y);
      this.ctx.lineTo(x + radius * 1.5, y);
      this.ctx.stroke();
      
      // Vertical line
      this.ctx.beginPath();
      this.ctx.moveTo(x, y - radius * 1.5);
      this.ctx.lineTo(x, y + radius * 1.5);
      this.ctx.stroke();
    }
  }

  /**
   * Render combat log
   */
  private renderCombatLog(layout: CombatUILayout): void {
    const { combatLogX, combatLogY, combatLogWidth, combatLogHeight, combatLogEntries } = layout;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(combatLogX, combatLogY, combatLogWidth, combatLogHeight);
    
    // Border
    this.ctx.strokeStyle = '#888888';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(combatLogX, combatLogY, combatLogWidth, combatLogHeight);
    
    // Title
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText('Combat Log', combatLogX + 10, combatLogY + 10);
    
    // Log entries
    this.ctx.font = '12px monospace';
    this.ctx.fillStyle = '#cccccc';
    combatLogEntries.forEach((entry, index) => {
      this.ctx.fillText(
        entry,
        combatLogX + 10,
        combatLogY + 35 + index * 20
      );
    });
  }

  /**
   * Render attack info text in the info panel
   */
  renderAttackInfo(
    x: number,
    y: number,
    lines: string[]
  ): void {
    this.ctx.font = '14px monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    lines.forEach((line, index) => {
      this.ctx.fillText(line, x + 10, y + 35 + index * 20);
    });
  }
}
