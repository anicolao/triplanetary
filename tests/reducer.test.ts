// Unit tests for Redux reducer

import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from '../src/redux/reducer';
import {
  addPlayer,
  removePlayer,
  changePlayerColor,
  startGame,
  returnToConfig,
  endPhase,
} from '../src/redux/actions';
import { MAX_PLAYERS, PLAYER_COLORS } from '../src/redux/types';

describe('gameReducer', () => {
  describe('ADD_PLAYER', () => {
    it('should add a player to empty list', () => {
      const state = gameReducer(initialState, addPlayer());
      expect(state.players.length).toBe(1);
      expect(state.players[0].color).toBe(PLAYER_COLORS[0]);
    });

    it('should add multiple players with different colors', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());

      expect(state.players.length).toBe(3);
      expect(state.players[0].color).toBe(PLAYER_COLORS[0]);
      expect(state.players[1].color).toBe(PLAYER_COLORS[1]);
      expect(state.players[2].color).toBe(PLAYER_COLORS[2]);
    });

    it('should not add more than MAX_PLAYERS', () => {
      let state = initialState;
      for (let i = 0; i < MAX_PLAYERS + 2; i++) {
        state = gameReducer(state, addPlayer());
      }

      expect(state.players.length).toBe(MAX_PLAYERS);
    });
  });

  describe('REMOVE_PLAYER', () => {
    it('should remove a player by id', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());

      const playerIdToRemove = state.players[0].id;
      state = gameReducer(state, removePlayer(playerIdToRemove));

      expect(state.players.length).toBe(1);
      expect(state.players.find((p) => p.id === playerIdToRemove)).toBeUndefined();
    });

    it('should handle removing non-existent player', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());

      const initialLength = state.players.length;
      state = gameReducer(state, removePlayer('non-existent-id'));

      expect(state.players.length).toBe(initialLength);
    });
  });

  describe('CHANGE_PLAYER_COLOR', () => {
    it('should change player color when no conflict', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());

      const playerId = state.players[0].id;
      const newColor = PLAYER_COLORS[3];
      state = gameReducer(state, changePlayerColor(playerId, newColor));

      expect(state.players[0].color).toBe(newColor);
    });

    it('should swap colors when another player has the color', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());

      const player1Id = state.players[0].id;
      const player2Id = state.players[1].id;
      const player1Color = state.players[0].color;
      const player2Color = state.players[1].color;

      // Player 1 wants Player 2's color
      state = gameReducer(state, changePlayerColor(player1Id, player2Color));

      const player1After = state.players.find((p) => p.id === player1Id);
      const player2After = state.players.find((p) => p.id === player2Id);

      expect(player1After?.color).toBe(player2Color);
      expect(player2After?.color).toBe(player1Color);
    });

    it('should handle non-existent player', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());

      const stateBefore = state;
      state = gameReducer(state, changePlayerColor('non-existent-id', PLAYER_COLORS[0]));

      expect(state).toEqual(stateBefore);
    });
  });

  describe('START_GAME', () => {
    it('should transition to gameplay screen when players exist', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());

      expect(state.screen).toBe('gameplay');
    });

    it('should not transition when no players exist', () => {
      const state = gameReducer(initialState, startGame());
      expect(state.screen).toBe('configuration');
    });

    it('should initialize gameplay state with turn order', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());

      expect(state.gameplay).not.toBeNull();
      expect(state.gameplay?.currentRound).toBe(1);
      expect(state.gameplay?.currentPlayerIndex).toBe(0);
      expect(state.gameplay?.currentPhase).toBe('plot');
      expect(state.gameplay?.playerTurnOrder.length).toBe(3);
      
      // Verify all player IDs are in turn order
      const playerIds = state.players.map(p => p.id);
      state.gameplay?.playerTurnOrder.forEach(id => {
        expect(playerIds).toContain(id);
      });
    });
  });

  describe('RETURN_TO_CONFIG', () => {
    it('should return to configuration screen from gameplay', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      state = gameReducer(state, returnToConfig());

      expect(state.screen).toBe('configuration');
    });

    it('should clear gameplay state when returning to config', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      state = gameReducer(state, returnToConfig());

      expect(state.gameplay).toBeNull();
    });
  });

  describe('END_PHASE', () => {
    it('should advance through phases in order', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());

      expect(state.gameplay?.currentPhase).toBe('plot');
      
      state = gameReducer(state, endPhase());
      expect(state.gameplay?.currentPhase).toBe('ordnance');
      
      state = gameReducer(state, endPhase());
      expect(state.gameplay?.currentPhase).toBe('movement');
      
      state = gameReducer(state, endPhase());
      expect(state.gameplay?.currentPhase).toBe('combat');
      
      state = gameReducer(state, endPhase());
      expect(state.gameplay?.currentPhase).toBe('maintenance');
    });

    it('should advance to next player after maintenance phase', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());

      // Go through all phases
      state = gameReducer(state, endPhase()); // ordnance
      state = gameReducer(state, endPhase()); // movement
      state = gameReducer(state, endPhase()); // combat
      state = gameReducer(state, endPhase()); // maintenance
      
      // After maintenance, should move to next player's plot phase
      state = gameReducer(state, endPhase());
      expect(state.gameplay?.currentPhase).toBe('plot');
      expect(state.gameplay?.currentPlayerIndex).toBe(1);
      expect(state.gameplay?.currentRound).toBe(1);
    });

    it('should advance to next round after all players complete turns', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());

      // Complete first player's turn
      for (let i = 0; i < 5; i++) {
        state = gameReducer(state, endPhase());
      }
      expect(state.gameplay?.currentPlayerIndex).toBe(1);
      expect(state.gameplay?.currentRound).toBe(1);

      // Complete second player's turn
      for (let i = 0; i < 5; i++) {
        state = gameReducer(state, endPhase());
      }
      
      // Should be back to first player, round 2
      expect(state.gameplay?.currentPlayerIndex).toBe(0);
      expect(state.gameplay?.currentRound).toBe(2);
      expect(state.gameplay?.currentPhase).toBe('plot');
    });

    it('should not advance phase when not in gameplay', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());
      
      // Try to end phase while in configuration
      const stateBefore = { ...state };
      state = gameReducer(state, endPhase());
      
      expect(state).toEqual(stateBefore);
    });
  });
});
