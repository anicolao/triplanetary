// Type definitions for combat system in Triplanetary
// Based on official 2018 Triplanetary rules

/**
 * Combat odds ratios from the official rules
 * Attacker:Defender ratio, reduced to standard odds
 */
export type CombatOdds = '1:4' | '1:2' | '1:1' | '2:1' | '3:1' | '4:1';

/**
 * Combat result from damage table
 * - = No effect/miss
 * D1-D5 = Disabled for that many turns
 * E = Eliminated (destroyed)
 */
export type CombatDamage = '–' | 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'E';

/**
 * Combat Results Table from official 2018 Triplanetary rules
 * Roll 1d6, modified by range and relative velocity
 * [Roll][Odds] = Damage Result
 */
export const COMBAT_RESULTS_TABLE: Record<number, Record<CombatOdds, CombatDamage>> = {
  1: { '1:4': '–', '1:2': '–', '1:1': '–', '2:1': '–', '3:1': '–', '4:1': 'D2' },
  2: { '1:4': '–', '1:2': '–', '1:1': '–', '2:1': '–', '3:1': 'D2', '4:1': 'D3' },
  3: { '1:4': '–', '1:2': '–', '1:1': '–', '2:1': 'D2', '3:1': 'D3', '4:1': 'D4' },
  4: { '1:4': '–', '1:2': '–', '1:1': 'D2', '2:1': 'D3', '3:1': 'D4', '4:1': 'D5' },
  5: { '1:4': '–', '1:2': 'D2', '1:1': 'D3', '2:1': 'D4', '3:1': 'D5', '4:1': 'E' },
  6: { '1:4': 'D1', '1:2': 'D3', '1:1': 'D4', '2:1': 'D5', '3:1': 'E', '4:1': 'E' },
};

/**
 * Declared attack during Combat Phase
 */
export interface DeclaredAttack {
  /** ID of the attacking ship */
  attackerId: string;
  /** ID of the target ship */
  targetId: string;
  /** Combat strength of attacker */
  attackerStrength: number;
  /** Combat strength of defender */
  defenderStrength: number;
  /** Combat odds ratio */
  odds: CombatOdds;
  /** Distance to target in hexes */
  range: number;
  /** Relative velocity difference in hexes */
  relativeVelocity: number;
  /** Die roll modifier from range */
  rangeModifier: number;
  /** Die roll modifier from velocity */
  velocityModifier: number;
  /** Total die roll modifier */
  totalModifier: number;
}

/**
 * Result of a combat attack
 */
export interface CombatResult {
  /** The declared attack */
  attack: DeclaredAttack;
  /** Raw die roll (1-6) */
  dieRoll: number;
  /** Modified die roll after applying modifiers */
  modifiedRoll: number;
  /** Damage result from combat table */
  damageResult: CombatDamage;
  /** Number of turns disabled (0 if not disabled) */
  turnsDisabled: number;
  /** Whether the target was destroyed */
  targetDestroyed: boolean;
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
 * Commercial ships with 'D' suffix cannot attack (only defend)
 */
export function canShipAttack(combatStrength: number): boolean {
  return combatStrength > 0;
}

/**
 * Calculate combat odds from attacker and defender strengths
 * Rounds in favor of the defender per official rules
 */
export function calculateCombatOdds(attackerStrength: number, defenderStrength: number): CombatOdds {
  if (attackerStrength === 0 || defenderStrength === 0) {
    return '1:1'; // Default case
  }
  
  const ratio = attackerStrength / defenderStrength;
  
  // Attacks at better than 4:1 are treated as 4:1
  if (ratio >= 4) return '4:1';
  if (ratio >= 3) return '3:1';
  if (ratio >= 2) return '2:1';
  if (ratio >= 1) return '1:1';
  if (ratio >= 0.5) return '1:2';
  // Attacks at less than 1:4 have no effect (but we return 1:4 for calculation)
  return '1:4';
}

/**
 * Parse damage result to get number of turns disabled
 * Returns 0 for miss ('–'), 1-5 for disabled turns, 6 for eliminated
 */
export function parseDamageResult(damage: CombatDamage): number {
  if (damage === '–') return 0;
  if (damage === 'E') return 6; // Eliminated = D6 or greater
  // Extract number from D1-D5
  return parseInt(damage.substring(1));
}

/**
 * Generate unique combat log entry ID
 */
export function generateCombatLogId(): string {
  return `combat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
