# Triplanetary Game Design Document

## Overview

This document describes the design for the Triplanetary web-based game implementation. The game will use a full-screen HTML5 Canvas for the entire UI, rendered by a TypeScript implementation with Redux for state management.

## Technology Stack

- **TypeScript**: Type-safe game logic and UI rendering
- **HTML5 Canvas**: Full-screen canvas for all UI rendering
- **Redux**: State management for game configuration and gameplay
- **Redux Actions**: All user interactions will be dispatched as Redux actions

## Architecture

### Rendering Architecture

The application will use a single full-screen canvas element that fills the browser viewport. All UI elements, including buttons, player icons, text, and game graphics, will be painted directly onto this canvas using TypeScript rendering logic.

#### Main Rendering Loop

The main rendering loop will:
1. Subscribe to the Redux store for state changes
2. Read the current application state from the Redux store
3. Determine which screen to render based on state (configuration screen, gameplay screen, etc.)
4. Paint the appropriate UI elements onto the canvas
5. Handle input events (clicks, taps) and dispatch corresponding Redux actions

### State Management

Redux will manage all application state, including:
- Current screen/mode (configuration, gameplay, etc.)
- Player configuration (list of players and their colors)
- Game settings and scenario selection (future)
- Active game state during gameplay (future)

All user actions will be represented as Redux actions that modify the state tree. The rendering loop will react to state changes and update the display accordingly.

## Game Configuration Screen

The initial screen that users will see when launching the application. This screen allows players to configure who will participate in the game.

### Visual Layout

The configuration screen will display:

1. **Title Area**: Game title "Triplanetary" at the top of the screen
2. **Player List Area**: A vertical list showing all currently configured players
3. **Add Player Button**: A prominent button to add new players
4. **Start Game Button**: A button to proceed to gameplay (enabled only when at least one player is configured)

### Player List

The player list will display each configured player as an entry containing:

- **Player Color Icon**: A circular or rectangular color swatch representing the player's color
- **Player Label**: Text indicating the player number (e.g., "Player 1", "Player 2")
- **Remove Button**: An "X" button to remove this player from the game
- **Color Selection**: Ability to tap/click on the color icon to change the player's color

Players will be arranged vertically in the order they were added.

### Player Colors

The game will support up to 6 players with the following color-blind friendly palette:

1. **Blue** (#0173B2): Strong blue
2. **Orange** (#DE8F05): Vivid orange
3. **Green** (#029E73): Teal/cyan green
4. **Yellow** (#ECE133): Bright yellow
5. **Purple** (#CC78BC): Soft purple/magenta
6. **Red** (#CA5127): Reddish orange

These colors are selected from color-blind safe palettes to ensure all players can distinguish between them regardless of color vision deficiency.

### Color Selection

When a user taps/clicks on a player's color icon, a color picker overlay will appear showing all available colors. Colors already assigned to other players will be visually indicated (e.g., grayed out or with a checkmark) but can still be selected, which will swap colors between the two players.

### Add Player Interaction

When the "Add Player" button is clicked:
1. A Redux action is dispatched to add a new player
2. The new player is assigned the next available color from the palette
3. If 6 players already exist, the button becomes disabled
4. The player list updates to show the new player

### Remove Player Interaction

When a player's "X" button is clicked:
1. A Redux action is dispatched to remove that player
2. The player is removed from the player list
3. Their color becomes available for other players
4. The player list updates to reflect the removal

### Start Game Interaction

When the "Start Game" button is clicked:
1. A Redux action is dispatched to transition from configuration to gameplay
2. The application state changes to indicate gameplay mode
3. The main rendering loop detects this state change
4. The rendering loop switches from rendering the configuration screen to rendering the gameplay screen

## State Structure

### Configuration State

The Redux store will contain a configuration section with the following structure:

- **screen**: String indicating current screen ("configuration", "gameplay", etc.)
- **players**: Array of player objects, each containing:
  - **id**: Unique identifier for the player
  - **color**: The hex color code assigned to this player

### Redux Actions

Configuration screen actions include:

- **ADD_PLAYER**: Adds a new player to the configuration
- **REMOVE_PLAYER**: Removes a player by ID
- **CHANGE_PLAYER_COLOR**: Changes a player's color
- **START_GAME**: Transitions from configuration to gameplay
- **RETURN_TO_CONFIG**: Returns from gameplay to configuration (future)

## Gameplay Screen (Future Work)

The gameplay screen will render the actual game, including:
- Hexagonal game board
- Planet orbits and celestial bodies
- Spaceships with velocity vectors
- Turn indicators and player status
- Game controls

This will be designed and implemented in future iterations after the configuration screen is complete.

## Input Handling

### Mouse/Touch Input

The application will listen for click and touch events on the canvas and:
1. Convert screen coordinates to logical UI element boundaries
2. Determine which UI element was clicked based on coordinate bounds
3. Dispatch the appropriate Redux action for that interaction
4. Allow the state change to trigger a re-render

### Hit Detection

Since all UI elements are painted onto the canvas, the application must maintain a map of clickable regions and their corresponding actions. When an input event occurs:
1. The input coordinates are checked against all interactive regions
2. The first matching region determines which action to dispatch
3. Visual feedback may be rendered (e.g., button highlight) before dispatching the action

## Responsive Design

The canvas will resize to fill the browser viewport and adapt its rendering based on available space:
- Layout calculations will be proportional to canvas dimensions
- Font sizes and UI element sizes will scale appropriately
- Touch targets will be sized appropriately for mobile devices (minimum 44x44 points)

## Technical Considerations

### Canvas Rendering Performance

To ensure smooth performance:
- Only re-render when state changes occur
- Use requestAnimationFrame for smooth animations
- Cache rendered elements where appropriate
- Minimize canvas operations per frame

### Type Safety

TypeScript will provide type safety for:
- Redux action types and payloads
- State structure
- Rendering function signatures
- Event handler types

### Testing Strategy

Unit tests will cover:
- Redux reducers and action creators
- State transformation logic
- Input coordinate to UI element mapping
- Color assignment logic

Integration tests will use Playwright to:
- Record screenshots of UI states after all user actions
- Validate correct UI state after adding players
- Validate correct UI state after removing players
- Validate correct UI state after changing colors
- Validate correct UI state after starting the game
- Validate gameplay UI states (future)

## Accessibility Considerations

The following considerations will be made:

- **Color-blind Friendly Palette**: Using scientifically validated color-blind safe colors to ensure all players can distinguish between player colors
- **High Contrast**: Ensuring sufficient contrast between UI elements and backgrounds
- **Clear Labels**: All interactive elements will have clear text labels
- **Touch Targets**: Minimum size requirements for touch interaction (minimum 44x44 points)

Note: This game is designed for a physical shared tabletop device where players can see and touch the screen. Keyboard navigation and screen reader support are not planned as they are not applicable to this use case.

## Summary

This design provides a foundation for the Triplanetary web game with:
- A clean, canvas-based UI rendered entirely in TypeScript
- Redux-based state management for predictable state changes
- A player configuration screen supporting up to 6 color-blind friendly player colors
- A clear path forward for gameplay implementation
- Extensibility for future features like scenario selection and game settings
