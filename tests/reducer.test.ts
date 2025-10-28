// Unit tests for Redux reducer

import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from '../src/redux/reducer';
import {
  addPlayer,
  removePlayer,
  changePlayerColor,
  startGame,
  returnToConfig,
} from '../src/redux/actions';
import { MAX_PLAYERS, PLAYER_COLORS } from '../src/redux/types';

describe('gameReducer', () => {
  describe('Initial State', () => {
    it('should have map objects initialized', () => {
      expect(initialState.mapObjects).toBeDefined();
      // Sun + 4 planets + 2 stations + asteroids
      expect(initialState.mapObjects.length).toBeGreaterThan(5);
    });

    it('should include the Sun at origin', () => {
      const sun = initialState.mapObjects.find(obj => obj.type === 'sun');
      expect(sun).toBeDefined();
      expect(sun?.position.q).toBe(0);
      expect(sun?.position.r).toBe(0);
    });

    it('should include all four inner planets', () => {
      const planets = initialState.mapObjects.filter(obj => obj.type === 'planet');
      expect(planets.length).toBe(4);
      
      const planetNames = planets.map(p => p.name).sort();
      expect(planetNames).toEqual(['Earth', 'Mars', 'Mercury', 'Venus']);
    });

    it('should have planets with calculated positions', () => {
      const planets = initialState.mapObjects.filter(obj => obj.type === 'planet');
      planets.forEach(planet => {
        expect(planet.position).toBeDefined();
        expect(typeof planet.position.q).toBe('number');
        expect(typeof planet.position.r).toBe('number');
      });
    });

    it('should include space stations', () => {
      const stations = initialState.mapObjects.filter(obj => obj.type === 'station');
      expect(stations.length).toBeGreaterThan(0);
    });

    it('should include asteroids', () => {
      const asteroids = initialState.mapObjects.filter(obj => obj.type === 'asteroid');
      expect(asteroids.length).toBeGreaterThan(0);
    });

    it('should have scenario and map bounds defined', () => {
      expect(initialState.currentScenario).toBeDefined();
      expect(initialState.mapBounds).toBeDefined();
      expect(initialState.mapBounds.minQ).toBeDefined();
      expect(initialState.mapBounds.maxQ).toBeDefined();
      expect(initialState.mapBounds.minR).toBeDefined();
      expect(initialState.mapBounds.maxR).toBeDefined();
    });
  });

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

    it('should preserve map objects when adding players', () => {
      const state = gameReducer(initialState, addPlayer());
      expect(state.mapObjects).toEqual(initialState.mapObjects);
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
  });

  describe('RETURN_TO_CONFIG', () => {
    it('should return to configuration screen from gameplay', () => {
      let state = initialState;
      state = gameReducer(state, addPlayer());
      state = gameReducer(state, startGame());
      state = gameReducer(state, returnToConfig());

      expect(state.screen).toBe('configuration');
    });
  });

  describe('Ship State Management', () => {
    it('should have empty ships array in initial state', () => {
      expect(initialState.ships).toEqual([]);
      expect(initialState.selectedShipId).toBeNull();
    });
  });
});
