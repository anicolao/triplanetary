// Redux action types and action creators

import { Ship, VelocityVector } from '../ship/types';
import { HexCoordinate } from '../hex/types';
import { GamePhase } from './types';
import { DeclaredAttack } from '../combat/types';

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

// Movement execution action types
export const EXECUTE_MOVEMENT = 'EXECUTE_MOVEMENT';
export const APPLY_COLLISION_DAMAGE = 'APPLY_COLLISION_DAMAGE';

// Notification action types
export const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
export const CLEAR_NOTIFICATION = 'CLEAR_NOTIFICATION';
export const CLEAR_ALL_NOTIFICATIONS = 'CLEAR_ALL_NOTIFICATIONS';

// Combat action types
export const DECLARE_ATTACK = 'DECLARE_ATTACK';
export const CANCEL_ATTACK = 'CANCEL_ATTACK';
export const EXECUTE_COMBAT = 'EXECUTE_COMBAT';
export const CLEAR_COMBAT_LOG = 'CLEAR_COMBAT_LOG';
export const SELECT_TARGET = 'SELECT_TARGET';

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

// Movement execution action interfaces
export interface ExecuteMovementAction {
  type: typeof EXECUTE_MOVEMENT;
}

export interface ApplyCollisionDamageAction {
  type: typeof APPLY_COLLISION_DAMAGE;
  payload: {
    collisions: Array<[string, string]>;
  };
}

// Notification action interfaces
export interface AddNotificationAction {
  type: typeof ADD_NOTIFICATION;
  payload: {
    message: string;
    type: 'info' | 'warning' | 'collision' | 'destruction';
  };
}

export interface ClearNotificationAction {
  type: typeof CLEAR_NOTIFICATION;
  payload: {
    notificationId: string;
  };
}

export interface ClearAllNotificationsAction {
  type: typeof CLEAR_ALL_NOTIFICATIONS;
}

// Combat action interfaces
export interface DeclareAttackAction {
  type: typeof DECLARE_ATTACK;
  payload: {
    attack: DeclaredAttack;
  };
}

export interface CancelAttackAction {
  type: typeof CANCEL_ATTACK;
  payload: {
    attackerId: string;
  };
}

export interface ExecuteCombatAction {
  type: typeof EXECUTE_COMBAT;
}

export interface ClearCombatLogAction {
  type: typeof CLEAR_COMBAT_LOG;
}

export interface SelectTargetAction {
  type: typeof SELECT_TARGET;
  payload: {
    targetId: string | null;
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
  | SelectShipAction
  | PlotShipMoveAction
  | ClearPlotAction
  | ClearAllPlotsAction
  | ToggleReachableHexesAction
  | NextPhaseAction
  | NextTurnAction
  | SetPhaseAction
  | InitializeTurnOrderAction
  | ExecuteMovementAction
  | ApplyCollisionDamageAction
  | AddNotificationAction
  | ClearNotificationAction
  | ClearAllNotificationsAction
  | DeclareAttackAction
  | CancelAttackAction
  | ExecuteCombatAction
  | ClearCombatLogAction
  | SelectTargetAction;

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

// Movement execution action creators
export const executeMovement = (): ExecuteMovementAction => ({
  type: EXECUTE_MOVEMENT,
});

export const applyCollisionDamage = (
  collisions: Array<[string, string]>
): ApplyCollisionDamageAction => ({
  type: APPLY_COLLISION_DAMAGE,
  payload: { collisions },
});

// Notification action creators
export const addNotification = (
  message: string,
  type: 'info' | 'warning' | 'collision' | 'destruction' = 'info'
): AddNotificationAction => ({
  type: ADD_NOTIFICATION,
  payload: { message, type },
});

export const clearNotification = (notificationId: string): ClearNotificationAction => ({
  type: CLEAR_NOTIFICATION,
  payload: { notificationId },
});

export const clearAllNotifications = (): ClearAllNotificationsAction => ({
  type: CLEAR_ALL_NOTIFICATIONS,
});

// Combat action creators
export const declareAttack = (attack: DeclaredAttack): DeclareAttackAction => ({
  type: DECLARE_ATTACK,
  payload: { attack },
});

export const cancelAttack = (attackerId: string): CancelAttackAction => ({
  type: CANCEL_ATTACK,
  payload: { attackerId },
});

export const executeCombat = (): ExecuteCombatAction => ({
  type: EXECUTE_COMBAT,
});

export const clearCombatLog = (): ClearCombatLogAction => ({
  type: CLEAR_COMBAT_LOG,
});

export const selectTarget = (targetId: string | null): SelectTargetAction => ({
  type: SELECT_TARGET,
  payload: { targetId },
});
