// Tests for victory condition evaluation

import { describe, it, expect } from 'vitest';
import {
  VictoryConditionType,
  EliminationVictory,
  DestinationVictory,
  RaceVictory,
  SurvivalVictory,
  DestroyShipsVictory,
  ControlLocationsVictory,
  Checkpoint,
} from '../src/victory/types';
import {
  evaluateVictoryCondition,
  createInitialVictoryState,
} from '../src/victory/evaluation';
import { Ship } from '../src/ship/types';

// Helper to create a basic ship
function createTestShip(
  id: string,
  ownerId: string,
  position: { q: number; r: number },
  destroyed: boolean = false
): Ship {
  return {
    id,
    name: `Ship ${id}`,
    ownerId,
    position,
    velocity: { dq: 0, dr: 0 },
    remainingThrust: 5,
    stats: {
      thrust: 5,
      maxHull: 10,
      currentHull: destroyed ? 0 : 10,
      weapons: 1,
      cargo: 0,
    },
    destroyed,
    ordnance: { mines: 0, torpedoes: 0, missiles: 0 },
  };
}

describe('Victory Condition Evaluation', () => {
  describe('createInitialVictoryState', () => {
    it('should create initial state with no winner', () => {
      const state = createInitialVictoryState();
      expect(state.gameWon).toBe(false);
      expect(state.winnerId).toBe(null);
      expect(state.playerProgress.size).toBe(0);
    });
  });

  describe('Elimination Victory', () => {
    const eliminationCondition: EliminationVictory = {
      type: VictoryConditionType.Elimination,
      description: 'Eliminate all enemy ships',
    };

    it('should not declare victory when multiple players have ships', () => {
      const ships = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }),
        createTestShip('ship2', 'player2', { q: 1, r: 1 }),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(eliminationCondition, ships, 1, state);

      expect(result.gameWon).toBe(false);
      expect(result.winnerId).toBe(null);
    });

    it('should declare victory when only one player has ships', () => {
      const ships = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }),
        createTestShip('ship2', 'player2', { q: 1, r: 1 }, true),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(eliminationCondition, ships, 1, state);

      expect(result.gameWon).toBe(true);
      expect(result.winnerId).toBe('player1');
      expect(result.victoryReason).toContain('Elimination');
    });

    it('should handle draw when all ships destroyed', () => {
      const ships = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }, true),
        createTestShip('ship2', 'player2', { q: 1, r: 1 }, true),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(eliminationCondition, ships, 1, state);

      expect(result.gameWon).toBe(true);
      expect(result.winnerId).toBe(null);
      expect(result.victoryReason).toContain('Draw');
    });
  });

  describe('Destination Victory', () => {
    const destination = { q: 10, r: 10 };
    const destinationCondition: DestinationVictory = {
      type: VictoryConditionType.ReachDestination,
      description: 'Reach Mars',
      destination,
      destinationName: 'Mars',
    };

    it('should not declare victory when no ship at destination', () => {
      const ships = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }),
        createTestShip('ship2', 'player2', { q: 5, r: 5 }),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(destinationCondition, ships, 1, state);

      expect(result.gameWon).toBe(false);
    });

    it('should declare victory when ship reaches destination', () => {
      const ships = [
        createTestShip('ship1', 'player1', destination),
        createTestShip('ship2', 'player2', { q: 5, r: 5 }),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(destinationCondition, ships, 1, state);

      expect(result.gameWon).toBe(true);
      expect(result.winnerId).toBe('player1');
      expect(result.victoryReason).toContain('Mars');
    });

    it('should not declare victory for destroyed ship at destination', () => {
      const ships = [
        createTestShip('ship1', 'player1', destination, true),
        createTestShip('ship2', 'player2', { q: 5, r: 5 }),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(destinationCondition, ships, 1, state);

      expect(result.gameWon).toBe(false);
    });
  });

  describe('Race Victory', () => {
    const checkpoints: Checkpoint[] = [
      { position: { q: 5, r: 5 }, name: 'Checkpoint 1', order: 0 },
      { position: { q: 10, r: 10 }, name: 'Checkpoint 2', order: 1 },
      { position: { q: 15, r: 15 }, name: 'Checkpoint 3', order: 2 },
    ];

    const raceCondition: RaceVictory = {
      type: VictoryConditionType.RaceCheckpoints,
      description: 'Complete the race',
      checkpoints,
    };

    it('should track checkpoint progress', () => {
      const ships = [
        createTestShip('ship1', 'player1', checkpoints[0].position),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(raceCondition, ships, 1, state);

      expect(result.gameWon).toBe(false);
      const progress = result.playerProgress.get('player1');
      expect(progress?.checkpointsVisited?.length).toBe(1);
      expect(progress?.checkpointsVisited).toContain(0);
    });

    it('should require checkpoints in order', () => {
      // Ship at checkpoint 2 without visiting checkpoint 1
      const ships = [
        createTestShip('ship1', 'player1', checkpoints[1].position),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(raceCondition, ships, 1, state);

      expect(result.gameWon).toBe(false);
      const progress = result.playerProgress.get('player1');
      expect(progress?.checkpointsVisited?.length || 0).toBe(0);
    });

    it('should declare victory when all checkpoints visited in order', () => {
      let state = createInitialVictoryState();

      // Visit checkpoint 1
      let ships = [createTestShip('ship1', 'player1', checkpoints[0].position)];
      state = evaluateVictoryCondition(raceCondition, ships, 1, state);
      expect(state.gameWon).toBe(false);

      // Visit checkpoint 2
      ships = [createTestShip('ship1', 'player1', checkpoints[1].position)];
      state = evaluateVictoryCondition(raceCondition, ships, 1, state);
      expect(state.gameWon).toBe(false);

      // Visit checkpoint 3
      ships = [createTestShip('ship1', 'player1', checkpoints[2].position)];
      state = evaluateVictoryCondition(raceCondition, ships, 1, state);
      expect(state.gameWon).toBe(true);
      expect(state.winnerId).toBe('player1');
    });
  });

  describe('Survival Victory', () => {
    const survivalCondition: SurvivalVictory = {
      type: VictoryConditionType.Survival,
      description: 'Survive 10 rounds',
      rounds: 10,
    };

    it('should not declare victory before reaching round limit', () => {
      const ships = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(survivalCondition, ships, 5, state);

      expect(result.gameWon).toBe(false);
    });

    it('should declare victory when reaching round limit with ships', () => {
      const ships = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(survivalCondition, ships, 10, state);

      expect(result.gameWon).toBe(true);
      expect(result.winnerId).toBe('player1');
      expect(result.victoryReason).toContain('10 rounds');
    });

    it('should handle multiple survivors', () => {
      const ships = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }),
        createTestShip('ship2', 'player2', { q: 1, r: 1 }),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(survivalCondition, ships, 10, state);

      expect(result.gameWon).toBe(true);
      expect(result.winnerId).toBe(null);
      expect(result.victoryReason).toContain('Multiple players');
    });
  });

  describe('Destroy Ships Victory', () => {
    const destroyCondition: DestroyShipsVictory = {
      type: VictoryConditionType.DestroyShips,
      description: 'Destroy 3 enemy ships',
      shipsToDestroy: 3,
    };

    it('should track destroyed enemy ships', () => {
      const ships = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }),
        createTestShip('ship2', 'player2', { q: 1, r: 1 }, true),
        createTestShip('ship3', 'player2', { q: 2, r: 2 }, true),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(destroyCondition, ships, 1, state);

      const progress = result.playerProgress.get('player1');
      expect(progress?.shipsDestroyed).toBe(2);
    });

    it('should declare victory when enough ships destroyed', () => {
      const ships = [
        createTestShip('ship1', 'player1', { q: 0, r: 0 }),
        createTestShip('ship2', 'player2', { q: 1, r: 1 }, true),
        createTestShip('ship3', 'player2', { q: 2, r: 2 }, true),
        createTestShip('ship4', 'player2', { q: 3, r: 3 }, true),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(destroyCondition, ships, 1, state);

      expect(result.gameWon).toBe(true);
      expect(result.winnerId).toBe('player1');
    });
  });

  describe('Control Locations Victory', () => {
    const locations = [
      { q: 5, r: 5 },
      { q: 10, r: 10 },
    ];

    const controlCondition: ControlLocationsVictory = {
      type: VictoryConditionType.ControlLocations,
      description: 'Control key locations',
      locations,
      turnsToControl: 3,
    };

    it('should track turns controlling locations', () => {
      const ships = [
        createTestShip('ship1', 'player1', locations[0]),
        createTestShip('ship2', 'player1', locations[1]),
      ];

      const state = createInitialVictoryState();
      const result = evaluateVictoryCondition(controlCondition, ships, 1, state);

      const progress = result.playerProgress.get('player1');
      expect(progress?.turnsControlling).toBe(1);
    });

    it('should reset counter when losing control', () => {
      let state = createInitialVictoryState();

      // Control for 1 turn
      let ships = [
        createTestShip('ship1', 'player1', locations[0]),
        createTestShip('ship2', 'player1', locations[1]),
      ];
      state = evaluateVictoryCondition(controlCondition, ships, 1, state);
      expect(state.playerProgress.get('player1')?.turnsControlling).toBe(1);

      // Lose control
      ships = [createTestShip('ship1', 'player1', locations[0])];
      state = evaluateVictoryCondition(controlCondition, ships, 2, state);
      expect(state.playerProgress.get('player1')?.turnsControlling).toBe(0);
    });

    it('should declare victory after controlling for required turns', () => {
      let state = createInitialVictoryState();
      const ships = [
        createTestShip('ship1', 'player1', locations[0]),
        createTestShip('ship2', 'player1', locations[1]),
      ];

      // Turn 1
      state = evaluateVictoryCondition(controlCondition, ships, 1, state);
      expect(state.gameWon).toBe(false);

      // Turn 2
      state = evaluateVictoryCondition(controlCondition, ships, 2, state);
      expect(state.gameWon).toBe(false);

      // Turn 3
      state = evaluateVictoryCondition(controlCondition, ships, 3, state);
      expect(state.gameWon).toBe(true);
      expect(state.winnerId).toBe('player1');
    });
  });

  describe('General Victory State', () => {
    it('should not re-evaluate once game is won', () => {
      const condition: EliminationVictory = {
        type: VictoryConditionType.Elimination,
        description: 'Last player standing',
      };

      const ships = [createTestShip('ship1', 'player1', { q: 0, r: 0 })];

      const wonState = {
        gameWon: true,
        winnerId: 'player1',
        victoryReason: 'Already won',
        playerProgress: new Map(),
      };

      const result = evaluateVictoryCondition(condition, ships, 1, wonState);

      expect(result).toBe(wonState);
      expect(result.winnerId).toBe('player1');
      expect(result.victoryReason).toBe('Already won');
    });
  });
});
