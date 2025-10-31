// UI elements for turn management display

import { GamePhase } from '../redux/types';

export interface TurnUIButton {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  enabled: boolean;
  action: 'next-phase' | 'next-turn';
}

export interface TurnUILayout {
  // Phase indicator
  phaseBoxX: number;
  phaseBoxY: number;
  phaseBoxWidth: number;
  phaseBoxHeight: number;
  phaseText: string;
  
  // Current player indicator
  playerBoxX: number;
  playerBoxY: number;
  playerBoxWidth: number;
  playerBoxHeight: number;
  playerText: string;
  playerColor: string;
  
  // Round counter
  roundBoxX: number;
  roundBoxY: number;
  roundBoxWidth: number;
  roundBoxHeight: number;
  roundText: string;
  
  // Action buttons
  nextPhaseButton: TurnUIButton;
}

export function createTurnUILayout(
  canvasWidth: number,
  _canvasHeight: number,
  currentPhase: GamePhase,
  currentPlayerIndex: number,
  playerCount: number,
  roundNumber: number,
  playerColor: string,
  allShipsPlotted: boolean = true
): TurnUILayout {
  // UI will be positioned in the top-right corner
  const padding = 10;
  const boxHeight = 30;
  const boxWidth = 180;
  const spacing = 10;
  
  const rightEdge = canvasWidth - padding;
  const topEdge = padding;
  
  // Phase indicator box
  const phaseBoxX = rightEdge - boxWidth;
  const phaseBoxY = topEdge;
  const phaseText = `Phase: ${currentPhase}`;
  
  // Current player indicator box
  const playerBoxX = phaseBoxX;
  const playerBoxY = phaseBoxY + boxHeight + spacing;
  const playerText = `Player: ${currentPlayerIndex + 1} of ${playerCount}`;
  
  // Round counter box
  const roundBoxX = playerBoxX;
  const roundBoxY = playerBoxY + boxHeight + spacing;
  const roundText = `Round: ${roundNumber}`;
  
  // Next phase button
  const buttonWidth = boxWidth;
  const buttonHeight = 40;
  // In Plot phase, button is only enabled if all ships are plotted
  const isEnabled = currentPhase === GamePhase.Plot ? allShipsPlotted : true;
  const nextPhaseButton: TurnUIButton = {
    x: phaseBoxX,
    y: roundBoxY + boxHeight + spacing * 2,
    width: buttonWidth,
    height: buttonHeight,
    text: getNextPhaseButtonText(currentPhase, allShipsPlotted),
    enabled: isEnabled,
    action: currentPhase === GamePhase.Maintenance ? 'next-turn' : 'next-phase',
  };
  
  return {
    phaseBoxX,
    phaseBoxY,
    phaseBoxWidth: boxWidth,
    phaseBoxHeight: boxHeight,
    phaseText,
    playerBoxX,
    playerBoxY,
    playerBoxWidth: boxWidth,
    playerBoxHeight: boxHeight,
    playerText,
    playerColor,
    roundBoxX,
    roundBoxY,
    roundBoxWidth: boxWidth,
    roundBoxHeight: boxHeight,
    roundText,
    nextPhaseButton,
  };
}

function getNextPhaseButtonText(currentPhase: GamePhase, allShipsPlotted: boolean = true): string {
  switch (currentPhase) {
    case GamePhase.Plot:
      return allShipsPlotted ? 'Next: Ordnance' : 'Plot All Ships';
    case GamePhase.Ordnance:
      return 'Next: Movement';
    case GamePhase.Movement:
      return 'Next: Combat';
    case GamePhase.Combat:
      return 'Next: Maintenance';
    case GamePhase.Maintenance:
      return 'End Turn';
  }
}
