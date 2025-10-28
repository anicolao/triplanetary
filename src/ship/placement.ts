// Ship placement logic for scenarios

import { Ship, createShip, generateShipId } from './types';
import { HexCoordinate } from '../hex/types';
import { Scenario } from '../celestial/scenario';

/**
 * Ship placement configuration for a scenario.
 */
export interface ShipPlacement {
  /** Player ID this ship belongs to */
  playerId: string;
  /** Ship name */
  name: string;
  /** Starting position on the hex grid */
  position: HexCoordinate;
  /** Optional custom ship stats */
  stats?: {
    maxThrust?: number;
    maxHull?: number;
    currentHull?: number;
    weapons?: number;
    cargo?: number;
  };
}

/**
 * Validate that a hex position is within the map bounds.
 */
export function isValidPosition(
  position: HexCoordinate,
  scenario: Scenario
): boolean {
  const { minQ, maxQ, minR, maxR } = scenario.bounds;
  return (
    position.q >= minQ &&
    position.q <= maxQ &&
    position.r >= minR &&
    position.r <= maxR
  );
}

/**
 * Create ships from placement configurations.
 * Validates positions and creates ship instances.
 */
export function createShipsFromPlacements(
  placements: ShipPlacement[],
  scenario: Scenario
): Ship[] {
  const ships: Ship[] = [];

  for (const placement of placements) {
    // Validate position is within bounds
    if (!isValidPosition(placement.position, scenario)) {
      console.warn(
        `Invalid ship placement for ${placement.name} at (${placement.position.q}, ${placement.position.r}). Skipping.`
      );
      continue;
    }

    // Create ship with unique ID
    const ship = createShip(
      generateShipId(),
      placement.name,
      placement.playerId,
      placement.position,
      placement.stats
    );

    ships.push(ship);
  }

  return ships;
}

/**
 * Get default ship placements for a basic scenario.
 * Each player gets one ship at their starting position.
 */
export function getDefaultPlacements(
  playerIds: string[],
  _scenario: Scenario
): ShipPlacement[] {
  const placements: ShipPlacement[] = [];

  // Default starting positions spread around the map
  // These are relative to the center (0, 0) where the Sun is
  const startingOffsets: HexCoordinate[] = [
    { q: -15, r: 8 },   // Player 1 - Upper left
    { q: 15, r: -8 },   // Player 2 - Lower right
    { q: 8, r: -15 },   // Player 3 - Lower left
    { q: -8, r: 15 },   // Player 4 - Upper right
    { q: -12, r: -5 },  // Player 5 - Left
    { q: 12, r: 5 },    // Player 6 - Right
  ];

  playerIds.forEach((playerId, index) => {
    const offset = startingOffsets[index % startingOffsets.length];
    const shipName = `Ship ${index + 1}`;

    placements.push({
      playerId,
      name: shipName,
      position: offset,
    });
  });

  return placements;
}

/**
 * Get racing scenario placements.
 * Ships start at the same position, ready to race.
 */
export function getRacingPlacements(
  playerIds: string[],
  _scenario: Scenario
): ShipPlacement[] {
  const placements: ShipPlacement[] = [];

  // All ships start near Mars orbit
  const startingPosition: HexCoordinate = { q: -18, r: 10 };

  playerIds.forEach((playerId, index) => {
    // Offset slightly so ships don't start in exact same hex
    const position: HexCoordinate = {
      q: startingPosition.q + (index % 3),
      r: startingPosition.r + Math.floor(index / 3),
    };

    placements.push({
      playerId,
      name: `Racer ${index + 1}`,
      position,
      stats: {
        maxThrust: 3, // Racing ships have higher thrust
      },
    });
  });

  return placements;
}

/**
 * Get combat scenario placements.
 * Ships start on opposite sides of the map.
 */
export function getCombatPlacements(
  playerIds: string[],
  _scenario: Scenario
): ShipPlacement[] {
  const placements: ShipPlacement[] = [];

  // Split players into two teams
  const team1Size = Math.ceil(playerIds.length / 2);

  playerIds.forEach((playerId, index) => {
    const isTeam1 = index < team1Size;
    const teamIndex = isTeam1 ? index : index - team1Size;

    // Team 1 starts on left, Team 2 on right
    const basePosition: HexCoordinate = isTeam1
      ? { q: -20, r: 0 }
      : { q: 20, r: 0 };

    const position: HexCoordinate = {
      q: basePosition.q,
      r: basePosition.r + (teamIndex * 3) - Math.floor((isTeam1 ? team1Size : playerIds.length - team1Size) / 2) * 3,
    };

    placements.push({
      playerId,
      name: `Fighter ${index + 1}`,
      position,
      stats: {
        weapons: 2, // Combat ships have better weapons
        maxHull: 8, // And more hull points
        currentHull: 8,
      },
    });
  });

  return placements;
}
