// Type definitions for combat system in Triplanetary

/**
 * Weapon types available in the game
 */
export enum WeaponType {
  Laser = 'Laser',
  Missile = 'Missile',
  MassDriver = 'MassDriver',
}

/**
 * Properties for each weapon type
 */
export interface WeaponProperties {
  /** Maximum effective range in hexes */
  range: number;
  /** Base damage dealt on hit */
  damage: number;
  /** Base hit probability (0-1) */
  baseAccuracy: number;
  /** Display name for the weapon */
  displayName: string;
}

/**
 * Weapon configuration database
 */
export const WEAPON_CONFIG: Record<WeaponType, WeaponProperties> = {
  [WeaponType.Laser]: {
    range: 5,
    damage: 2,
    baseAccuracy: 0.7,
    displayName: 'Laser',
  },
  [WeaponType.Missile]: {
    range: 8,
    damage: 3,
    baseAccuracy: 0.6,
    displayName: 'Missile',
  },
  [WeaponType.MassDriver]: {
    range: 3,
    damage: 4,
    baseAccuracy: 0.8,
    displayName: 'Mass Driver',
  },
};

/**
 * Declared attack during Combat Phase
 */
export interface DeclaredAttack {
  /** ID of the attacking ship */
  attackerId: string;
  /** ID of the target ship */
  targetId: string;
  /** Weapon type being used */
  weaponType: WeaponType;
  /** Distance to target in hexes */
  range: number;
  /** Calculated hit probability */
  hitProbability: number;
  /** Modifiers applied to the attack */
  modifiers: CombatModifiers;
}

/**
 * Result of a combat attack
 */
export interface CombatResult {
  /** The declared attack */
  attack: DeclaredAttack;
  /** Whether the attack hit */
  hit: boolean;
  /** Damage dealt (0 if missed) */
  damageDealt: number;
  /** Whether the target was destroyed */
  targetDestroyed: boolean;
  /** Random roll value (for determinism in tests) */
  roll: number;
}

/**
 * Combat modifiers affecting hit probability
 */
export interface CombatModifiers {
  /** Range modifier (negative for longer range) */
  rangeModifier: number;
  /** Relative velocity modifier */
  velocityModifier: number;
  /** Total modifier (sum of all) */
  totalModifier: number;
}

/**
 * Combat log entry for displaying results
 */
export interface CombatLogEntry {
  /** Unique identifier for this log entry */
  id: string;
  /** Timestamp when the entry was created */
  timestamp: number;
  /** The combat result */
  result: CombatResult;
  /** Attacking ship name */
  attackerName: string;
  /** Target ship name */
  targetName: string;
  /** Message describing the combat action */
  message: string;
}

/**
 * Combat queue state - tracks all declared attacks for current phase
 */
export interface CombatQueue {
  /** Map of attacker ship ID to their declared attack */
  attacks: Map<string, DeclaredAttack>;
}

/**
 * Helper function to check if a ship can attack
 */
export function canShipAttack(weaponStrength: number): boolean {
  return weaponStrength > 0;
}

/**
 * Helper function to get available weapon types for a ship
 */
export function getAvailableWeapons(weaponStrength: number): WeaponType[] {
  if (weaponStrength === 0) {
    return [];
  }
  
  // Basic weapon strength allows laser
  const weapons: WeaponType[] = [WeaponType.Laser];
  
  // Higher weapon strength unlocks more weapon types
  if (weaponStrength >= 2) {
    weapons.push(WeaponType.Missile);
  }
  
  if (weaponStrength >= 3) {
    weapons.push(WeaponType.MassDriver);
  }
  
  return weapons;
}

/**
 * Generate unique combat log entry ID
 */
export function generateCombatLogId(): string {
  return `combat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
