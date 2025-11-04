// Redux reducer for game state management

import { GameState, Player, PLAYER_COLORS, MAX_PLAYERS, GamePhase } from './types';
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
  PLOT_SHIP_MOVE,
  CLEAR_PLOT,
  CLEAR_ALL_PLOTS,
  TOGGLE_REACHABLE_HEXES,
  NEXT_PHASE,
  NEXT_TURN,
  SET_PHASE,
  INITIALIZE_TURN_ORDER,
  EXECUTE_MOVEMENT,
  APPLY_COLLISION_DAMAGE,
  ADD_NOTIFICATION,
  CLEAR_NOTIFICATION,
  CLEAR_ALL_NOTIFICATIONS,
  DECLARE_ATTACK,
  CANCEL_ATTACK,
  EXECUTE_COMBAT,
  CLEAR_COMBAT_LOG,
  SELECT_TARGET,
  LAUNCH_ORDNANCE,
  REMOVE_ORDNANCE,
  UPDATE_ORDNANCE_POSITION,
  UPDATE_ORDNANCE_VELOCITY,
  DETONATE_ORDNANCE,
  UPDATE_SHIP_ORDNANCE,
} from './actions';
import { DEFAULT_SCENARIO, initializeMap } from '../celestial';
import { getDefaultPlacements, createShipsFromPlacements } from '../ship/placement';
import { moveOrdnance, checkOrdnanceCollisions } from '../physics/ordnanceMovement';
import { OrdnanceType } from '../ordnance/types';
import { executeMovementPhase, processCollisions } from '../physics/movementExecution';
import { executeCombatPhase } from '../combat/combatQueue';

