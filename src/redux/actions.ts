// Redux action types and action creators

export const ADD_PLAYER = 'ADD_PLAYER';
export const REMOVE_PLAYER = 'REMOVE_PLAYER';
export const CHANGE_PLAYER_COLOR = 'CHANGE_PLAYER_COLOR';
export const START_GAME = 'START_GAME';
export const RETURN_TO_CONFIG = 'RETURN_TO_CONFIG';
export const END_PHASE = 'END_PHASE';

export interface AddPlayerAction {
  type: typeof ADD_PLAYER;
}

export interface RemovePlayerAction {
  type: typeof REMOVE_PLAYER;
  payload: {
    playerId: string;
  };
}

export interface ChangePlayerColorAction {
  type: typeof CHANGE_PLAYER_COLOR;
  payload: {
    playerId: string;
    color: string;
  };
}

export interface StartGameAction {
  type: typeof START_GAME;
}

export interface ReturnToConfigAction {
  type: typeof RETURN_TO_CONFIG;
}

export interface EndPhaseAction {
  type: typeof END_PHASE;
}

export type GameAction =
  | AddPlayerAction
  | RemovePlayerAction
  | ChangePlayerColorAction
  | StartGameAction
  | ReturnToConfigAction
  | EndPhaseAction;

// Action creators
export const addPlayer = (): AddPlayerAction => ({
  type: ADD_PLAYER,
});

export const removePlayer = (playerId: string): RemovePlayerAction => ({
  type: REMOVE_PLAYER,
  payload: { playerId },
});

export const changePlayerColor = (
  playerId: string,
  color: string
): ChangePlayerColorAction => ({
  type: CHANGE_PLAYER_COLOR,
  payload: { playerId, color },
});

export const startGame = (): StartGameAction => ({
  type: START_GAME,
});

export const returnToConfig = (): ReturnToConfigAction => ({
  type: RETURN_TO_CONFIG,
});

export const endPhase = (): EndPhaseAction => ({
  type: END_PHASE,
});
