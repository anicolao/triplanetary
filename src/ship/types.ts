// Type definitions for ships in the Triplanetary game

import { HexCoordinate } from '../hex/types';
import { OrdnanceInventory, createDefaultInventory } from '../ordnance/types';

/**
 * Velocity vector representation.
 * Represents the ship's current velocity as a hex coordinate offset.
 * The ship will move by this offset each turn (before thrust application).
 */
export interface VelocityVector {
  /** Velocity component in q direction */
  q: number;
  /** Velocity component in r direction */
  r: number;
}

/**
 * A single move in the ship's movement history.
 * Records the position and velocity for displaying historical paths.
 */
export interface MovementHistoryEntry {
  /** Position at the start of this move */
  fromPosition: HexCoordinate;
  /** Velocity used for this move */
  velocity: VelocityVector;
}

/**
 * Ship statistics and capabilities.
 * These define what a ship can do in the game.
 */
export interface ShipStats {
  /** Maximum thrust points available per turn */
  maxThrust: number;
  /** Maximum hull points (ship health) */
  maxHull: number;
  /** Current hull points */
  currentHull: number;
  /** Weapon strength (0 = unarmed) */
  weapons: number;
  /** Cargo capacity (0 = no cargo) */
  cargo: number;
}

/**
 * Ship data structure.
 * Represents a player's ship in the game.
 */
export interface Ship {
  /** Unique identifier for the ship */
  id: string;
  /** Display name of the ship */
  name: string;
  /** ID of the player who owns this ship */
  playerId: string;
  /** Current position on the hex grid */
  position: HexCoordinate;
  /** Current velocity vector */
  velocity: VelocityVector;
  /** Ship statistics and capabilities */
  stats: ShipStats;
  /** Remaining thrust points this turn */
  remainingThrust: number;
  /** Whether this ship is destroyed */
  destroyed: boolean;
  /** Number of turns remaining that ship is disabled (0 = not disabled) */
  disabledTurns: number;
  /** Ordnance inventory */
  ordnance: OrdnanceInventory;
  /** Gravity hexes entered on previous turn (for one-turn delay effect) */
  gravityHexesEntered?: HexCoordinate[];
  /** History of moves made by this ship. Cleared on destruction, refueling, or landing. */
  movementHistory: MovementHistoryEntry[];
}

/**
 * Helper function to create a new ship with default values.
 */
export function createShip(
  id: string,
  name: string,
  playerId: string,
  position: HexCoordinate,
  stats?: Partial<ShipStats>
): Ship {
  const defaultStats: ShipStats = {
    maxThrust: 2,
    maxHull: 6,
    currentHull: 6,
    weapons: 1,
    cargo: 0,
  };

  const shipStats: ShipStats = {
    ...defaultStats,
    ...stats,
  };

  return {
    id,
    name,
    playerId,
    position,
    velocity: { q: 0, r: 0 },
    stats: shipStats,
    remainingThrust: shipStats.maxThrust,
    destroyed: false,
    disabledTurns: 0,
    ordnance: createDefaultInventory(),
    gravityHexesEntered: [],
    movementHistory: [],
  };
}

/**
 * Helper function to generate unique ship ID.
 */
export function generateShipId(): string {
  return `ship-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
