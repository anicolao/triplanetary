// Victory condition types and structures for Triplanetary

import { HexCoordinate } from '../hex/types';

/**
 * Victory condition types supported by the game.
 */
export enum VictoryConditionType {
  /** Eliminate all opposing players' ships */
  Elimination = 'elimination',
  /** Reach a specific hex coordinate */
  ReachDestination = 'reach-destination',
  /** Visit multiple checkpoints in order */
  RaceCheckpoints = 'race-checkpoints',
  /** Survive for a certain number of rounds */
  Survival = 'survival',
  /** Destroy a specific number of enemy ships */
  DestroyShips = 'destroy-ships',
  /** Control specific locations */
  ControlLocations = 'control-locations',
}

/**
 * Base interface for victory conditions.
 */
export interface VictoryCondition {
  type: VictoryConditionType;
  description: string;
}

/**
 * Elimination victory: Last player standing wins.
 */
export interface EliminationVictory extends VictoryCondition {
  type: VictoryConditionType.Elimination;
}

/**
 * Destination victory: First player to reach the destination wins.
 */
export interface DestinationVictory extends VictoryCondition {
  type: VictoryConditionType.ReachDestination;
  destination: HexCoordinate;
  destinationName?: string;
}

/**
 * Checkpoint definition for racing scenarios.
 */
export interface Checkpoint {
  position: HexCoordinate;
  name: string;
  order: number;
}

/**
 * Race victory: First player to visit all checkpoints in order wins.
 */
export interface RaceVictory extends VictoryCondition {
  type: VictoryConditionType.RaceCheckpoints;
  checkpoints: Checkpoint[];
}

/**
 * Survival victory: Last player(s) with ships after N rounds win.
 */
export interface SurvivalVictory extends VictoryCondition {
  type: VictoryConditionType.Survival;
  rounds: number;
}

/**
 * Destroy ships victory: First player to destroy N enemy ships wins.
 */
export interface DestroyShipsVictory extends VictoryCondition {
  type: VictoryConditionType.DestroyShips;
  shipsToDestroy: number;
}

/**
 * Control locations victory: Control specific hexes for N turns.
 */
export interface ControlLocationsVictory extends VictoryCondition {
  type: VictoryConditionType.ControlLocations;
  locations: HexCoordinate[];
  turnsToControl: number;
}

/**
 * Union type of all victory conditions.
 */
export type AnyVictoryCondition =
  | EliminationVictory
  | DestinationVictory
  | RaceVictory
  | SurvivalVictory
  | DestroyShipsVictory
  | ControlLocationsVictory;

/**
 * Victory state for a player or game.
 */
export interface VictoryState {
  /** Has the game been won? */
  gameWon: boolean;
  /** ID of the winning player (if any) */
  winnerId: string | null;
  /** Reason for victory */
  victoryReason?: string;
  /** Player-specific progress tracking */
  playerProgress: Map<string, PlayerVictoryProgress>;
}

/**
 * Track individual player progress toward victory conditions.
 */
export interface PlayerVictoryProgress {
  playerId: string;
  /** Checkpoints visited (for racing) */
  checkpointsVisited?: number[];
  /** Enemy ships destroyed */
  shipsDestroyed?: number;
  /** Turns controlling locations */
  turnsControlling?: number;
}
