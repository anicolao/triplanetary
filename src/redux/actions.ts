// Redux action types and action creators

import { Ship, VelocityVector } from '../ship/types';
import { HexCoordinate } from '../hex/types';

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
  | SelectShipAction;

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
