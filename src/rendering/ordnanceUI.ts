// UI for the Ordnance Phase

import { Ship } from '../ship/types';
import { OrdnanceType } from '../ordnance/types';

export interface OrdnanceButton {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  ordnanceType: OrdnanceType;
  enabled: boolean;
  count: number;
}

export interface OrdnanceUIElements {
  ship: Ship;
  title: string;
  ordnanceButtons: OrdnanceButton[];
  skipButton: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  };
}

/**
 * Create UI elements for the Ordnance Phase
 */
export function createOrdnanceUIElements(
  ship: Ship,
  canvasWidth: number
): OrdnanceUIElements {
  const rightPanelX = canvasWidth - 220;
  const topY = 120;
  const buttonWidth = 200;
  const buttonHeight = 35;
  const spacing = 10;

  // Create ordnance buttons
  const ordnanceButtons: OrdnanceButton[] = [];

  // Mine button
  ordnanceButtons.push({
    x: rightPanelX,
    y: topY,
    width: buttonWidth,
    height: buttonHeight,
    label: `Launch Mine (${ship.ordnance.mines})`,
    ordnanceType: OrdnanceType.Mine,
    enabled: ship.ordnance.mines > 0,
    count: ship.ordnance.mines,
  });

  // Torpedo button
  ordnanceButtons.push({
    x: rightPanelX,
    y: topY + buttonHeight + spacing,
    width: buttonWidth,
    height: buttonHeight,
    label: `Launch Torpedo (${ship.ordnance.torpedoes})`,
    ordnanceType: OrdnanceType.Torpedo,
    enabled: ship.ordnance.torpedoes > 0,
    count: ship.ordnance.torpedoes,
  });

  // Missile button
  ordnanceButtons.push({
    x: rightPanelX,
    y: topY + (buttonHeight + spacing) * 2,
    width: buttonWidth,
    height: buttonHeight,
    label: `Launch Missile (${ship.ordnance.missiles})`,
    ordnanceType: OrdnanceType.Missile,
    enabled: ship.ordnance.missiles > 0,
    count: ship.ordnance.missiles,
  });

  // Skip button
  const skipButton = {
    x: rightPanelX,
    y: topY + (buttonHeight + spacing) * 3 + spacing,
    width: buttonWidth,
    height: buttonHeight,
    label: 'Skip / Done',
  };

  return {
    ship,
    title: `Ordnance Phase: ${ship.name}`,
    ordnanceButtons,
    skipButton,
  };
}

/**
 * Render the Ordnance Phase UI
 */
export function renderOrdnanceUI(
  ctx: CanvasRenderingContext2D,
  elements: OrdnanceUIElements
): void {
  // Render title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(elements.title, elements.ordnanceButtons[0].x, 100);

  // Render ordnance buttons
  elements.ordnanceButtons.forEach((button) => {
    renderButton(ctx, button);
  });

  // Render skip button
  renderSkipButton(ctx, elements.skipButton);
}

function renderButton(ctx: CanvasRenderingContext2D, button: OrdnanceButton): void {
  // Button background
  ctx.fillStyle = button.enabled ? '#4CAF50' : '#666666';
  ctx.fillRect(button.x, button.y, button.width, button.height);

  // Button border
  ctx.strokeStyle = button.enabled ? '#FFFFFF' : '#333333';
  ctx.lineWidth = 2;
  ctx.strokeRect(button.x, button.y, button.width, button.height);

  // Button text
  ctx.fillStyle = button.enabled ? '#FFFFFF' : '#999999';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    button.label,
    button.x + button.width / 2,
    button.y + button.height / 2
  );
}

function renderSkipButton(
  ctx: CanvasRenderingContext2D,
  button: { x: number; y: number; width: number; height: number; label: string }
): void {
  // Button background
  ctx.fillStyle = '#2196F3';
  ctx.fillRect(button.x, button.y, button.width, button.height);

  // Button border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(button.x, button.y, button.width, button.height);

  // Button text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
}