// Initial state
export const initialState: GameState = {
  screen: 'configuration',
  players: [],
  ships: [],
  selectedShipId: null,
  mapObjects: initializeMap(DEFAULT_SCENARIO),
  currentScenario: DEFAULT_SCENARIO,
  mapBounds: DEFAULT_SCENARIO.bounds,
  plottedMoves: new Map(),
  showReachableHexes: true,
  currentPlayerIndex: 0,
  turnOrder: [],
  currentPhase: GamePhase.Plot,
  roundNumber: 1,
  turnHistory: [],
  ordnance: [],
  notifications: [],
  declaredAttacks: new Map(),
  combatLog: [],
  selectedTargetId: null,
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

// Helper function to get the next phase in the sequence
function getNextPhase(currentPhase: GamePhase): GamePhase {
  const phaseOrder = [
    GamePhase.Plot,
    GamePhase.Ordnance,
    GamePhase.Movement,
    GamePhase.Combat,
    GamePhase.Maintenance,
  ];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  const nextIndex = (currentIndex + 1) % phaseOrder.length;
  return phaseOrder[nextIndex];
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
        turnOrder: playerIds,
        currentPlayerIndex: 0,
        currentPhase: GamePhase.Plot,
        roundNumber: 1,
        turnHistory: [],
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

    case PLOT_SHIP_MOVE: {
      const { shipId, newVelocity, thrustUsed } = action.payload;
      const newPlottedMoves = new Map(state.plottedMoves);
      newPlottedMoves.set(shipId, { shipId, newVelocity, thrustUsed });
      return {
        ...state,
        plottedMoves: newPlottedMoves,
      };
    }

    case CLEAR_PLOT: {
      const { shipId } = action.payload;
      const newPlottedMoves = new Map(state.plottedMoves);
      newPlottedMoves.delete(shipId);
      return {
        ...state,
        plottedMoves: newPlottedMoves,
      };
    }

    case CLEAR_ALL_PLOTS: {
      return {
        ...state,
        plottedMoves: new Map(),
      };
    }

    case TOGGLE_REACHABLE_HEXES: {
      return {
        ...state,
        showReachableHexes: !state.showReachableHexes,
      };
    }

    case NEXT_PHASE: {
      const nextPhase = getNextPhase(state.currentPhase);
      
      // Add to history
      const historyEntry = {
        roundNumber: state.roundNumber,
        playerIndex: state.currentPlayerIndex,
        phase: state.currentPhase,
        timestamp: Date.now(),
      };

      let newState = {
        ...state,
        currentPhase: nextPhase,
        turnHistory: [...state.turnHistory, historyEntry],
      };

      // Clear combat state when leaving Combat phase
      if (state.currentPhase === GamePhase.Combat) {
        newState = {
          ...newState,
          selectedTargetId: null,
          declaredAttacks: new Map(),
        };
      }

      // Auto-execute movement when entering Movement phase
      if (nextPhase === GamePhase.Movement) {
        const { ships, collisions } = executeMovementPhase(
          state.ships,
          state.plottedMoves,
          state.mapObjects
        );
        
        // Generate notifications for collisions and destroyed ships
        const newNotifications = [...newState.notifications];
        
        for (const [shipId1, shipId2] of collisions) {
          const ship1 = ships.find(s => s.id === shipId1);
          const ship2 = ships.find(s => s.id === shipId2);
          if (ship1 && ship2) {
            newNotifications.push({
              id: `collision-${Date.now()}-${Math.random()}`,
              message: `Collision: ${ship1.name} and ${ship2.name}`,
              type: 'collision',
              timestamp: Date.now(),
            });
          }
        }
        
        // Check for destroyed ships
        for (const ship of ships) {
          if (ship.destroyed) {
            const oldShip = state.ships.find(s => s.id === ship.id);
            if (oldShip && !oldShip.destroyed) {
              newNotifications.push({
                id: `destroyed-${Date.now()}-${Math.random()}`,
                message: `${ship.name} was destroyed!`,
                type: 'destruction',
                timestamp: Date.now(),
              });
            }
          }
        }
        
        newState = {
          ...newState,
          ships,
          plottedMoves: new Map(), // Clear plotted moves after execution
          selectedShipId: null, // Clear selection after movement
          notifications: newNotifications,
        };
      }

      return newState;
    }

    case NEXT_TURN: {
      // Move to the next player
      const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.turnOrder.length;
      const isNewRound = nextPlayerIndex === 0;
      
      // Add to history
      const historyEntry = {
        roundNumber: state.roundNumber,
        playerIndex: state.currentPlayerIndex,
        phase: state.currentPhase,
        timestamp: Date.now(),
      };

      return {
        ...state,
        currentPlayerIndex: nextPlayerIndex,
        currentPhase: GamePhase.Plot, // Start of a new turn
        roundNumber: isNewRound ? state.roundNumber + 1 : state.roundNumber,
        turnHistory: [...state.turnHistory, historyEntry],
        // Clear plotted moves at the start of a new turn
        plottedMoves: new Map(),
      };
    }

    case SET_PHASE: {
      const { phase } = action.payload;
      return {
        ...state,
        currentPhase: phase,
      };
    }

    case INITIALIZE_TURN_ORDER: {
      const playerIds = state.players.map((p) => p.id);
      return {
        ...state,
        turnOrder: playerIds,
        currentPlayerIndex: 0,
        currentPhase: GamePhase.Plot,
        roundNumber: 1,
        turnHistory: [],
      };
    }

    case EXECUTE_MOVEMENT: {
      // Execute the complete movement phase
      const { ships } = executeMovementPhase(
        state.ships,
        state.plottedMoves,
        state.mapObjects
      );

      // Move ordnance
      let updatedOrdnance = moveOrdnance(state.ordnance, state.roundNumber);

      // Check for ordnance collisions with ships
      const ordnanceToDetonate = checkOrdnanceCollisions(updatedOrdnance, ships);

      // Mark colliding ordnance as detonated and apply damage
      let finalShips = ships;
      if (ordnanceToDetonate.length > 0) {
        updatedOrdnance = updatedOrdnance.map((ord) => {
          if (ordnanceToDetonate.includes(ord.id)) {
            return { ...ord, detonated: true };
          }
          return ord;
        });

        // Apply damage to ships hit by ordnance
        finalShips = ships.map((ship) => {
          let newHull = ship.stats.currentHull;
          
          updatedOrdnance.forEach((ord) => {
            if (ord.detonated && 
                ship.position.q === ord.position.q && 
                ship.position.r === ord.position.r) {
              newHull -= ord.damage;
            }
          });

          if (newHull <= 0) {
            return { ...ship, destroyed: true, stats: { ...ship.stats, currentHull: 0 } };
          } else if (newHull !== ship.stats.currentHull) {
            return { ...ship, stats: { ...ship.stats, currentHull: newHull } };
          }
          return ship;
        });

        // Remove detonated ordnance
        updatedOrdnance = updatedOrdnance.filter((ord) => !ord.detonated);
      }

      return {
        ...state,
        ships: finalShips,
        ordnance: updatedOrdnance,
        plottedMoves: new Map(), // Clear plotted moves after execution
        selectedShipId: null, // Clear selection after movement
      };
    }

    case APPLY_COLLISION_DAMAGE: {
      // This action is kept separate for testing purposes
      // In normal gameplay, collisions are handled by EXECUTE_MOVEMENT
      const { collisions } = action.payload;
      const updatedShips = processCollisions(state.ships, collisions);
      
      return {
        ...state,
        ships: updatedShips,
      };
    }

    case ADD_NOTIFICATION: {
      const { message, type } = action.payload;
      const newNotification = {
        id: `notification-${Date.now()}-${Math.random()}`,
        message,
        type,
        timestamp: Date.now(),
      };
      
      return {
        ...state,
        notifications: [...state.notifications, newNotification],
      };
    }

    case CLEAR_NOTIFICATION: {
      const { notificationId } = action.payload;
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== notificationId),
      };
    }

    case CLEAR_ALL_NOTIFICATIONS: {
      return {
        ...state,
        notifications: [],
      };
    }

    // Combat actions
    case DECLARE_ATTACK: {
      const { attack } = action.payload;
      const newDeclaredAttacks = new Map(state.declaredAttacks);
      newDeclaredAttacks.set(attack.attackerId, attack);
      
      return {
        ...state,
        declaredAttacks: newDeclaredAttacks,
      };
    }

    case CANCEL_ATTACK: {
      const { attackerId } = action.payload;
      const newDeclaredAttacks = new Map(state.declaredAttacks);
      newDeclaredAttacks.delete(attackerId);
      
      return {
        ...state,
        declaredAttacks: newDeclaredAttacks,
      };
    }

    case EXECUTE_COMBAT: {
      // Execute all declared attacks
      const { results, updatedShips, logEntries } = executeCombatPhase(
        state.declaredAttacks,
        state.ships
      );
      
      // Add destruction notifications
      const destructionNotifications = results
        .filter(result => result.targetDestroyed)
        .map(result => {
          const target = state.ships.find(s => s.id === result.attack.targetId);
          return {
            id: `notification-${Date.now()}-${Math.random()}`,
            message: `${target?.name || 'Ship'} was destroyed!`,
            type: 'destruction' as const,
            timestamp: Date.now(),
          };
        });
      
      return {
        ...state,
        ships: updatedShips,
        declaredAttacks: new Map(), // Clear attacks after execution
        combatLog: [...state.combatLog, ...logEntries],
        notifications: [...state.notifications, ...destructionNotifications],
      };
    }

    case CLEAR_COMBAT_LOG: {
      return {
        ...state,
        combatLog: [],
      };
    }

    case SELECT_TARGET: {
      const { targetId } = action.payload;
      return {
        ...state,
        selectedTargetId: targetId,
      };
    }

    case LAUNCH_ORDNANCE: {
      const { ordnance } = action.payload;
      return {
        ...state,
        ordnance: [...state.ordnance, ordnance],
      };
    }

    case REMOVE_ORDNANCE: {
      const { ordnanceId } = action.payload;
      return {
        ...state,
        ordnance: state.ordnance.filter(o => o.id !== ordnanceId),
      };
    }

    case UPDATE_ORDNANCE_POSITION: {
      const { ordnanceId, position } = action.payload;
      return {
        ...state,
        ordnance: state.ordnance.map(o =>
          o.id === ordnanceId ? { ...o, position } : o
        ),
      };
    }

    case UPDATE_ORDNANCE_VELOCITY: {
      const { ordnanceId, velocity } = action.payload;
      return {
        ...state,
        ordnance: state.ordnance.map(o =>
          o.id === ordnanceId ? { ...o, velocity } : o
        ),
      };
    }

    case DETONATE_ORDNANCE: {
      const { ordnanceId } = action.payload;
      return {
        ...state,
        ordnance: state.ordnance.map(o =>
          o.id === ordnanceId ? { ...o, detonated: true } : o
        ),
      };
    }

    case UPDATE_SHIP_ORDNANCE: {
      const { shipId, ordnanceType, count } = action.payload;
      return {
        ...state,
        ships: state.ships.map(ship => {
          if (ship.id !== shipId) return ship;
          
          const newOrdnance = { ...ship.ordnance };
          switch (ordnanceType) {
            case OrdnanceType.Mine:
              newOrdnance.mines = count;
              break;
            case OrdnanceType.Torpedo:
              newOrdnance.torpedoes = count;
              break;
            case OrdnanceType.Missile:
              newOrdnance.missiles = count;
              break;
          }
          
          return { ...ship, ordnance: newOrdnance };
        }),
      };
    }

    default:
      return state;
  }
}
