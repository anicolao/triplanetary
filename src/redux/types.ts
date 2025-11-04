// State structure for the Triplanetary game

import { MapObject } from '../celestial/types';
import { Scenario, MapBounds } from '../celestial/scenario';
import { Ship, VelocityVector } from '../ship/types';
import { DeclaredAttack, CombatLogEntry } from '../combat/types';
import { Ordnance } from '../ordnance/types';

export type Screen = 'configuration' | 'gameplay';

export interface Player {
  id: string;
  color: string;
}

export interface PlottedMove {
  shipId: string;
  newVelocity: VelocityVector;
  thrustUsed: number;
}

// Game phases following Triplanetary rules
export enum GamePhase {
  Plot = 'Plot',
  Ordnance = 'Ordnance',
  Movement = 'Movement',
  Combat = 'Combat',
  Maintenance = 'Maintenance',
}

// Turn history entry
export interface TurnHistoryEntry {
  roundNumber: number;
  playerIndex: number;
  phase: GamePhase;
  timestamp: number;
}

// Notification for game events
export interface GameNotification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'collision' | 'destruction';
  timestamp: number;
}

export interface GameState {
  screen: Screen;
  players: Player[];
  ships: Ship[];
  selectedShipId: string | null;
  mapObjects: MapObject[];
  currentScenario: Scenario;
  mapBounds: MapBounds;
  // Plot Phase state
  plottedMoves: Map<string, PlottedMove>;
  showReachableHexes: boolean;
  // Turn management state
  currentPlayerIndex: number;
  turnOrder: string[]; // Player IDs in turn order
  currentPhase: GamePhase;
  roundNumber: number;
  turnHistory: TurnHistoryEntry[];
  // Notifications
  notifications: GameNotification[];
  // Combat Phase state
  declaredAttacks: Map<string, DeclaredAttack>;
  combatLog: CombatLogEntry[];
  selectedTargetId: string | null;
  // Ordnance state
  ordnance: Ordnance[];
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
