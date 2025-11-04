// Victory condition evaluation logic

import { Ship } from '../ship/types';
import { HexCoordinate } from '../hex/types';
import {
  AnyVictoryCondition,
  VictoryConditionType,
  VictoryState,
  EliminationVictory,
  DestinationVictory,
  RaceVictory,
  SurvivalVictory,
  DestroyShipsVictory,
  ControlLocationsVictory,
} from './types';

/**
 * Check if two hex coordinates are equal.
 */
function hexEquals(a: HexCoordinate, b: HexCoordinate): boolean {
  return a.q === b.q && a.r === b.r;
}

/**
 * Get all active (non-destroyed) ships for a player.
 */
function getPlayerShips(ships: Ship[], playerId: string): Ship[] {
  return ships.filter((s) => s.playerId === playerId && !s.destroyed);
}

/**
 * Get all player IDs that have ships.
 */
function getPlayersWithShips(ships: Ship[]): Set<string> {
  const playerIds = new Set<string>();
  ships.forEach((ship) => {
    if (!ship.destroyed) {
      playerIds.add(ship.playerId);
    }
  });
  return playerIds;
}

/**
 * Evaluate elimination victory condition.
 * Winner is the last player with ships remaining.
 */
function evaluateElimination(
  _condition: EliminationVictory,
  ships: Ship[],
  currentState: VictoryState
): VictoryState {
  const playersWithShips = getPlayersWithShips(ships);

  if (playersWithShips.size === 1) {
    const winnerId = Array.from(playersWithShips)[0];
    return {
      ...currentState,
      gameWon: true,
      winnerId,
      victoryReason: 'Elimination: Last player standing',
    };
  }

  if (playersWithShips.size === 0) {
    // All ships destroyed - draw
    return {
      ...currentState,
      gameWon: true,
      winnerId: null,
      victoryReason: 'Draw: All ships destroyed',
    };
  }

  return currentState;
}

/**
 * Evaluate destination victory condition.
 * Winner is first player to reach the destination.
 */
function evaluateDestination(
  condition: DestinationVictory,
  ships: Ship[],
  currentState: VictoryState
): VictoryState {
  for (const ship of ships) {
    if (!ship.destroyed && hexEquals(ship.position, condition.destination)) {
      const destName = condition.destinationName || 'destination';
      return {
        ...currentState,
        gameWon: true,
        winnerId: ship.playerId,
        victoryReason: `Reached ${destName}`,
      };
    }
  }

  return currentState;
}

/**
 * Evaluate race victory condition.
 * Winner is first player to visit all checkpoints in order.
 */
function evaluateRace(
  condition: RaceVictory,
  ships: Ship[],
  currentState: VictoryState
): VictoryState {
  // Update checkpoint progress for all players
  const newPlayerProgress = new Map(currentState.playerProgress);

  for (const ship of ships) {
    if (ship.destroyed) continue;

    const playerId = ship.playerId;
    let progress = newPlayerProgress.get(playerId);

    if (!progress) {
      progress = {
        playerId,
        checkpointsVisited: [],
      };
      newPlayerProgress.set(playerId, progress);
    }

    // Check if ship is at the next checkpoint
    const nextCheckpointIndex = (progress.checkpointsVisited?.length || 0);
    if (nextCheckpointIndex < condition.checkpoints.length) {
      const nextCheckpoint = condition.checkpoints[nextCheckpointIndex];
      if (hexEquals(ship.position, nextCheckpoint.position)) {
        // Add this checkpoint to visited list
        progress.checkpointsVisited = [
          ...(progress.checkpointsVisited || []),
          nextCheckpoint.order,
        ];
        newPlayerProgress.set(playerId, progress);

        // Check if player completed all checkpoints
        if (progress.checkpointsVisited.length === condition.checkpoints.length) {
          return {
            gameWon: true,
            winnerId: playerId,
            victoryReason: 'Completed all race checkpoints',
            playerProgress: newPlayerProgress,
          };
        }
      }
    }
  }

  return {
    ...currentState,
    playerProgress: newPlayerProgress,
  };
}

/**
 * Evaluate survival victory condition.
 * Winner is player(s) with ships after specified rounds.
 */
function evaluateSurvival(
  condition: SurvivalVictory,
  ships: Ship[],
  roundNumber: number,
  currentState: VictoryState
): VictoryState {
  if (roundNumber < condition.rounds) {
    return currentState;
  }

  // Game has reached the survival round limit
  const playersWithShips = getPlayersWithShips(ships);

  if (playersWithShips.size === 0) {
    return {
      ...currentState,
      gameWon: true,
      winnerId: null,
      victoryReason: 'Draw: No survivors',
    };
  }

  if (playersWithShips.size === 1) {
    const winnerId = Array.from(playersWithShips)[0];
    return {
      ...currentState,
      gameWon: true,
      winnerId,
      victoryReason: `Survived ${condition.rounds} rounds`,
    };
  }

  // Multiple players survived
  return {
    ...currentState,
    gameWon: true,
    winnerId: null,
    victoryReason: `Multiple players survived ${condition.rounds} rounds`,
  };
}

