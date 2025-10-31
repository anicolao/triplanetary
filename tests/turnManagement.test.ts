// Tests for turn management system

import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from '../src/redux/reducer';
import {
  addPlayer,
  startGame,
  nextPhase,
  nextTurn,
  setPhase,
  initializeTurnOrder,
} from '../src/redux/actions';
import { GamePhase } from '../src/redux/types';

describe('Turn Management', () => {
  describe('Turn Order Initialization', () => {
    it('should initialize turn order when game starts', () => {
      let state = initialState;
      
      // Add two players
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      
      // Start game
      state = gameReducer(state, startGame());
      
      expect(state.turnOrder).toHaveLength(2);
      expect(state.turnOrder).toEqual([state.players[0].id, state.players[1].id]);
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.currentPhase).toBe(GamePhase.Plot);
      expect(state.roundNumber).toBe(1);
    });

    it('should initialize turn order with INITIALIZE_TURN_ORDER action', () => {
      let state = initialState;
      
      // Add three players
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      
      // Initialize turn order
      state = gameReducer(state, initializeTurnOrder());
      
      expect(state.turnOrder).toHaveLength(3);
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.currentPhase).toBe(GamePhase.Plot);
      expect(state.roundNumber).toBe(1);
      expect(state.turnHistory).toHaveLength(0);
    });
  });

  describe('Phase Transitions', () => {
    it('should advance to next phase', () => {
      let state = initialState;
      
      // Add player and start game
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      expect(state.currentPhase).toBe(GamePhase.Plot);
      
      // Advance phase
      state = gameReducer(state, nextPhase());
      expect(state.currentPhase).toBe(GamePhase.Ordnance);
      
      state = gameReducer(state, nextPhase());
      expect(state.currentPhase).toBe(GamePhase.Movement);
      
      state = gameReducer(state, nextPhase());
      expect(state.currentPhase).toBe(GamePhase.Combat);
      
      state = gameReducer(state, nextPhase());
      expect(state.currentPhase).toBe(GamePhase.Maintenance);
    });

    it('should cycle back to Plot phase after Maintenance', () => {
      let state = initialState;
      
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      // Go through all phases
      state = gameReducer(state, setPhase(GamePhase.Maintenance));
      state = gameReducer(state, nextPhase());
      
      expect(state.currentPhase).toBe(GamePhase.Plot);
    });

    it('should set phase directly', () => {
      let state = initialState;
      
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      expect(state.currentPhase).toBe(GamePhase.Plot);
      
      state = gameReducer(state, setPhase(GamePhase.Combat));
      expect(state.currentPhase).toBe(GamePhase.Combat);
      
      state = gameReducer(state, setPhase(GamePhase.Plot));
      expect(state.currentPhase).toBe(GamePhase.Plot);
    });

    it('should add to turn history when phase advances', () => {
      let state = initialState;
      
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      const initialHistoryLength = state.turnHistory.length;
      
      state = gameReducer(state, nextPhase());
      
      expect(state.turnHistory.length).toBe(initialHistoryLength + 1);
      expect(state.turnHistory[state.turnHistory.length - 1].phase).toBe(GamePhase.Plot);
      expect(state.turnHistory[state.turnHistory.length - 1].roundNumber).toBe(1);
    });
  });

  describe('Turn Progression', () => {
    it('should advance to next player turn', () => {
      let state = initialState;
      
      // Add three players
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.currentPhase).toBe(GamePhase.Plot);
      
      // Next turn
      state = gameReducer(state, nextTurn());
      expect(state.currentPlayerIndex).toBe(1);
      expect(state.currentPhase).toBe(GamePhase.Plot);
      expect(state.roundNumber).toBe(1);
      
      // Next turn
      state = gameReducer(state, nextTurn());
      expect(state.currentPlayerIndex).toBe(2);
      expect(state.currentPhase).toBe(GamePhase.Plot);
      expect(state.roundNumber).toBe(1);
    });

    it('should cycle back to first player and increment round', () => {
      let state = initialState;
      
      // Add two players
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      expect(state.roundNumber).toBe(1);
      
      // Player 1's turn
      state = gameReducer(state, nextTurn());
      expect(state.currentPlayerIndex).toBe(1);
      expect(state.roundNumber).toBe(1);
      
      // Back to Player 0, new round
      state = gameReducer(state, nextTurn());
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.roundNumber).toBe(2);
    });

    it('should add to turn history when turn advances', () => {
      let state = initialState;
      
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      const initialHistoryLength = state.turnHistory.length;
      
      state = gameReducer(state, nextTurn());
      
      expect(state.turnHistory.length).toBe(initialHistoryLength + 1);
      expect(state.turnHistory[state.turnHistory.length - 1].playerIndex).toBe(0);
    });

    it('should clear plotted moves when turn advances', () => {
      let state = initialState;
      
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      // Add a plotted move (would be done through plotShipMove action in real usage)
      state = {
        ...state,
        plottedMoves: new Map([['ship-1', { shipId: 'ship-1', newVelocity: { q: 1, r: 0 }, thrustUsed: 1 }]]),
      };
      
      expect(state.plottedMoves.size).toBe(1);
      
      state = gameReducer(state, nextTurn());
      
      expect(state.plottedMoves.size).toBe(0);
    });
  });

  describe('Round Counter', () => {
    it('should track round number correctly', () => {
      let state = initialState;
      
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      expect(state.roundNumber).toBe(1);
      
      // Complete one turn (returns to same player)
      state = gameReducer(state, nextTurn());
      expect(state.roundNumber).toBe(2);
      
      state = gameReducer(state, nextTurn());
      expect(state.roundNumber).toBe(3);
    });

    it('should maintain round number through phase changes', () => {
      let state = initialState;
      
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      const round = state.roundNumber;
      
      state = gameReducer(state, nextPhase());
      expect(state.roundNumber).toBe(round);
      
      state = gameReducer(state, nextPhase());
      expect(state.roundNumber).toBe(round);
    });
  });

  describe('Turn History', () => {
    it('should track complete turn history', () => {
      let state = initialState;
      
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      expect(state.turnHistory).toHaveLength(0);
      
      // Advance through phases
      state = gameReducer(state, nextPhase());
      expect(state.turnHistory).toHaveLength(1);
      
      state = gameReducer(state, nextPhase());
      expect(state.turnHistory).toHaveLength(2);
      
      // Advance turn
      state = gameReducer(state, nextTurn());
      expect(state.turnHistory).toHaveLength(3);
    });

    it('should record correct phase in history', () => {
      let state = initialState;
      
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      state = gameReducer(state, nextPhase());
      const lastEntry = state.turnHistory[state.turnHistory.length - 1];
      
      expect(lastEntry.phase).toBe(GamePhase.Plot);
      expect(lastEntry.roundNumber).toBe(1);
      expect(lastEntry.playerIndex).toBe(0);
      expect(lastEntry.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single player game', () => {
      let state = initialState;
      
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      expect(state.turnOrder).toHaveLength(1);
      expect(state.currentPlayerIndex).toBe(0);
      
      state = gameReducer(state, nextTurn());
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.roundNumber).toBe(2);
    });

    it('should reset properly when returning to config', () => {
      let state = initialState;
      
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      
      // Advance some turns
      state = gameReducer(state, nextPhase());
      state = gameReducer(state, nextTurn());
      
      // Return to config (via RETURN_TO_CONFIG action)
      // Turn state should be preserved but ships cleared
      // The turn state will be reset when starting a new game
    });
  });
});
