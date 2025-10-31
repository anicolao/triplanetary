// Ordnance rendering functions

import { Ordnance, OrdnanceType } from '../ordnance/types';
import { hexToPixel } from '../hex/operations';
import { HexLayout } from '../hex/types';
import { GameState } from '../redux/types';

/**
 * Render all ordnance on the game map
 */
export function renderOrdnance(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  layout: HexLayout
): void {
  // Render all non-detonated ordnance
  state.ordnance
    .filter((o) => !o.detonated)
    .forEach((ordnance) => {
      renderSingleOrdnance(ctx, ordnance, layout, state);
    });
}

/**
 * Render a single ordnance object
 */
function renderSingleOrdnance(
  ctx: CanvasRenderingContext2D,
  ordnance: Ordnance,
  layout: HexLayout,
  state: GameState
): void {
  const center = hexToPixel(ordnance.position, layout);
  const player = state.players.find((p) => p.id === ordnance.playerId);
  const color = player?.color || '#FFFFFF';

  // Render based on ordnance type
  switch (ordnance.type) {
    case OrdnanceType.Mine:
      renderMine(ctx, center.x, center.y, color);
      break;
    case OrdnanceType.Torpedo:
      renderTorpedo(ctx, center.x, center.y, color, ordnance);
      break;
    case OrdnanceType.Missile:
      renderMissile(ctx, center.x, center.y, color, ordnance);
      break;
  }
}

/**
 * Render a mine (stationary explosive)
 */
function renderMine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
): void {
  // Draw a diamond shape for mines
  ctx.save();
  ctx.translate(x, y);
  
  // Draw diamond
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(4, 0);
  ctx.lineTo(0, 4);
  ctx.lineTo(-4, 0);
  ctx.closePath();
  
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw spikes
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(0, -6);
  ctx.moveTo(4, 0);
  ctx.lineTo(6, 0);
  ctx.moveTo(0, 4);
  ctx.lineTo(0, 6);
  ctx.moveTo(-4, 0);
  ctx.lineTo(-6, 0);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Render a torpedo (moving projectile)
 */
function renderTorpedo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  ordnance: Ordnance
): void {
  // Calculate torpedo angle from velocity
  const angle = Math.atan2(ordnance.velocity.r, ordnance.velocity.q);
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  // Draw torpedo body (elongated oval)
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw torpedo tip
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(8, 0);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Render a missile (tracking projectile)
 */
function renderMissile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  ordnance: Ordnance
): void {
  // Calculate missile angle from velocity
  const angle = Math.atan2(ordnance.velocity.r, ordnance.velocity.q);
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  // Draw missile body
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(5, 0);
  ctx.lineTo(7, -2);
  ctx.lineTo(7, 2);
  ctx.lineTo(5, 0);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw fins
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(-7, -3);
  ctx.moveTo(-5, 0);
  ctx.lineTo(-7, 3);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  ctx.restore();
}
