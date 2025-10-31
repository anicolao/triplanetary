// Movement execution logic for the Movement Phase

import { Ship } from '../ship/types';
import { PlottedMove } from '../redux/types';
import { MapObject, CelestialBody } from '../celestial/types';
import { calculateDestination } from './movement';
import { applyGravity } from './gravity';

/**
 * Executes plotted moves for all ships.
 * Applies plotted velocities from the queue and updates ship positions.
 * 
 * @param ships - Array of all ships
 * @param plottedMoves - Map of ship IDs to plotted moves
 * @returns Updated array of ships with new positions and velocities
 */
export function executeAllPlottedMoves(
  ships: Ship[],
  plottedMoves: Map<string, PlottedMove>
): Ship[] {
  return ships.map((ship) => {
    if (ship.destroyed) {
      return ship;
    }

    // Get the plotted move for this ship
    const plottedMove = plottedMoves.get(ship.id);
    
    if (plottedMove) {
      // Apply the plotted velocity
      return {
        ...ship,
        velocity: plottedMove.newVelocity,
      };
    }

    // If no plotted move, ship maintains current velocity
    return ship;
  });
}

/**
 * Applies gravity effects to all ships based on their positions.
 * 
 * @param ships - Array of all ships
 * @param mapObjects - Array of map objects (includes celestial bodies with gravity)
 * @returns Updated array of ships with gravity-modified velocities
 */
export function applyGravityToAllShips(
  ships: Ship[],
  mapObjects: MapObject[]
): Ship[] {
  // Filter for celestial bodies (Sun and Planets have gravity)
  const celestialBodies = mapObjects.filter(
    (obj) => obj.type === 'sun' || obj.type === 'planet'
  ) as CelestialBody[];

  // Apply gravity from all celestial bodies to each ship
  return ships.map((ship) => {
    if (ship.destroyed) {
      return ship;
    }
    return applyGravity(ship, celestialBodies);
  });
}

/**
 * Moves all ships to their destination based on their current velocity.
 * 
 * @param ships - Array of all ships
 * @returns Updated array of ships with new positions
 */
export function moveAllShips(ships: Ship[]): Ship[] {
  return ships.map((ship) => {
    if (ship.destroyed) {
      return ship;
    }

    const newPosition = calculateDestination(ship.position, ship.velocity);
    
    return {
      ...ship,
      position: newPosition,
    };
  });
}

/**
 * Resets thrust points for all ships at the start of movement phase.
 * 
 * @param ships - Array of all ships
 * @returns Updated array of ships with reset thrust
 */
export function resetShipThrust(ships: Ship[]): Ship[] {
  return ships.map((ship) => ({
    ...ship,
    remainingThrust: ship.stats.maxThrust,
  }));
}

/**
 * Calculates collision damage for a ship based on relative velocity.
 * According to Triplanetary rules, collision damage is based on the combined velocity.
 * 
 * @param ship1 - First ship in collision
 * @param ship2 - Second ship in collision
 * @returns Damage points to apply to each ship
 */
export function calculateCollisionDamage(
  ship1: Ship,
  ship2: Ship
): { ship1Damage: number; ship2Damage: number } {
  // Calculate relative velocity magnitude
  const relativeVelocityQ = Math.abs(ship1.velocity.q - ship2.velocity.q);
  const relativeVelocityR = Math.abs(ship1.velocity.r - ship2.velocity.r);
  const relativeVelocity = relativeVelocityQ + relativeVelocityR;

  // Base damage is 1 point per unit of relative velocity
  // Minimum 1 damage if ships collide
  const baseDamage = Math.max(1, Math.floor(relativeVelocity));

  // Both ships take the same damage
  return {
    ship1Damage: baseDamage,
    ship2Damage: baseDamage,
  };
}

/**
 * Applies damage to a ship from a collision.
 * 
 * @param ship - Ship to damage
 * @param damage - Amount of damage to apply
 * @returns Updated ship with reduced hull points
 */
