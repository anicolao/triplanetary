// Redux action types and action creators
export const ADD_PLAYER = 'ADD_PLAYER';
export const REMOVE_PLAYER = 'REMOVE_PLAYER';
export const CHANGE_PLAYER_COLOR = 'CHANGE_PLAYER_COLOR';
export const START_GAME = 'START_GAME';
export const RETURN_TO_CONFIG = 'RETURN_TO_CONFIG';
// Action creators
export const addPlayer = () => ({
    type: ADD_PLAYER,
});
export const removePlayer = (playerId) => ({
    type: REMOVE_PLAYER,
    payload: { playerId },
});
export const changePlayerColor = (playerId, color) => ({
    type: CHANGE_PLAYER_COLOR,
    payload: { playerId, color },
});
export const startGame = () => ({
    type: START_GAME,
});
export const returnToConfig = () => ({
    type: RETURN_TO_CONFIG,
});
