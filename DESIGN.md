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

## Gameplay Screen

The gameplay screen is the main game interface where players interact with the game world and execute their turns. This screen will render the hexagonal game board, celestial bodies, ships, and all UI controls needed to play the game according to the Triplanetary rules.

### Visual Layout

The gameplay screen will be organized into several key areas:

1. **Game Board Area**: The primary central area displaying the hexagonal grid with planets, orbits, ships, and space objects
2. **Player Status Panel**: Shows current player information, available ships, and resources
3. **Turn Indicator**: Displays whose turn it is and what phase they are in
4. **Phase Controls**: Buttons and controls specific to the current phase of play
5. **Game Status Bar**: Victory conditions, round counter, and other game-wide information

### Game Board Rendering

The game board is the centerpiece of the gameplay screen and will display:

#### Hexagonal Grid
- Hexagonal grid overlaid on the space map
- Grid lines in a subtle color to avoid visual clutter
- Coordinate system for referencing hex positions
- Zoom and pan controls for navigating large maps

#### Celestial Bodies
- **The Sun**: Rendered at the center with strong visual prominence
- **Planetary Orbits**: Circular paths showing Mercury, Venus, Earth, and Mars orbits
- **Planets**: Rendered on their orbits with appropriate colors and sizes
- **Asteroid Belt**: Between Mars and outer system
- **Space Stations**: Special locations marked on the map
- **Gravity Wells**: Visual indicators showing zones of gravitational influence

#### Ships and Units
- **Ship Pieces**: Each player's ships rendered in their assigned color
- **Velocity Vectors**: Arrows showing each ship's current velocity and direction
- **Thrust Modifications**: Visual indicators when plotting thrust changes
- **Ordnance**: Mines, torpedoes, and other launched weapons
- **Selection State**: Visual highlight for currently selected ships

### Game Loop State Management

The gameplay state in Redux will track:

#### Round and Turn Management
- **currentRound**: Integer tracking the current round number
- **playerTurnOrder**: Array of player IDs in their turn order (fixed for entire game)
- **currentPlayerIndex**: Index into playerTurnOrder indicating whose turn it is
- **currentPhase**: String indicating the current phase ("plot", "ordnance", "movement", "combat", "maintenance")

#### Game State
- **ships**: Array of all ships in the game with their positions, velocities, hull points, and other attributes
- **ordnance**: Array of active mines, torpedoes, and weapons in flight
- **celestialBodies**: Positions and properties of planets, sun, stations
- **selectedShip**: ID of the currently selected ship (if any)
- **plotQueue**: Temporary storage for moves being plotted during Plot Phase
- **combatQueue**: Temporary storage for attacks being declared during Combat Phase

#### Victory Conditions
- **scenarioObjectives**: The goals that must be achieved to win
- **victoryStatus**: Whether the game is ongoing, won, or drawn
- **winner**: Player ID of the winner (if any)

### Turn Sequence Implementation

Following the rules from RULES.md, the game loop consists of rounds where each player takes a turn with five distinct phases.

#### Game Initialization
At the start of gameplay:
1. Randomly determine player turn order
2. Set currentRound to 1
3. Set currentPlayerIndex to 0 (first player)
4. Set currentPhase to "plot"
5. Place ships according to scenario setup

#### Plot Phase

During the Plot Phase, the active player:
- Selects each of their ships one at a time
- For each ship, the game displays:
  - Current position on the hex map
  - Current velocity vector (arrow from current position)
  - Available thrust points
- Player can:
  - Plot the velocity vector (shows where ship will move)
  - Spend thrust points to modify the velocity vector
  - Each thrust point shifts the vector endpoint by one hex
  - Confirm the plot for this ship
- UI Controls:
  - Ship selection list or click-to-select on map
  - Thrust adjustment controls (directional buttons or drag interface)
  - Thrust point counter showing remaining thrust
  - "Confirm Plot" button for each ship
  - "End Plot Phase" button when all ships are plotted

When the player ends the Plot Phase:
- All plotted moves are stored in the plotQueue
- Game transitions to Ordnance Phase

#### Ordnance Phase

During the Ordnance Phase, the active player:
- Can launch mines, torpedoes, or nuclear weapons from their ships
- Must have the appropriate ordnance available
- UI shows:
  - Ships that can launch ordnance
  - Type and quantity of available ordnance
  - Launch controls for each weapon type
- UI Controls:
  - Select ship with ordnance
  - Choose ordnance type to launch
  - Set initial velocity/direction for ordnance (if applicable)
  - "Launch" button to confirm
  - "Skip Ordnance Phase" button if no ordnance to launch

When the player ends the Ordnance Phase:
- All launched ordnance is added to the ordnance array
- Game transitions to Movement Phase

#### Movement Phase

