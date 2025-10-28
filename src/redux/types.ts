// State structure for the Triplanetary game

import { MapObject } from '../celestial/types';
import { Scenario, MapBounds } from '../celestial/scenario';

export type Screen = 'configuration' | 'gameplay';

export interface Player {
  id: string;
  color: string;
}

export interface GameState {
  screen: Screen;
  players: Player[];
  mapObjects: MapObject[];
  currentScenario: Scenario;
  mapBounds: MapBounds;
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
