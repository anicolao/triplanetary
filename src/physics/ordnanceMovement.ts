// Ordnance movement logic for the Movement Phase

import { Ordnance } from '../ordnance/types';

/**
 * Move ordnance based on their velocity
 * @param ordnance - Array of all ordnance
 * @param currentRound - Current round number
 * @returns Updated array of ordnance with new positions
 */
export function moveOrdnance(ordnance: Ordnance[], currentRound: number): Ordnance[] {
  return ordnance
    .map((ord) => {
      if (ord.detonated) {
        return ord;
      }

      // Calculate new position
      const newPosition = {
        q: ord.position.q + ord.velocity.q,
        r: ord.position.r + ord.velocity.r,
      };

      return {
        ...ord,
        position: newPosition,
      };
    })
    .filter((ord) => {
      // Remove detonated ordnance
      if (ord.detonated) {
        return false;
      }

      // Remove ordnance that has exceeded its lifetime
      if (ord.lifetime === -1) {
        // Indefinite lifetime (e.g., mines)
        return true;
      }

      const age = currentRound - ord.launchedTurn;
      return age < ord.lifetime; // Changed from <= to < to fix off-by-one
    });
}

/**
 * Check for ordnance collisions with ships or other ordnance
 * Returns array of ordnance IDs that should detonate
 */
export function checkOrdnanceCollisions(
  ordnance: Ordnance[],
  ships: { id: string; position: { q: number; r: number }; destroyed: boolean }[]
): string[] {
  const ordnanceToDetonate: string[] = [];

  ordnance.forEach((ord) => {
    if (ord.detonated) return;

    // Check collision with ships
    ships.forEach((ship) => {
      if (ship.destroyed) return;

      if (ship.position.q === ord.position.q && ship.position.r === ord.position.r) {
        // Mark ordnance for detonation
        if (!ordnanceToDetonate.includes(ord.id)) {
          ordnanceToDetonate.push(ord.id);
        }
      }
    });
  });

  return ordnanceToDetonate;
}