The Movement Phase is partially automated but shows:
- Visual animation of ships moving along their velocity vectors
- Ships moving simultaneously to their plotted destinations
- Ordnance moving according to their velocities
- Gravity effects being applied:
  - Ships near planets have their vectors modified by gravity
  - Visual indicators show gravity pulls
- Collision detection:
  - If ships end up in the same hex, collision may occur
  - Damage is calculated and applied
- UI shows:
  - Animation of all movement
  - Sequence of events (ship A moves, ship B moves, gravity applied, etc.)
  - Collision notifications if they occur
- UI Controls:
  - "Continue" button to proceed after movement animation completes
  - Animation speed control (optional)

Movement follows these steps automatically:
1. All active player's ships move simultaneously
2. All active player's ordnance moves
3. Gravity effects are calculated and applied
4. Collisions are detected and resolved
5. Ships update their position and velocity for next turn

When movement is complete:
- Game transitions to Combat Phase

#### Combat Phase

During the Combat Phase, the active player:
- Declares attacks from their ships
- Targets must be within weapon range
- UI shows:
  - Which ships can fire weapons
  - Potential targets in range
  - Weapon types available
  - Hit probability/modifiers
- Player can:
  - Select attacking ship
  - Choose target
  - Select weapon to use
  - See attack modifiers (range, relative velocity, etc.)
  - Declare the attack
- UI Controls:
  - Ship selection
  - Target selection (click on map or from list)
  - Weapon type selector
  - "Declare Attack" button
  - "End Combat Phase" button

Combat resolution:
1. For each declared attack:
   - Roll to hit (or calculate based on deterministic rules)
   - Display hit/miss result
   - If hit, calculate damage
   - Apply damage to target's hull points
   - Show damage animation and updated hull status
2. If any ship reaches 0 hull points:
   - Ship is destroyed
   - Remove from game
   - Show destruction animation

When the player ends the Combat Phase:
- Game transitions to Maintenance Phase

#### Maintenance Phase

The Maintenance Phase handles end-of-turn bookkeeping:
- Check victory conditions:
  - Are all enemy ships destroyed?
  - Have race checkpoints been reached?
  - Are scenario objectives complete?
- Resolve special situations:
  - Docking completion
  - Fuel depletion warnings
  - System repairs (in campaign mode)
- Display any notifications or events
- UI shows:
  - Victory condition status
  - Special events that occurred
  - Resource status updates
- UI Controls:
  - "End Turn" button to pass to next player

When Maintenance Phase completes:
1. If victory conditions are met:
   - Game transitions to victory screen
   - Display winner and game statistics
2. Otherwise:
   - Increment currentPlayerIndex
   - If currentPlayerIndex exceeds number of players:
     - Reset currentPlayerIndex to 0
     - Increment currentRound
   - Set currentPhase back to "plot"
   - Next player begins their turn

### Phase Transition State Machine

The game implements a state machine for phase transitions:

- **plot** → (player action) → **ordnance**
- **ordnance** → (player action) → **movement**
- **movement** → (automatic) → **combat**
- **combat** → (player action) → **maintenance**
- **maintenance** → (automatic) → **plot** (next player) OR **victory** (game over)

Each transition is triggered by:
- Player action (clicking "End Phase" button)
- Automatic progression (after animations or calculations complete)
- Game rules (victory condition met)

### UI Controls and Interactions

#### Universal Controls (Available All Phases)
- **Pan**: Click-and-drag to pan the game board
- **Zoom**: Scroll wheel or pinch gesture to zoom in/out
- **Ship Info**: Click on any ship to see detailed information panel
- **Menu Button**: Access game menu (save, settings, quit)

#### Phase-Specific Controls
Each phase has its own set of controls that appear in the Phase Controls area, as described in each phase section above.

#### Visual Feedback
- **Selected Ship**: Highlighted with glow or border
- **Valid Targets**: Highlighted when declaring attacks
- **Valid Moves**: Ghost image or path showing where ship will end up
- **Hover States**: UI elements show hover state for feedback
- **Animation States**: Smooth transitions between phases and actions
- **Error States**: Clear visual indication when invalid action attempted

### Ship Management

Ships are the primary game pieces and require detailed state tracking:

#### Ship State Properties
- **id**: Unique identifier
- **ownerId**: Player ID who owns this ship
- **position**: Hex coordinates on the map
- **velocity**: Vector (direction and magnitude) representing momentum
- **thrustPoints**: Available thrust for this turn
- **hullPoints**: Current hull integrity (health)
- **maxHullPoints**: Maximum hull integrity
- **weaponSystems**: Array of weapons and their status
- **ordnanceInventory**: Mines, torpedoes, etc. carried
- **cargoCapacity**: For cargo/racing scenarios
- **specialSystems**: Shields, sensors, etc.
- **dockingStatus**: Whether docked and where

