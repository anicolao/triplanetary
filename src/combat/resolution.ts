// Combat resolution logic for Triplanetary
// Based on official 2018 Triplanetary rules

import { Ship, VelocityVector } from '../ship/types';
import { HexCoordinate } from '../hex/types';
import { hexDistance } from '../hex/operations';
import {
  DeclaredAttack,
  CombatResult,
  calculateCombatOdds,
  COMBAT_RESULTS_TABLE,
  parseDamageResult,
} from './types';

/**
 * Calculate the range between two ships (in hexes)
 */
export function calculateRange(pos1: HexCoordinate, pos2: HexCoordinate): number {
  return hexDistance(pos1, pos2);
}

/**
 * Calculate relative velocity difference between two ships
 * Plot both ships' course vectors from a common point and count hexes between endpoints
 */
export function calculateRelativeVelocity(v1: VelocityVector, v2: VelocityVector): number {
  const dq = v1.q - v2.q;
  const dr = v1.r - v2.r;
  // Use Manhattan distance in hex space
  const s1 = -v1.q - v1.r;
  const s2 = -v2.q - v2.r;
  const ds = s1 - s2;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) / 2;
}

/**
 * Calculate die roll modifiers for combat
 * Per official rules:
 * - Subtract 1 for each hex of range
 * - Subtract 1 for each hex of relative velocity > 2
 */
export function calculateModifiers(range: number, relativeVelocity: number): {
  rangeModifier: number;
  velocityModifier: number;
  totalModifier: number;
} {
  const rangeModifier = -range;
  const velocityModifier = relativeVelocity > 2 ? -(relativeVelocity - 2) : 0;
  const totalModifier = rangeModifier + velocityModifier;
  
  return {
    rangeModifier,
    velocityModifier,
    totalModifier,
  };
}

/**
 * Create a declared attack following official Triplanetary rules
 */
export function createDeclaredAttack(
  attacker: Ship,
  target: Ship
): DeclaredAttack {
  const attackerStrength = attacker.stats.weapons;
  const defenderStrength = target.stats.weapons;
  const odds = calculateCombatOdds(attackerStrength, defenderStrength);
  const range = calculateRange(attacker.position, target.position);
  const relativeVelocity = calculateRelativeVelocity(attacker.velocity, target.velocity);
  const { rangeModifier, velocityModifier, totalModifier } = calculateModifiers(range, relativeVelocity);
  
  return {
    attackerId: attacker.id,
    targetId: target.id,
    attackerStrength,
    defenderStrength,
    odds,
    range,
    relativeVelocity,
    rangeModifier,
    velocityModifier,
    totalModifier,
  };
}

/**
 * Resolve a declared attack using official Triplanetary combat rules
 * @param attack The declared attack to resolve
 * @param dieRoll Optional die roll (1-6) for testing, uses random if not provided
 */
export function resolveAttack(
  attack: DeclaredAttack,
  dieRoll?: number
): CombatResult {
  // Roll 1d6 if not provided
  const rawRoll = dieRoll !== undefined ? dieRoll : Math.floor(Math.random() * 6) + 1;
  
  // Apply modifiers (range and velocity)
  let modifiedRoll = rawRoll + attack.totalModifier;
  
  // Clamp to valid range per official rules
  // "A die roll modified to less than 1 has no effect"
  // "A die roll modified to more than 6 is 6"
  if (modifiedRoll < 1) {
    modifiedRoll = 0; // Will result in no effect
  } else if (modifiedRoll > 6) {
    modifiedRoll = 6;
  }
  
  // Look up damage result from combat table
  let damageResult: string;
  if (modifiedRoll < 1 || attack.odds === '1:4') {
    // Attacks at less than 1:4 have no effect per rules
    // Modified roll < 1 also has no effect
    damageResult = '–';
  } else {
    damageResult = COMBAT_RESULTS_TABLE[modifiedRoll][attack.odds];
  }
  
  // Parse damage result
  const turnsDisabled = parseDamageResult(damageResult as any);
  const targetDestroyed = turnsDisabled >= 6; // D6 or E means destroyed
  
  return {
    attack,
    dieRoll: rawRoll,
    modifiedRoll,
    damageResult: damageResult as any,
    turnsDisabled,
    targetDestroyed,
  };
}

/**
 * Get all valid targets for a ship
 * Returns all enemy ships (guns can fire at any range with modifiers)
 */
export function getValidTargets(
  attacker: Ship,
  allShips: Ship[]
): Ship[] {
  return allShips.filter(ship => 
    ship.id !== attacker.id &&
    ship.playerId !== attacker.playerId &&
    !ship.destroyed
  );
}

/**
 * Check if a ship has any valid targets
 */
export function hasValidTargets(
  attacker: Ship,
  allShips: Ship[]
): boolean {
  return getValidTargets(attacker, allShips).length > 0;
}
