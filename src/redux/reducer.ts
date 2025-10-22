// Redux reducer for game state management

import { GameState, Player, PLAYER_COLORS, MAX_PLAYERS, GameplayState } from './types';
import {
  GameAction,
  ADD_PLAYER,
  REMOVE_PLAYER,
  CHANGE_PLAYER_COLOR,
  START_GAME,
  RETURN_TO_CONFIG,
  END_PHASE,
} from './actions';

// Initial state
export const initialState: GameState = {
  screen: 'configuration',
  players: [],
  gameplay: null,
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

// Helper function to shuffle array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper function to initialize gameplay state
function initializeGameplay(players: Player[]): GameplayState {
  const playerIds = players.map((p) => p.id);
  const shuffledPlayerIds = shuffleArray(playerIds);
  
  return {
    currentRound: 1,
    playerTurnOrder: shuffledPlayerIds,
    currentPlayerIndex: 0,
    currentPhase: 'plot',
  };
}

// Helper function to advance to next phase
function advancePhase(gameplay: GameplayState, playerCount: number): GameplayState {
  const phaseOrder: Array<GameplayState['currentPhase']> = [
    'plot',
    'ordnance',
    'movement',
    'combat',
    'maintenance',
  ];
  
  const currentPhaseIndex = phaseOrder.indexOf(gameplay.currentPhase);
  
  // If we're at maintenance phase, move to next player's plot phase
  if (gameplay.currentPhase === 'maintenance') {
    const nextPlayerIndex = gameplay.currentPlayerIndex + 1;
    
    // If we've gone through all players, start a new round
    if (nextPlayerIndex >= playerCount) {
      return {
        ...gameplay,
        currentRound: gameplay.currentRound + 1,
        currentPlayerIndex: 0,
        currentPhase: 'plot',
      };
    }
    
    // Otherwise, move to next player
    return {
      ...gameplay,
      currentPlayerIndex: nextPlayerIndex,
      currentPhase: 'plot',
    };
  }
  
  // Move to next phase in sequence
  const nextPhaseIndex = currentPhaseIndex + 1;
  return {
    ...gameplay,
    currentPhase: phaseOrder[nextPhaseIndex],
  };
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

      return {
        ...state,
        screen: 'gameplay',
        gameplay: initializeGameplay(state.players),
      };
    }

    case RETURN_TO_CONFIG: {
      return {
        ...state,
        screen: 'configuration',
        gameplay: null,
      };
    }

    case END_PHASE: {
      // Only process if we're in gameplay
      if (state.screen !== 'gameplay' || !state.gameplay) {
        return state;
      }

      const newGameplay = advancePhase(state.gameplay, state.players.length);

      return {
        ...state,
        gameplay: newGameplay,
      };
    }

    default:
      return state;
  }
}
