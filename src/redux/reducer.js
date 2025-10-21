// Redux reducer for game state management
import { PLAYER_COLORS, MAX_PLAYERS } from './types';
import { ADD_PLAYER, REMOVE_PLAYER, CHANGE_PLAYER_COLOR, START_GAME, RETURN_TO_CONFIG, } from './actions';
// Initial state
export const initialState = {
    screen: 'configuration',
    players: [],
};
// Helper function to get next available color
function getNextAvailableColor(existingPlayers) {
    const usedColors = new Set(existingPlayers.map((p) => p.color));
    const availableColor = PLAYER_COLORS.find((color) => !usedColors.has(color));
    return availableColor || PLAYER_COLORS[0];
}
// Helper function to generate unique player ID
function generatePlayerId() {
    return `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
// Reducer function
export function gameReducer(state = initialState, action) {
    switch (action.type) {
        case ADD_PLAYER: {
            // Don't add more than MAX_PLAYERS
            if (state.players.length >= MAX_PLAYERS) {
                return state;
            }
            const newPlayer = {
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
            const otherPlayerWithColor = state.players.find((p) => p.id !== playerId && p.color === color);
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
                players: state.players.map((p) => p.id === playerId ? { ...p, color } : p),
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
            };
        }
        case RETURN_TO_CONFIG: {
            return {
                ...state,
                screen: 'configuration',
            };
        }
        default:
            return state;
    }
}
