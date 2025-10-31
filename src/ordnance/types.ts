// Type definitions for ordnance in the Triplanetary game

import { HexCoordinate } from '../hex/types';
import { VelocityVector } from '../ship/types';

/**
 * Types of ordnance available in the game
 */
export enum OrdnanceType {
  Mine = 'Mine',
  Torpedo = 'Torpedo',
  Missile = 'Missile',
}

/**
 * Ordnance properties and state
 */
export interface Ordnance {
  /** Unique identifier for the ordnance */
  id: string;
  /** Type of ordnance */
  type: OrdnanceType;
  /** ID of the player who launched this ordnance */
  playerId: string;
  /** Current position on the hex grid */
  position: HexCoordinate;
  /** Current velocity vector (for moving ordnance like torpedoes/missiles) */
  velocity: VelocityVector;
  /** Damage dealt when detonated */
  damage: number;
  /** Turn number when this ordnance was launched */
  launchedTurn: number;
  /** Lifetime in turns (for auto-detonation, -1 for indefinite) */
  lifetime: number;
  /** Whether this ordnance has detonated */
  detonated: boolean;
}

/**
 * Ordnance inventory for a ship
 */
export interface OrdnanceInventory {
  mines: number;
  torpedoes: number;
  missiles: number;
}

/**
 * Helper function to create a new ordnance
 */
export function createOrdnance(
  id: string,
  type: OrdnanceType,
  playerId: string,
  position: HexCoordinate,
  velocity: VelocityVector,
  launchedTurn: number
): Ordnance {
  // Set properties based on ordnance type
  let damage: number;
  let lifetime: number;

  switch (type) {
    case OrdnanceType.Mine:
      damage = 4;
      lifetime = -1; // Mines persist indefinitely
      break;
    case OrdnanceType.Torpedo:
      damage = 3;
      lifetime = 10; // Torpedoes last 10 turns
      break;
    case OrdnanceType.Missile:
      damage = 2;
      lifetime = 15; // Missiles last 15 turns
      break;
  }

  return {
    id,
    type,
    playerId,
    position,
    velocity,
    damage,
    launchedTurn,
    lifetime,
    detonated: false,
  };
}

/**
 * Helper function to generate unique ordnance ID
 */
export function generateOrdnanceId(): string {
  return `ordnance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Helper function to create default ordnance inventory
 */
export function createDefaultInventory(): OrdnanceInventory {
  return {
    mines: 2,
    torpedoes: 2,
    missiles: 2,
  };
}
