# Movement History Feature - Visual Demonstration

## Screenshot

![Ship Movement with History Trail](https://github.com/user-attachments/assets/e46e2ecf-e9c6-42cf-9a32-5e66b6ba72b4)

*The screenshot above shows the gameplay with a ship (cyan triangle) after making its first move. The ship now has a velocity arrow indicating its current trajectory. As the ship continues to move, semi-transparent arrows will appear along its historical path, showing where it has been.*

## Feature Overview

Ships now track all movements made during their lifetime and display them as semi-transparent navigation arrows. History clears on destruction, refueling, or landing.

## Changes

**Type definitions** (`src/ship/types.ts`)
- Added `MovementHistoryEntry` interface tracking position and velocity per move
- Added `movementHistory: MovementHistoryEntry[]` to `Ship` interface
- Initialize empty history in `createShip()`

**Movement recording** (`src/physics/movementExecution.ts`)
- Record each move in `moveAllShips()` before updating position
- Handle ships without history for backward compatibility

**History lifecycle** (`src/redux/`)
- Clear history in `DESTROY_SHIP` reducer case
- Added `CLEAR_MOVEMENT_HISTORY` action and reducer case for refueling/landing

**Rendering** (`src/rendering/shipRenderer.ts`)
- Added `renderMovementHistory()` displaying arrows with progressive opacity fade (0.15→0.40)
- Render history layer below velocity vectors
- Added `showHistory` option to `ShipRenderOptions` (default: true)

## Implementation Details

```typescript
interface MovementHistoryEntry {
  fromPosition: HexCoordinate;
  velocity: VelocityVector;
}

// Recorded in moveAllShips()
const newHistoryEntry = {
  fromPosition: ship.position,
  velocity: { ...ship.velocity },
};

movementHistory: [...(ship.movementHistory || []), newHistoryEntry]
```

## Visual Design

- Historical arrows use the same style as current navigation arrows
- Progressive opacity fading: older moves are more transparent (0.15 alpha) while newer moves are more visible (0.40 alpha)
- Rendered below the current velocity vector for clear visual hierarchy
- Uses the ship's player color for easy identification

Fixes #38
