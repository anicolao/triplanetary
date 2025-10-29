// Redux reducer for game state management

import { GameState, Player, PLAYER_COLORS, MAX_PLAYERS } from './types';
import {
  GameAction,
  ADD_PLAYER,
  REMOVE_PLAYER,
  CHANGE_PLAYER_COLOR,
  START_GAME,
  RETURN_TO_CONFIG,
  ADD_SHIP,
  REMOVE_SHIP,
  UPDATE_SHIP_POSITION,
  UPDATE_SHIP_VELOCITY,
  UPDATE_SHIP_HULL,
  UPDATE_SHIP_THRUST,
  DESTROY_SHIP,
  SELECT_SHIP,
} from './actions';
import { DEFAULT_SCENARIO, initializeMap } from '../celestial';
import { getDefaultPlacements, createShipsFromPlacements } from '../ship/placement';

// Initial state
export const initialState: GameState = {
  screen: 'configuration',
  players: [],
  ships: [],
  selectedShipId: null,
  mapObjects: initializeMap(DEFAULT_SCENARIO),
  currentScenario: DEFAULT_SCENARIO,
  mapBounds: DEFAULT_SCENARIO.bounds,
};

// Helper function to get next available color
function getNextAvailableColor(existingPlayers: Player[]): string {
  const usedColors = new Set(existingPlayers.map((p) => p.color));
  const availableColor = PLAYER_COLORS.find((color) => !usedColors.has(color));
  return availableColor || PLAYER_COLORS[0];
}

// Helper function to generate unique player ID
function generatePlayerId(): string {
  return `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Reducer function
export function gameReducer(
  state: GameState = initialState,
  action: GameAction
): GameState {
  switch (action.type) {
    case ADD_PLAYER: {
      // Don't add more than MAX_PLAYERS
      if (state.players.length >= MAX_PLAYERS) {
        return state;
      }

      const newPlayer: Player = {
        id: generatePlayerId(),
        color: getNextAvailableColor(state.players),
      };

      return {
        ...state,
        players: [...state.players, newPlayer],
      };
    }

    case REMOVE_PLAYER: {
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.payload.playerId),
      };
    }

    case CHANGE_PLAYER_COLOR: {
      const { playerId, color } = action.payload;
      
      // Find if another player has this color
      const otherPlayerWithColor = state.players.find(
        (p) => p.id !== playerId && p.color === color
      );

      // Find the player requesting the color change
      const requestingPlayer = state.players.find((p) => p.id === playerId);

      if (!requestingPlayer) {
        return state;
      }

      // If another player has this color, swap colors
      if (otherPlayerWithColor) {
        return {
          ...state,
          players: state.players.map((p) => {
            if (p.id === playerId) {
              return { ...p, color };
            }
            if (p.id === otherPlayerWithColor.id) {
              return { ...p, color: requestingPlayer.color };
            }
            return p;
          }),
        };
      }

      // Otherwise, just change the color
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === playerId ? { ...p, color } : p
        ),
      };
    }

    case START_GAME: {
      // Only allow starting game if at least one player is configured
      if (state.players.length === 0) {
        return state;
      }

      // Initialize ships for all players based on default scenario
      const playerIds = state.players.map((p) => p.id);
      const placements = getDefaultPlacements(playerIds, state.currentScenario);
      const ships = createShipsFromPlacements(placements, state.currentScenario);

      return {
        ...state,
        screen: 'gameplay',
        ships,
      };
    }

    case RETURN_TO_CONFIG: {
      return {
        ...state,
        screen: 'configuration',
        ships: [], // Clear ships when returning to config
      };
    }

    case ADD_SHIP: {
      const { ship } = action.payload;
      return {
        ...state,
        ships: [...state.ships, ship],
      };
    }

    case REMOVE_SHIP: {
      const { shipId } = action.payload;
      return {
        ...state,
        ships: state.ships.filter((s) => s.id !== shipId),
        selectedShipId: state.selectedShipId === shipId ? null : state.selectedShipId,
      };
    }

    case UPDATE_SHIP_POSITION: {
      const { shipId, position } = action.payload;
      return {
        ...state,
        ships: state.ships.map((s) =>
          s.id === shipId ? { ...s, position } : s
        ),
      };
    }

    case UPDATE_SHIP_VELOCITY: {
      const { shipId, velocity } = action.payload;
      return {
        ...state,
        ships: state.ships.map((s) =>
          s.id === shipId ? { ...s, velocity } : s
        ),
      };
    }

    case UPDATE_SHIP_HULL: {
      const { shipId, hull } = action.payload;
      return {
        ...state,
        ships: state.ships.map((s) =>
          s.id === shipId
            ? { ...s, stats: { ...s.stats, currentHull: hull } }
            : s
        ),
      };
    }

    case UPDATE_SHIP_THRUST: {
      const { shipId, thrust } = action.payload;
      return {
        ...state,
        ships: state.ships.map((s) =>
          s.id === shipId ? { ...s, remainingThrust: thrust } : s
        ),
      };
    }

    case DESTROY_SHIP: {
      const { shipId } = action.payload;
      return {
        ...state,
        ships: state.ships.map((s) =>
          s.id === shipId ? { ...s, destroyed: true } : s
        ),
        selectedShipId: state.selectedShipId === shipId ? null : state.selectedShipId,
      };
    }

    case SELECT_SHIP: {
      const { shipId } = action.payload;
      return {
        ...state,
        selectedShipId: shipId,
      };
    }

    default:
      return state;
  }
}