export function applyDamageToShip(ship: Ship, damage: number): Ship {
  const newHull = Math.max(0, ship.stats.currentHull - damage);
  const isDestroyed = newHull <= 0;

  return {
    ...ship,
    stats: {
      ...ship.stats,
      currentHull: newHull,
    },
    destroyed: isDestroyed,
  };
}

/**
 * Processes all collisions and applies damage to affected ships.
 * 
 * @param ships - Array of all ships
 * @param collisions - Array of collision pairs (ship IDs)
 * @returns Updated array of ships with damage applied
 */
export function processCollisions(
  ships: Ship[],
  collisions: Array<[string, string]>
): Ship[] {
  // Build a map of ship IDs to total damage
  const damageMap = new Map<string, number>();

  for (const [shipId1, shipId2] of collisions) {
    const ship1 = ships.find((s) => s.id === shipId1);
    const ship2 = ships.find((s) => s.id === shipId2);

    if (!ship1 || !ship2) continue;

    const { ship1Damage, ship2Damage } = calculateCollisionDamage(ship1, ship2);

    // Accumulate damage for each ship
    damageMap.set(shipId1, (damageMap.get(shipId1) || 0) + ship1Damage);
    damageMap.set(shipId2, (damageMap.get(shipId2) || 0) + ship2Damage);
  }

  // Apply accumulated damage to ships
  return ships.map((ship) => {
    const damage = damageMap.get(ship.id);
    if (damage && damage > 0) {
      return applyDamageToShip(ship, damage);
    }
    return ship;
  });
}

/**
 * Detects collisions based on current ship positions.
 * Ships that are in the same hex position have collided.
 * 
 * @param ships - Array of ships to check
 * @returns Array of collision pairs (ship IDs)
 */
export function detectPositionCollisions(ships: Ship[]): Array<[string, string]> {
  const collisions: Array<[string, string]> = [];
  
  // Build a map of positions to ship IDs
  const positionMap = new Map<string, string[]>();
  
  for (const ship of ships) {
    if (ship.destroyed) continue;
    
    const key = `${ship.position.q},${ship.position.r}`;
    
    if (!positionMap.has(key)) {
      positionMap.set(key, []);
    }
    positionMap.get(key)!.push(ship.id);
  }
  
  // Find all hexes with multiple ships
  for (const [, shipIds] of positionMap) {
    if (shipIds.length > 1) {
      // Add all pairs of colliding ships
      for (let i = 0; i < shipIds.length; i++) {
        for (let j = i + 1; j < shipIds.length; j++) {
          collisions.push([shipIds[i], shipIds[j]]);
        }
      }
    }
  }
  
  return collisions;
}

/**
 * Executes the complete movement phase sequence.
 * 
 * @param ships - Array of all ships
 * @param plottedMoves - Map of ship IDs to plotted moves
 * @param mapObjects - Array of celestial bodies
 * @returns Object containing updated ships and detected collisions
 */
export function executeMovementPhase(
  ships: Ship[],
  plottedMoves: Map<string, PlottedMove>,
  mapObjects: MapObject[]
): { ships: Ship[]; collisions: Array<[string, string]> } {
  // Step 1: Apply plotted velocities
  let updatedShips = executeAllPlottedMoves(ships, plottedMoves);

  // Step 2: Apply gravity effects
  updatedShips = applyGravityToAllShips(updatedShips, mapObjects);

  // Step 3: Move ships to new positions
  updatedShips = moveAllShips(updatedShips);

  // Step 4: Detect collisions (ships that ended up in the same hex)
  const collisions = detectPositionCollisions(updatedShips);

  // Step 5: Apply collision damage
  updatedShips = processCollisions(updatedShips, collisions);

  // Step 6: Reset thrust for next turn
  updatedShips = resetShipThrust(updatedShips);

  return {
    ships: updatedShips,
    collisions,
  };
}
