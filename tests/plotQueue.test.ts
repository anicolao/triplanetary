// Tests for plot queue management utilities

import { describe, it, expect } from 'vitest';
import {
  areAllShipsPlotted,
  getPlottingStatus,
  canProceedFromPlotPhase,
} from '../src/physics/plotQueue';
import { Ship, VelocityVector } from '../src/ship/types';
import { PlottedMove } from '../src/redux/types';

// Helper function to create a test ship
function createTestShip(
  id: string,
  playerId: string,
  destroyed: boolean = false
): Ship {
  return {
    id,
    name: `Ship ${id}`,
    playerId,
    position: { q: 0, r: 0 },
    velocity: { q: 0, r: 0 },
    stats: {
      maxHull: 10,
      currentHull: 10,
      maxThrust: 3,
      weapons: 0,
      cargo: 0,
    },
    remainingThrust: 3,
    destroyed,
  };
}

// Helper function to create a plotted move
function createPlottedMove(
  shipId: string,
  velocity: VelocityVector = { q: 1, r: 0 }
): PlottedMove {
  return {
    shipId,
    newVelocity: velocity,
    thrustUsed: 1,
  };
}

describe('Plot Queue Management', () => {
  describe('areAllShipsPlotted', () => {
    it('should return true when player has no ships', () => {
      const ships: Ship[] = [];
      const plottedMoves = new Map<string, PlottedMove>();
      const result = areAllShipsPlotted(ships, plottedMoves, 'player1');
      expect(result).toBe(true);
    });

    it('should return true when all player ships are plotted', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player1'),
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        ['ship1', createPlottedMove('ship1')],
        ['ship2', createPlottedMove('ship2')],
      ]);
      const result = areAllShipsPlotted(ships, plottedMoves, 'player1');
      expect(result).toBe(true);
    });

    it('should return false when some player ships are not plotted', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player1'),
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        ['ship1', createPlottedMove('ship1')],
      ]);
      const result = areAllShipsPlotted(ships, plottedMoves, 'player1');
      expect(result).toBe(false);
    });

    it('should return false when no player ships are plotted', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player1'),
      ];
      const plottedMoves = new Map<string, PlottedMove>();
      const result = areAllShipsPlotted(ships, plottedMoves, 'player1');
      expect(result).toBe(false);
    });

    it('should ignore destroyed ships', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player1', true), // destroyed
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        ['ship1', createPlottedMove('ship1')],
      ]);
      const result = areAllShipsPlotted(ships, plottedMoves, 'player1');
      expect(result).toBe(true);
    });

    it('should only check ships belonging to the specified player', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player2'),
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        ['ship1', createPlottedMove('ship1')],
      ]);
      const result = areAllShipsPlotted(ships, plottedMoves, 'player1');
      expect(result).toBe(true);
    });

    it('should return false when player has ships but none are plotted', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player2'),
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        ['ship2', createPlottedMove('ship2')],
      ]);
      const result = areAllShipsPlotted(ships, plottedMoves, 'player1');
      expect(result).toBe(false);
    });
  });

  describe('getPlottingStatus', () => {
    it('should return 0/0 when player has no ships', () => {
      const ships: Ship[] = [];
      const plottedMoves = new Map<string, PlottedMove>();
      const result = getPlottingStatus(ships, plottedMoves, 'player1');
      expect(result).toEqual({ plottedCount: 0, totalCount: 0 });
    });

    it('should return correct counts when all ships are plotted', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player1'),
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        ['ship1', createPlottedMove('ship1')],
        ['ship2', createPlottedMove('ship2')],
      ]);
      const result = getPlottingStatus(ships, plottedMoves, 'player1');
      expect(result).toEqual({ plottedCount: 2, totalCount: 2 });
    });

    it('should return correct counts when some ships are plotted', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player1'),
        createTestShip('ship3', 'player1'),
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        ['ship1', createPlottedMove('ship1')],
      ]);
      const result = getPlottingStatus(ships, plottedMoves, 'player1');
      expect(result).toEqual({ plottedCount: 1, totalCount: 3 });
    });

    it('should not count destroyed ships', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player1', true), // destroyed
        createTestShip('ship3', 'player1'),
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        ['ship1', createPlottedMove('ship1')],
      ]);
      const result = getPlottingStatus(ships, plottedMoves, 'player1');
      expect(result).toEqual({ plottedCount: 1, totalCount: 2 });
    });

    it('should only count ships belonging to the specified player', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player2'),
        createTestShip('ship3', 'player1'),
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        ['ship1', createPlottedMove('ship1')],
        ['ship2', createPlottedMove('ship2')],
      ]);
      const result = getPlottingStatus(ships, plottedMoves, 'player1');
      expect(result).toEqual({ plottedCount: 1, totalCount: 2 });
    });
  });

  describe('canProceedFromPlotPhase', () => {
    it('should return true when all ships are plotted', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player1'),
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        ['ship1', createPlottedMove('ship1')],
        ['ship2', createPlottedMove('ship2')],
      ]);
      const result = canProceedFromPlotPhase(ships, plottedMoves, 'player1');
      expect(result).toBe(true);
    });

    it('should return false when not all ships are plotted', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1'),
        createTestShip('ship2', 'player1'),
      ];
      const plottedMoves = new Map<string, PlottedMove>([
        ['ship1', createPlottedMove('ship1')],
      ]);
      const result = canProceedFromPlotPhase(ships, plottedMoves, 'player1');
      expect(result).toBe(false);
    });

    it('should return true when player has no active ships', () => {
      const ships: Ship[] = [
        createTestShip('ship1', 'player1', true), // destroyed
      ];
      const plottedMoves = new Map<string, PlottedMove>();
      const result = canProceedFromPlotPhase(ships, plottedMoves, 'player1');
      expect(result).toBe(true);
    });
  });
});
