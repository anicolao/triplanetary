// Plot queue management utilities

import { Ship } from '../ship/types';
import { PlottedMove } from '../redux/types';

/**
 * Checks if all ships belonging to a player have been plotted.
 * 
 * @param ships - Array of all ships in the game
 * @param plottedMoves - Map of ship IDs to their plotted moves
 * @param currentPlayerId - ID of the current player
 * @returns true if all of the current player's active ships have plotted moves
 */
export function areAllShipsPlotted(
  ships: Ship[],
  plottedMoves: Map<string, PlottedMove>,
  currentPlayerId: string
): boolean {
  // Get all active ships for the current player
  const playerShips = ships.filter(
    (ship) => ship.playerId === currentPlayerId && !ship.destroyed
  );

  // If player has no active ships, consider it as "all plotted"
  if (playerShips.length === 0) {
    return true;
  }

  // Check if every active ship has a plotted move
  return playerShips.every((ship) => plottedMoves.has(ship.id));
}

/**
 * Gets the count of plotted ships vs total active ships for a player.
 * 
 * @param ships - Array of all ships in the game
 * @param plottedMoves - Map of ship IDs to their plotted moves
 * @param currentPlayerId - ID of the current player
 * @returns Object with plottedCount and totalCount
 */
export function getPlottingStatus(
  ships: Ship[],
  plottedMoves: Map<string, PlottedMove>,
  currentPlayerId: string
): { plottedCount: number; totalCount: number } {
  const playerShips = ships.filter(
    (ship) => ship.playerId === currentPlayerId && !ship.destroyed
  );

  const plottedCount = playerShips.filter((ship) =>
    plottedMoves.has(ship.id)
  ).length;

  return {
    plottedCount,
    totalCount: playerShips.length,
  };
}

/**
 * Validates that plot can be executed (all ships are plotted).
 * 
 * @param ships - Array of all ships in the game
 * @param plottedMoves - Map of ship IDs to their plotted moves
 * @param currentPlayerId - ID of the current player
 * @returns true if ready to proceed to next phase
 */
export function canProceedFromPlotPhase(
  ships: Ship[],
  plottedMoves: Map<string, PlottedMove>,
  currentPlayerId: string
): boolean {
  return areAllShipsPlotted(ships, plottedMoves, currentPlayerId);
}
