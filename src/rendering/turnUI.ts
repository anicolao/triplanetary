// UI elements for turn management display

import { GamePhase } from '../redux/types';
import { VictoryState } from '../victory/types';

export interface TurnUIButton {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  enabled: boolean;
  action: 'next-phase' | 'next-turn' | 'toggle-map-layout';
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
  
  // Victory status (optional)
  victoryBoxX?: number;
  victoryBoxY?: number;
  victoryBoxWidth?: number;
  victoryBoxHeight?: number;
  victoryText?: string;
  victoryColor?: string;
  showVictory: boolean;
  
  // Action buttons
  nextPhaseButton: TurnUIButton;
  mapLayoutButton: TurnUIButton;
}

export function createTurnUILayout(
  canvasWidth: number,
  _canvasHeight: number,
  currentPhase: GamePhase,
  currentPlayerIndex: number,
  playerCount: number,
  roundNumber: number,
  playerColor: string,
  allShipsPlotted: boolean = true,
  victoryState?: VictoryState,
  playerIds?: string[],
  currentMapLayout: 'modern' | 'original' = 'modern'
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
  
  // Victory status box (if game is won)
  let victoryBoxX: number | undefined;
  let victoryBoxY: number | undefined;
  let victoryText: string | undefined;
  let victoryColor: string | undefined;
  let buttonY = roundBoxY + boxHeight + spacing * 2;
  
  if (victoryState?.gameWon) {
    victoryBoxX = phaseBoxX;
    victoryBoxY = roundBoxY + boxHeight + spacing;
    
    // Find the winner's player number
    let winnerText = 'Game Over: Draw';
    if (victoryState.winnerId && playerIds) {
      const winnerIndex = playerIds.findIndex(id => id === victoryState.winnerId);
      if (winnerIndex !== -1) {
        winnerText = `Winner: Player ${winnerIndex + 1}`;
      }
    }
    
    victoryText = winnerText;
    victoryColor = '#4ae24a'; // Green for victory
    buttonY = victoryBoxY + boxHeight + spacing * 2; // Move button down
  }
  
  // Next phase button
  const buttonWidth = boxWidth;
  const buttonHeight = 40;
  // In Plot phase, button is only enabled if all ships are plotted
  // Disable button if game is won
  const isEnabled = victoryState?.gameWon 
    ? false 
    : (currentPhase === GamePhase.Plot ? allShipsPlotted : true);
  const nextPhaseButton: TurnUIButton = {
    x: phaseBoxX,
    y: buttonY,
    width: buttonWidth,
    height: buttonHeight,
    text: victoryState?.gameWon 
      ? 'Game Over' 
      : getNextPhaseButtonText(currentPhase, allShipsPlotted),
    enabled: isEnabled,
    action: currentPhase === GamePhase.Maintenance ? 'next-turn' : 'next-phase',
  };
  
  // Map layout toggle button (below next phase button)
  const mapLayoutButtonY = buttonY + buttonHeight + spacing;
  const mapLayoutButton: TurnUIButton = {
    x: phaseBoxX,
    y: mapLayoutButtonY,
    width: buttonWidth,
    height: 35,
    text: currentMapLayout === 'modern' ? 'Use Original Map' : 'Use Modern Map',
    enabled: true,
    action: 'toggle-map-layout',
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
    victoryBoxX,
    victoryBoxY,
    victoryBoxWidth: boxWidth,
    victoryBoxHeight: boxHeight,
    victoryText,
    victoryColor,
    showVictory: victoryState?.gameWon || false,
    nextPhaseButton,
    mapLayoutButton,
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