#### Ship Actions
Based on the phase and ship state:
- Plot velocity changes (Plot Phase)
- Launch ordnance (Ordnance Phase)
- Fire weapons (Combat Phase)
- Dock at stations (Multiple phases)

### Gravity and Physics Simulation

The game must simulate realistic Newtonian physics:

#### Velocity Vectors
- Each ship has a velocity vector represented as hex-based direction and distance
- Vectors persist turn-to-turn (momentum conservation)
- Visual arrows show vector from current position

#### Thrust Application
- Each thrust point can shift the velocity vector endpoint by one hex
- Thrust can be applied in any direction
- Multiple thrust points can be combined
- Limited thrust points per turn require strategic planning

#### Gravity Effects
During Movement Phase:
- Calculate gravitational influence from all celestial bodies
- Sun has strongest gravity
- Planets have gravity proportional to their mass
- Gravity zones (inner, middle, outer) have different pull strengths
- Modify ship velocity vectors based on gravity
- Visual indicators show gravity wells and influence

#### Orbital Mechanics
- Ships in correct orbital velocity maintain stable orbit
- Too slow: ship falls toward planet
- Too fast: ship escapes orbit
- Gravity assists allow fuel-efficient trajectory changes

### Combat System

Combat occurs during the Combat Phase when ships are within range:

#### Weapon Types
- **Lasers**: Direct line-of-sight, instant hit/miss
- **Missiles**: Guided projectiles, move in subsequent turns
- **Mass Drivers**: Close range, high damage

#### Combat Calculations
- Range to target affects hit probability
- Relative velocity affects hit probability
- Ship size and profile affect hit probability
- Defensive systems may reduce damage
- Display all modifiers to player before confirming attack

#### Damage Application
- Successful hits reduce target hull points
- Critical hits may damage specific systems
- Zero hull points destroys ship
- Visual feedback shows damage state

### Scenario and Victory Conditions

Different scenarios have different objectives:

#### Racing Scenarios
- Checkpoints displayed on map
- Must pass through in sequence
- First to complete all checkpoints wins
- Track completion status for each player

#### Combat Scenarios
- Destroy all enemy ships
- Protect specific targets
- Capture objectives
- Track casualties and objectives

#### Campaign Scenarios
- Multiple linked objectives
- Persistent ship status between missions
- Victory points accumulated over multiple games

Victory check occurs every Maintenance Phase:
- Evaluate current game state against scenario objectives
- If victory conditions met, transition to victory screen
- Otherwise, continue to next player's turn

### Player Status Display

Throughout gameplay, display current player information:
- Active player indicator (whose turn it is)
- Phase indicator (which phase is active)
- Player's ships and their status
- Available resources (thrust, ordnance, etc.)
- Victory progress indicators

### Game Persistence (Future Enhancement)

Design supports future addition of:
- Save game state to local storage or server
- Load previously saved games
- Replay functionality
- Undo/redo for plot phase

### Multiplayer Considerations

The game is designed for shared tabletop device play:
- Single screen shows all information
- Players take turns physically passing the device
- No hidden information (all players see all ships)
- Turn-based nature eliminates timing issues
- Large touch targets for finger interaction

### Animation and Visual Polish

To enhance gameplay experience:
- Smooth animations for ship movement
- Particle effects for weapon fire
- Explosion animations for destroyed ships
- Transition effects between phases
- Visual trails showing movement paths
- Gravity well visualization effects

All animations should:
- Be clear and informative
- Not obscure important information
- Be fast enough to maintain game pace
- Be skippable for experienced players

### Error Handling and Validation

The game must prevent invalid actions:
- Cannot exceed available thrust points
- Cannot target out-of-range ships
- Cannot move ships during other player's turn
- Cannot skip required actions (must plot all ships)
- Display clear error messages for invalid actions
- Prevent impossible physics (e.g., instant 180° reversals)

### Accessibility in Gameplay

Following configuration screen principles:
- Color-blind friendly player colors maintained
- High contrast for all UI elements
- Large touch targets (minimum 44x44 points)
- Clear labels and instructions
- Visual indicators supplement color coding

### Summary

The gameplay screen implements a complete turn-based game loop following the official Triplanetary rules. The design emphasizes:
- Clear phase structure matching the five-phase turn sequence
- Redux state management for predictable game state
- Canvas-based rendering for all game elements
- Intuitive controls for ship management and combat
- Realistic physics simulation with gravity and momentum
- Support for multiple scenario types and victory conditions
- Smooth animations and visual feedback
- Future extensibility for advanced features

This design provides the foundation for implementing the core Triplanetary gameplay experience while maintaining the architecture established in the configuration screen.

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
