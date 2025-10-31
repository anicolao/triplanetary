// Combat queue management for tracking declared attacks

import { Ship } from '../ship/types';
import { DeclaredAttack, CombatResult, CombatLogEntry, generateCombatLogId } from './types';
import { resolveAttack } from './resolution';

/**
 * Check if all ships that can attack have declared an attack
 */
export function areAllAttacksDeclared(
  ships: Ship[],
  currentPlayerId: string,
  _declaredAttacks: Map<string, DeclaredAttack>
): boolean {
  // Get all ships owned by current player that can attack
  const playerShips = ships.filter(
    ship => ship.playerId === currentPlayerId && 
            !ship.destroyed && 
            ship.stats.weapons > 0
  );
  
  // If no ships can attack, consider all attacks declared
  if (playerShips.length === 0) {
    return true;
  }
  
  // Check if all attacking ships have declared
  // Note: Ships can choose not to attack, so we don't require all ships to attack
  // Instead, we'll provide a UI button to confirm "done declaring attacks"
  return false; // Will be controlled by UI button
}

/**
 * Execute all declared attacks and generate results
 */
export function executeCombatPhase(
  declaredAttacks: Map<string, DeclaredAttack>,
  ships: Ship[]
): {
  results: CombatResult[];
  updatedShips: Ship[];
  logEntries: CombatLogEntry[];
} {
  const results: CombatResult[] = [];
  const logEntries: CombatLogEntry[] = [];
  
  // Create a working copy of ships for damage application
  const updatedShips = ships.map(ship => ({ ...ship }));
  const shipMap = new Map(updatedShips.map(ship => [ship.id, ship]));
  
  // Resolve each attack
  declaredAttacks.forEach(attack => {
    const target = shipMap.get(attack.targetId);
    if (!target || target.destroyed) {
      return; // Skip if target is already destroyed
    }
    
    const result = resolveAttack(attack, target);
    results.push(result);
    
    // Apply damage to target
    if (result.hit) {
      target.stats.currentHull -= result.damageDealt;
      
      // Check if ship is destroyed
      if (target.stats.currentHull <= 0) {
        target.stats.currentHull = 0;
        target.destroyed = true;
      }
    }
    
    // Create log entry
    const attacker = shipMap.get(attack.attackerId);
    const logEntry = createCombatLogEntry(result, attacker?.name || 'Unknown', target.name);
    logEntries.push(logEntry);
  });
  
  return {
    results,
    updatedShips,
    logEntries,
  };
}

/**
 * Create a combat log entry from a result
 */
function createCombatLogEntry(
  result: CombatResult,
  attackerName: string,
  targetName: string
): CombatLogEntry {
  let message: string;
  
  if (result.hit) {
    if (result.targetDestroyed) {
      message = `${attackerName} destroyed ${targetName} with ${result.attack.weaponType}! (${result.damageDealt} damage)`;
    } else {
      message = `${attackerName} hit ${targetName} with ${result.attack.weaponType} for ${result.damageDealt} damage!`;
    }
  } else {
    message = `${attackerName} missed ${targetName} with ${result.attack.weaponType}.`;
  }
  
  return {
    id: generateCombatLogId(),
    timestamp: Date.now(),
    result,
    attackerName,
    targetName,
    message,
  };
}

/**
 * Clear all declared attacks (typically at end of phase)
 */
export function clearCombatQueue(
  _declaredAttacks: Map<string, DeclaredAttack>
): Map<string, DeclaredAttack> {
  return new Map();
}
