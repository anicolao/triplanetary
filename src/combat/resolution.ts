// Combat resolution logic for Triplanetary

import { Ship, VelocityVector } from '../ship/types';
import { HexCoordinate } from '../hex/types';
import { hexDistance } from '../hex/operations';
import {
  WeaponType,
  WEAPON_CONFIG,
  DeclaredAttack,
  CombatResult,
  CombatModifiers,
} from './types';

/**
 * Calculate the range between two ships
 */
export function calculateRange(pos1: HexCoordinate, pos2: HexCoordinate): number {
  return hexDistance(pos1, pos2);
}

/**
 * Calculate combat modifiers based on range and velocity
 */
export function calculateCombatModifiers(
  attacker: Ship,
  target: Ship,
  weaponType: WeaponType
): CombatModifiers {
  const range = calculateRange(attacker.position, target.position);
  const weaponProps = WEAPON_CONFIG[weaponType];
  
  // Range modifier: -0.1 per hex beyond optimal range (half of max range)
  const optimalRange = Math.floor(weaponProps.range / 2);
  const rangeModifier = range > optimalRange 
    ? -(range - optimalRange) * 0.1 
    : 0;
  
  // Relative velocity modifier: harder to hit fast-moving targets
  const relativeVelocity = calculateRelativeVelocity(attacker.velocity, target.velocity);
  const velocityModifier = -relativeVelocity * 0.05;
  
  const totalModifier = rangeModifier + velocityModifier;
  
  return {
    rangeModifier,
    velocityModifier,
    totalModifier,
  };
}

/**
 * Calculate relative velocity between two ships
 */
function calculateRelativeVelocity(v1: VelocityVector, v2: VelocityVector): number {
  const dq = v1.q - v2.q;
  const dr = v1.r - v2.r;
  return Math.sqrt(dq * dq + dr * dr);
}

/**
 * Calculate hit probability for an attack
 */
export function calculateHitProbability(
  attacker: Ship,
  target: Ship,
  weaponType: WeaponType
): number {
  const weaponProps = WEAPON_CONFIG[weaponType];
  const modifiers = calculateCombatModifiers(attacker, target, weaponType);
  
  // Base accuracy + modifiers (clamped between 0.05 and 0.95)
  const probability = weaponProps.baseAccuracy + modifiers.totalModifier;
  return Math.max(0.05, Math.min(0.95, probability));
}

/**
 * Check if a target is within range of a weapon
 */
export function isTargetInRange(
  attacker: Ship,
  target: Ship,
  weaponType: WeaponType
): boolean {
  const range = calculateRange(attacker.position, target.position);
  const weaponProps = WEAPON_CONFIG[weaponType];
  return range <= weaponProps.range && range > 0;
}

/**
 * Create a declared attack
 */
export function createDeclaredAttack(
  attacker: Ship,
  target: Ship,
  weaponType: WeaponType
): DeclaredAttack {
  const range = calculateRange(attacker.position, target.position);
  const hitProbability = calculateHitProbability(attacker, target, weaponType);
  const modifiers = calculateCombatModifiers(attacker, target, weaponType);
  
  return {
    attackerId: attacker.id,
    targetId: target.id,
    weaponType,
    range,
    hitProbability,
    modifiers,
  };
}

/**
 * Resolve a declared attack and determine if it hits
 * @param attack The declared attack to resolve
 * @param randomRoll Optional random roll value (0-1) for testing, uses Math.random() if not provided
 */
export function resolveAttack(
  attack: DeclaredAttack,
  target: Ship,
  randomRoll?: number
): CombatResult {
  const roll = randomRoll !== undefined ? randomRoll : Math.random();
  const hit = roll < attack.hitProbability;
  
  let damageDealt = 0;
  let targetDestroyed = false;
  
  if (hit) {
    const weaponProps = WEAPON_CONFIG[attack.weaponType];
    damageDealt = weaponProps.damage;
    
    // Check if target is destroyed
    const remainingHull = target.stats.currentHull - damageDealt;
    targetDestroyed = remainingHull <= 0;
  }
  
  return {
    attack,
    hit,
    damageDealt,
    targetDestroyed,
    roll,
  };
}

/**
 * Get all valid targets for a ship
 * Returns all enemy ships within range of any weapon
 */
export function getValidTargets(
  attacker: Ship,
  allShips: Ship[],
  weaponType: WeaponType
): Ship[] {
  return allShips.filter(ship => 
    ship.id !== attacker.id &&
    ship.playerId !== attacker.playerId &&
    !ship.destroyed &&
    isTargetInRange(attacker, ship, weaponType)
  );
}

/**
 * Check if a ship has any valid targets
 */
export function hasValidTargets(
  attacker: Ship,
  allShips: Ship[],
  weaponTypes: WeaponType[]
): boolean {
  return weaponTypes.some(weaponType => 
    getValidTargets(attacker, allShips, weaponType).length > 0
  );
}
