// Redux action types and action creators

import { Ship, VelocityVector } from '../ship/types';
import { HexCoordinate } from '../hex/types';
import { GamePhase } from './types';

export const ADD_PLAYER = 'ADD_PLAYER';
export const REMOVE_PLAYER = 'REMOVE_PLAYER';
export const CHANGE_PLAYER_COLOR = 'CHANGE_PLAYER_COLOR';
export const START_GAME = 'START_GAME';
export const RETURN_TO_CONFIG = 'RETURN_TO_CONFIG';

// Ship action types
export const ADD_SHIP = 'ADD_SHIP';
export const REMOVE_SHIP = 'REMOVE_SHIP';
export const UPDATE_SHIP_POSITION = 'UPDATE_SHIP_POSITION';
export const UPDATE_SHIP_VELOCITY = 'UPDATE_SHIP_VELOCITY';
export const UPDATE_SHIP_HULL = 'UPDATE_SHIP_HULL';
export const UPDATE_SHIP_THRUST = 'UPDATE_SHIP_THRUST';
export const DESTROY_SHIP = 'DESTROY_SHIP';
export const SELECT_SHIP = 'SELECT_SHIP';

// Plot Phase action types
export const PLOT_SHIP_MOVE = 'PLOT_SHIP_MOVE';
export const CLEAR_PLOT = 'CLEAR_PLOT';
export const CLEAR_ALL_PLOTS = 'CLEAR_ALL_PLOTS';
export const TOGGLE_REACHABLE_HEXES = 'TOGGLE_REACHABLE_HEXES';

// Turn management action types
export const NEXT_PHASE = 'NEXT_PHASE';
export const NEXT_TURN = 'NEXT_TURN';
export const SET_PHASE = 'SET_PHASE';
export const INITIALIZE_TURN_ORDER = 'INITIALIZE_TURN_ORDER';

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

// Ship action interfaces
export interface AddShipAction {
  type: typeof ADD_SHIP;
  payload: {
    ship: Ship;
  };
}

export interface RemoveShipAction {
  type: typeof REMOVE_SHIP;
  payload: {
    shipId: string;
  };
}

export interface UpdateShipPositionAction {
  type: typeof UPDATE_SHIP_POSITION;
  payload: {
    shipId: string;
    position: HexCoordinate;
  };
}

export interface UpdateShipVelocityAction {
  type: typeof UPDATE_SHIP_VELOCITY;
  payload: {
    shipId: string;
    velocity: VelocityVector;
  };
}

export interface UpdateShipHullAction {
  type: typeof UPDATE_SHIP_HULL;
  payload: {
    shipId: string;
    hull: number;
  };
}

export interface UpdateShipThrustAction {
  type: typeof UPDATE_SHIP_THRUST;
  payload: {
    shipId: string;
    thrust: number;
  };
}

export interface DestroyShipAction {
  type: typeof DESTROY_SHIP;
  payload: {
    shipId: string;
  };
}

export interface SelectShipAction {
  type: typeof SELECT_SHIP;
  payload: {
    shipId: string | null;
  };
}

// Plot Phase action interfaces
export interface PlotShipMoveAction {
  type: typeof PLOT_SHIP_MOVE;
  payload: {
    shipId: string;
    newVelocity: VelocityVector;
    thrustUsed: number;
  };
}

export interface ClearPlotAction {
  type: typeof CLEAR_PLOT;
  payload: {
    shipId: string;
  };
}

export interface ClearAllPlotsAction {
  type: typeof CLEAR_ALL_PLOTS;
}

export interface ToggleReachableHexesAction {
  type: typeof TOGGLE_REACHABLE_HEXES;
}

// Turn management action interfaces
export interface NextPhaseAction {
  type: typeof NEXT_PHASE;
}

export interface NextTurnAction {
  type: typeof NEXT_TURN;
}

export interface SetPhaseAction {
  type: typeof SET_PHASE;
  payload: {
    phase: GamePhase;
  };
}

export interface InitializeTurnOrderAction {
  type: typeof INITIALIZE_TURN_ORDER;
}

export type GameAction =
  | AddPlayerAction
  | RemovePlayerAction
  | ChangePlayerColorAction
  | StartGameAction
  | ReturnToConfigAction
  | AddShipAction
  | RemoveShipAction
  | UpdateShipPositionAction
  | UpdateShipVelocityAction
  | UpdateShipHullAction
  | UpdateShipThrustAction
  | DestroyShipAction
  | SelectShipAction
  | PlotShipMoveAction
  | ClearPlotAction
  | ClearAllPlotsAction
  | ToggleReachableHexesAction
  | NextPhaseAction
  | NextTurnAction
  | SetPhaseAction
  | InitializeTurnOrderAction;

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

// Ship action creators
export const addShip = (ship: Ship): AddShipAction => ({
  type: ADD_SHIP,
  payload: { ship },
});

export const removeShip = (shipId: string): RemoveShipAction => ({
  type: REMOVE_SHIP,
  payload: { shipId },
});

export const updateShipPosition = (
  shipId: string,
  position: HexCoordinate
): UpdateShipPositionAction => ({
  type: UPDATE_SHIP_POSITION,
  payload: { shipId, position },
});

export const updateShipVelocity = (
  shipId: string,
  velocity: VelocityVector
): UpdateShipVelocityAction => ({
  type: UPDATE_SHIP_VELOCITY,
  payload: { shipId, velocity },
});

export const updateShipHull = (
  shipId: string,
  hull: number
): UpdateShipHullAction => ({
  type: UPDATE_SHIP_HULL,
  payload: { shipId, hull },
});

export const updateShipThrust = (
  shipId: string,
  thrust: number
): UpdateShipThrustAction => ({
  type: UPDATE_SHIP_THRUST,
  payload: { shipId, thrust },
});

export const destroyShip = (shipId: string): DestroyShipAction => ({
  type: DESTROY_SHIP,
  payload: { shipId },
});

export const selectShip = (shipId: string | null): SelectShipAction => ({
  type: SELECT_SHIP,
  payload: { shipId },
});

// Plot Phase action creators
export const plotShipMove = (
  shipId: string,
  newVelocity: VelocityVector,
  thrustUsed: number
): PlotShipMoveAction => ({
  type: PLOT_SHIP_MOVE,
  payload: { shipId, newVelocity, thrustUsed },
});

export const clearPlot = (shipId: string): ClearPlotAction => ({
  type: CLEAR_PLOT,
  payload: { shipId },
});

export const clearAllPlots = (): ClearAllPlotsAction => ({
  type: CLEAR_ALL_PLOTS,
});

export const toggleReachableHexes = (): ToggleReachableHexesAction => ({
  type: TOGGLE_REACHABLE_HEXES,
});

// Turn management action creators
export const nextPhase = (): NextPhaseAction => ({
  type: NEXT_PHASE,
});

export const nextTurn = (): NextTurnAction => ({
  type: NEXT_TURN,
});

export const setPhase = (phase: GamePhase): SetPhaseAction => ({
  type: SET_PHASE,
  payload: { phase },
});

export const initializeTurnOrder = (): InitializeTurnOrderAction => ({
  type: INITIALIZE_TURN_ORDER,
});