/**
 * Evaluate destroy ships victory condition.
 * Winner is first player to destroy specified number of enemy ships.
 */
function evaluateDestroyShips(
  condition: DestroyShipsVictory,
  ships: Ship[],
  currentState: VictoryState
): VictoryState {
  // Track destroyed ships per player
  const newPlayerProgress = new Map(currentState.playerProgress);

  // Note: This is a simplified implementation that counts all destroyed ships.
  // A more complete implementation would track who destroyed which ships.
  // For MVP, we'll count destroyed enemy ships as progress.
  const allPlayerIds = new Set(ships.map((s) => s.playerId));

  for (const playerId of allPlayerIds) {
    const enemyShipsDestroyed = ships.filter(
      (s) => s.destroyed && s.playerId !== playerId
    ).length;

    let progress = newPlayerProgress.get(playerId);
    if (!progress) {
      progress = { playerId, shipsDestroyed: 0 };
    }
    progress.shipsDestroyed = enemyShipsDestroyed;
    newPlayerProgress.set(playerId, progress);

    if (enemyShipsDestroyed >= condition.shipsToDestroy) {
      return {
        gameWon: true,
        winnerId: playerId,
        victoryReason: `Destroyed ${condition.shipsToDestroy} enemy ships`,
        playerProgress: newPlayerProgress,
      };
    }
  }

  return {
    ...currentState,
    playerProgress: newPlayerProgress,
  };
}

/**
 * Evaluate control locations victory condition.
 * Winner is player who controls all locations for specified turns.
 */
function evaluateControlLocations(
  condition: ControlLocationsVictory,
  ships: Ship[],
  currentState: VictoryState
): VictoryState {
  // For MVP, simplified: player controls a location if they have a ship there
  const newPlayerProgress = new Map(currentState.playerProgress);

  // Check which players control all locations
  const allPlayerIds = new Set(ships.filter((s) => !s.destroyed).map((s) => s.playerId));

  for (const playerId of allPlayerIds) {
    const playerShips = getPlayerShips(ships, playerId);
    const controlsAll = condition.locations.every((loc) =>
      playerShips.some((ship) => hexEquals(ship.position, loc))
    );

    let progress = newPlayerProgress.get(playerId);
    if (!progress) {
      progress = { playerId, turnsControlling: 0 };
      newPlayerProgress.set(playerId, progress);
    }

    if (controlsAll) {
      progress.turnsControlling = (progress.turnsControlling || 0) + 1;
      newPlayerProgress.set(playerId, progress);

      if (progress.turnsControlling >= condition.turnsToControl) {
        return {
          gameWon: true,
          winnerId: playerId,
          victoryReason: `Controlled locations for ${condition.turnsToControl} turns`,
          playerProgress: newPlayerProgress,
        };
      }
    } else {
      // Reset counter if player loses control
      progress.turnsControlling = 0;
      newPlayerProgress.set(playerId, progress);
    }
  }

  return {
    ...currentState,
    playerProgress: newPlayerProgress,
  };
}

/**
 * Evaluate victory conditions and return updated victory state.
 * 
 * @param condition - The victory condition to evaluate
 * @param ships - All ships in the game
 * @param roundNumber - Current round number
 * @param currentState - Current victory state
 * @returns Updated victory state
 */
export function evaluateVictoryCondition(
  condition: AnyVictoryCondition,
  ships: Ship[],
  roundNumber: number,
  currentState: VictoryState
): VictoryState {
  // Don't re-evaluate if game is already won
  if (currentState.gameWon) {
    return currentState;
  }

  switch (condition.type) {
    case VictoryConditionType.Elimination:
      return evaluateElimination(condition, ships, currentState);

    case VictoryConditionType.ReachDestination:
      return evaluateDestination(condition, ships, currentState);

    case VictoryConditionType.RaceCheckpoints:
      return evaluateRace(condition, ships, currentState);

    case VictoryConditionType.Survival:
      return evaluateSurvival(condition, ships, roundNumber, currentState);

    case VictoryConditionType.DestroyShips:
      return evaluateDestroyShips(condition, ships, currentState);

    case VictoryConditionType.ControlLocations:
      return evaluateControlLocations(condition, ships, currentState);

    default:
      return currentState;
  }
}

/**
 * Create initial victory state.
 */
export function createInitialVictoryState(): VictoryState {
  return {
    gameWon: false,
    winnerId: null,
    playerProgress: new Map(),
  };
}
