// State structure for the Triplanetary game

export type Screen = 'configuration' | 'gameplay';

export type Phase = 'plot' | 'ordnance' | 'movement' | 'combat' | 'maintenance';

export interface Player {
  id: string;
  color: string;
}

export interface GameplayState {
  currentRound: number;
  playerTurnOrder: string[]; // Array of player IDs in turn order
  currentPlayerIndex: number; // Index into playerTurnOrder
  currentPhase: Phase;
}

export interface GameState {
  screen: Screen;
  players: Player[];
  gameplay: GameplayState | null; // null when not in gameplay
}

// Available color-blind friendly palette
export const PLAYER_COLORS = [
  '#0173B2', // Blue
  '#DE8F05', // Orange
  '#029E73', // Green
  '#ECE133', // Yellow
  '#CC78BC', // Purple
  '#CA5127', // Red
] as const;

export const MAX_PLAYERS = 6;
