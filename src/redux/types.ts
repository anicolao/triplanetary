// State structure for the Triplanetary game

export type Screen = 'configuration' | 'gameplay';

export type Phase = 'plot' | 'ordnance' | 'movement' | 'combat' | 'maintenance';

export interface Player {
  id: string;
  color: string;
}

// Ship position in hex coordinates
export interface HexPosition {
  q: number; // column
  r: number; // row
}

// Ship velocity vector in hex coordinates
export interface HexVelocity {
  dq: number; // change in q per turn
  dr: number; // change in r per turn
}

// Ship state
export interface Ship {
  id: string;
  ownerId: string; // Player ID who owns this ship
  type: 'corvette'; // Ship type (only corvette for now)
  position: HexPosition;
  velocity: HexVelocity;
  thrustPoints: number; // Available thrust for this turn
  maxThrust: number; // Maximum thrust per turn
  hullPoints: number;
  maxHullPoints: number;
}

export interface GameplayState {
  currentRound: number;
  playerTurnOrder: string[]; // Array of player IDs in turn order
  currentPlayerIndex: number; // Index into playerTurnOrder
  currentPhase: Phase;
  ships: Ship[]; // All ships in the game
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
