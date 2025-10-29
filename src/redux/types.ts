// State structure for the Triplanetary game

import { MapObject } from '../celestial/types';
import { Scenario, MapBounds } from '../celestial/scenario';
import { Ship, VelocityVector } from '../ship/types';

export type Screen = 'configuration' | 'gameplay';

export interface Player {
  id: string;
  color: string;
}

export interface PlottedMove {
  shipId: string;
  newVelocity: VelocityVector;
  thrustUsed: number;
}

export interface GameState {
  screen: Screen;
  players: Player[];
  ships: Ship[];
  selectedShipId: string | null;
  mapObjects: MapObject[];
  currentScenario: Scenario;
  mapBounds: MapBounds;
  // Plot Phase state
  plottedMoves: Map<string, PlottedMove>;
  showReachableHexes: boolean;
}

// Available color-blind friendly palette
export const PLAYER_COLORS = [
  '#0173B2', // Blue
  '#DE8F05', // Orange
  '#029E73', // Green
  '#ECE133', // Yellow
  '#CC78BC', // Purple
  '#CA5127', // Red
] as const;

export const MAX_PLAYERS = 6;
