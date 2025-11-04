# Triplanetary Implementation Plan

## Overview

This document outlines the complete implementation plan for the Triplanetary web-based game. The plan is organized into discrete, independently testable phases that build upon each other incrementally. Each phase delivers verifiable functionality and can be validated before proceeding to the next.

## Implementation Principles

1. **Incremental Development**: Each phase adds new functionality while preserving existing features
2. **Independent Testing**: Each phase has clear acceptance criteria and can be tested independently
3. **Minimal Dependencies**: Phases are ordered to minimize blocking dependencies
4. **Verifiable Progress**: Each phase produces observable, demonstrable results
5. **No Regression**: New phases must not break previously implemented and tested functionality

## Phase Breakdown

### Phase 1: Foundation and Configuration Screen ✓ COMPLETED

**Objective**: Establish the technical foundation and implement the player configuration screen.

**Components**:
- Project setup with TypeScript, Vite, and development tooling
- Redux store configuration and state management infrastructure
- HTML5 Canvas initialization and rendering framework
- Player configuration state management
- Configuration screen UI rendering
- Input handling for player management
- Color-blind friendly color palette implementation

**Testing & Verification**:
- Unit tests for Redux reducers
- Unit tests for player state management
- E2E tests for adding players
- E2E tests for removing players
- E2E tests for changing player colors
- Visual verification of color-blind friendly palette
- Screenshot tests for UI states

**Acceptance Criteria**:
- Players can be added (up to 6)
- Players can be removed
- Player colors can be changed
- Colors use color-blind friendly palette
- UI renders correctly on various screen sizes
- All unit and E2E tests pass

**Status**: COMPLETED (based on existing implementation)

---

### Phase 2: Game Board Infrastructure

**Objective**: Implement the hexagonal game board rendering system and basic navigation.

**Components**:

#### 2.1: Hexagonal Grid System ✓ COMPLETED
- Hexagonal coordinate system implementation
- Hex-to-pixel coordinate conversion
- Pixel-to-hex coordinate conversion
- Hexagonal grid data structure
- Neighbor hex calculation
- Distance and pathfinding utilities

**Testing & Verification**:
- Unit tests for coordinate conversions
- Unit tests for hex math operations
- Unit tests for distance calculations
- Visual tests showing grid rendering

#### 2.2: Game Board Rendering ✓ COMPLETED
- Hexagonal grid rendering on canvas
- Grid line drawing with configurable styles
- Coordinate labeling system
- Background rendering
- Layered rendering system (background, grid, objects, UI)

**Testing & Verification**:
- Visual tests of hex grid rendering
- Screenshot tests of coordinate system
- Unit tests for rendering boundaries
- Performance tests for large grids

#### 2.3: Pan and Zoom Controls **(OPTIONAL - NOT IN MVP)**
- Mouse-based panning implementation
- Touch-based panning for mobile
- Zoom in/out functionality
- Zoom limits and bounds checking
- Smooth animation for pan/zoom
- Reset view to default position

**Note**: This feature is marked as optional and will not be implemented as part of the MVP. The game will use a fixed view of the game board that encompasses all gameplay elements.

**Testing & Verification** (when implemented):
- E2E tests for mouse panning
- E2E tests for touch panning
- E2E tests for zoom controls
- Tests for zoom limits
- Visual verification of smooth animations

**Acceptance Criteria**:
- Hexagonal grid renders correctly
- Coordinates are accurate and labeled
- Grid displays the full game area at an appropriate scale
- All tests pass

**Note**: Pan and zoom controls (section 2.3) are optional features not included in the MVP.

**Dependencies**: Phase 1

**Estimated Complexity**: Medium

---

### Phase 3: Celestial Bodies and Map ✓ COMPLETED

**Objective**: Implement the solar system map with planets, orbits, and the Sun.

**Components**:

#### 3.1: Celestial Body Data Model ✓ COMPLETED
- Sun data structure and properties ✓
- Planet data structures (Mercury, Venus, Earth, Mars) ✓
- Orbital path definitions ✓
- Gravity well zones (inner, middle, outer) ✓ (legacy - kept for compatibility)
- Position calculation for orbiting bodies ✓
- **NEW:** Gravity hex data structure with position, direction, and weak flag ✓
- **NEW:** Gravity hexes generated adjacent to celestial bodies ✓
- **NEW:** Arrow directions pointing toward celestial bodies ✓
- **NEW:** One-turn delay tracking via gravityHexesEntered field ✓

**✅ CORRECTION COMPLETED:** Implemented hex-based gravity per 2018 rules:
- Gravity represented by arrows in hexes adjacent to celestial bodies ✓
- Each gravity hex applies exactly one hex of acceleration in arrow direction ✓
- Effect applied on turn AFTER entering gravity hex (one-turn delay) ✓
- Cumulative and mandatory across multiple gravity hexes ✓
- Discrete full-hex increments (not gradual zones) ✓
- Legacy zone-based system maintained for backward compatibility ✓

**Testing & Verification**:
- Unit tests for celestial body data
- Unit tests for orbital calculations
- Validation of orbital mechanics accuracy

#### 3.2: Celestial Body Rendering ✓ COMPLETED
- Sun rendering (centered on map) ✓
- Planet rendering on orbits ✓
- Orbital path visualization ✓
- Gravity well zone visualization ✓ (legacy - disabled by default)
- Visual distinction for different planets ✓
- Appropriate scaling for fixed view display ✓
- **NEW:** Gravity arrow rendering in hexes adjacent to bodies ✓
- **NEW:** Arrow direction visualization (pointing toward body) ✓
- **NEW:** Distinct colors for weak vs full gravity ✓
- **NEW:** Clear marking of gravity effect hexes ✓

**✅ CORRECTION COMPLETED:** Gravity visualization per 2018 rules:
- Arrows rendered in hexes adjacent to celestial bodies ✓
- Direction and magnitude clearly shown per hex ✓
- Arrows point toward the celestial body ✓
- Weak gravity hexes shown in different color ✓
- Legacy zone circles kept but disabled by default ✓

**Testing & Verification**:
- Screenshot tests of solar system layout
- Visual verification of planet positions
- Tests for gravity well visualization
- Validation of orbital paths

#### 3.3: Map Initialization ✓ COMPLETED
- Scenario-based map setup ✓
- Placement of space stations ✓
- Asteroid field placement ✓
- Map bounds definition ✓
- Initial view positioning ✓
- **NEW:** Gravity hex generation for celestial bodies ✓
- **NEW:** Arrow directions for each gravity hex ✓
- **NEW:** Weak gravity flag support for Luna and Io ✓
- **NEW:** Automatic gravity hex updates when planets move ✓

**✅ CORRECTION COMPLETED:** Map data structure per 2018 rules:
- Gravity hex definitions included for each celestial body ✓
- Arrow directions for each gravity hex (pointing toward body) ✓
- Weak gravity flag support for Luna and Io hexes ✓
- Gravity hexes positioned adjacent to celestial bodies ✓
- Gravity hexes update when planets move in orbit ✓

**Testing & Verification**:
- Tests for different scenario configurations
- Visual verification of complete map
- Tests for special locations (stations, asteroids)

**Acceptance Criteria**:
- Solar system map renders accurately ✓
- Planets appear on correct orbits ✓
- Gravity wells are visualized ✓
- All celestial bodies are positioned correctly and visible in fixed view ✓
- Space stations and asteroids are placed on the map ✓
- Map bounds are defined for gameplay area ✓
- All tests pass ✓

**Status**: COMPLETED

**Dependencies**: Phase 2

**Estimated Complexity**: Medium

---

### Phase 4: Ship Data Model and State

**Objective**: Implement the ship data structures and state management.

**Components**:

#### 4.1: Ship Data Structure ✓ COMPLETED
- Ship properties definition (id, position, velocity, etc.)
- Ship state interface in Redux
- Velocity vector representation
- Ship statistics (thrust, hull, weapons, cargo)
- Ship ownership tracking

**Testing & Verification**:
- Unit tests for ship data structure ✓
- Unit tests for ship creation ✓
- Validation of property constraints ✓

#### 4.2: Ship State Management ✓ COMPLETED
- Redux actions for ship operations ✓
- Reducers for ship state updates ✓
- Ship collection management (add, remove, update) ✓
- Ship selection state ✓
- Ship filtering and queries

**Testing & Verification**:
- Unit tests for all ship actions ✓
- Unit tests for ship reducers ✓
- Tests for ship collection operations ✓
- Tests for ship selection logic ✓

#### 4.3: Initial Ship Placement ✓ COMPLETED
- Scenario-based ship placement ✓
- Ship placement validation (valid hex positions) ✓
- Multi-ship placement for players ✓
- Fleet organization ✓

**Testing & Verification**:
- Unit tests for placement logic ✓
- Tests for placement validation ✓
- Tests for various scenario setups ✓

**Acceptance Criteria**:
- Ship data model is complete ✓
- Ships can be added to game state ✓
- Ships can be updated and removed ✓
- Ship state is properly managed in Redux ✓
- Initial placement works for scenarios ✓
- All tests pass ✓

**Status**: COMPLETED

**Dependencies**: Phase 1, Phase 3

**Estimated Complexity**: Medium

---

### Phase 5: Ship Rendering and Display ✓ COMPLETED

**Objective**: Render ships on the game board with visual indicators.

**Components**:

#### 5.1: Basic Ship Rendering ✓ COMPLETED
- Ship sprite/icon rendering ✓
- Color-coded ship display (using player colors) ✓
- Ship position on hex grid ✓
- Ship orientation visualization ✓
- Appropriate scaling for fixed view display ✓

**Testing & Verification**:
- Screenshot tests of ship rendering ✓
- Tests for color application ✓
- Visual verification of ship display ✓

#### 5.2: Velocity Vector Visualization ✓ COMPLETED
- Velocity arrow rendering ✓
- Arrow starting from ship position ✓
- Arrow ending at velocity endpoint ✓
- Arrow styling (color, width, arrowhead) ✓
- Velocity magnitude visualization ✓

**Testing & Verification**:
- Screenshot tests of velocity vectors ✓
- Tests for different velocity values ✓
- Visual verification of arrow rendering ✓

#### 5.3: Ship Status Indicators ✓ COMPLETED
- Hull points display ✓
- Thrust points remaining ✓
- Selected ship highlighting ✓
- Damaged ship visual indicators ✓
- Out-of-fuel indicators ✓

**Testing & Verification**:
- Screenshot tests of status displays ✓
- Tests for different ship conditions ✓
- Visual verification of indicators ✓

**Acceptance Criteria**:
- Ships render correctly on the board ✓
- Each ship displays in correct player color ✓
- Velocity vectors are visible and accurate ✓
- Ship status is clearly indicated ✓
- All tests pass ✓

**Status**: COMPLETED

**Dependencies**: Phase 4, Phase 2

**Estimated Complexity**: Medium

---

### Phase 6: Physics and Movement System ✓ COMPLETED

**Objective**: Implement the core Newtonian physics and movement mechanics.

**Components**:

#### 6.1: Vector Mathematics ✓ COMPLETED
- Vector addition and subtraction ✓
- Vector magnitude calculation ✓
- Vector normalization ✓
- Hex-based vector representation ✓
- Vector-to-hex conversion ✓

**Testing & Verification**:
- Unit tests for all vector operations ✓
- Tests for hex-vector conversions ✓
- Validation of mathematical accuracy ✓

#### 6.2: Velocity Management ✓ COMPLETED
- Current velocity tracking ✓
- Velocity modification (thrust application) ✓
- Velocity limit checking ✓
- Velocity persistence between turns ✓
- Thrust point expenditure tracking ✓

**Testing & Verification**:
- Unit tests for velocity updates ✓
- Tests for thrust application ✓
- Tests for velocity limits ✓
- Tests for persistence ✓

#### 6.3: Movement Calculation ✓ COMPLETED
- Calculate destination hex from position and velocity ✓
- Movement path calculation ✓
- Collision detection during movement ✓
- Movement validation (legal moves) ✓
- Multi-ship simultaneous movement ✓

**Testing & Verification**:
- Unit tests for movement calculations ✓
- Tests for path validation ✓
- Tests for collision detection ✓
- Integration tests for multi-ship movement ✓

#### 6.4: Gravity Simulation ✓ COMPLETED
- Gravity well zone detection ✓ (legacy)
- Gravitational force calculation ✓ (legacy)
- Velocity modification by gravity ✓
- Orbital mechanics implementation ✓
- Gravity assist calculations ✓
- **NEW:** Discrete hex-based gravity system ✓
- **NEW:** One-turn delay implementation ✓
- **NEW:** Sequential cumulative application ✓
- **NEW:** Weak gravity choice support ✓

**✅ CORRECTION COMPLETED:** Gravity simulation per 2018 rules:

**Implemented Changes:**
1. **Discrete Hex-Based System**: ✓
   - Track which gravity hexes ship entered on current turn ✓
   - Apply gravity effects on NEXT turn (one-turn delay) ✓
   - Each gravity hex shifts endpoint by exactly one hex in arrow direction ✓
   
2. **Gravity Hex Data Model**: ✓
   - Gravity hexes defined as specific map hexes with arrow directions ✓
   - Arrow direction stored (pointing toward celestial body) ✓
   - Hexes marked as full gravity vs weak gravity (Luna, Io) ✓
   
3. **Application Order**: ✓
   - Gravity hexes applied in sequence (order matters for cumulative effects) ✓
   - Gravity hex entry tracked from previous turn ✓
   - Each hex's effect applied as a one-hex shift in arrow direction ✓
   
4. **Weak Gravity Choice**: ✓
   - Luna and Io: player can choose to use or ignore each weak gravity hex ✓
   - Support for multiple weak gravity hex decisions ✓
   
5. **Orbit Definition**: ✓
   - Ship moving one hex/turn between adjacent gravity hexes = orbit ✓
   - Discrete system makes orbit calculation straightforward ✓

**Legacy System**: Original zone-based gravity kept for backward compatibility

**Testing & Verification**:
- Unit tests for gravity calculations ✓
- Tests for gravity zones ✓
- Tests for orbital mechanics ✓
- Validation against physics principles ✓
- Tests for discrete hex-based gravity ✓ (25 new tests added)
- Tests for one-turn delay ✓
- Tests for cumulative sequential application ✓
- Tests for weak gravity choice ✓
- Tests for gravity hex generation ✓
- Tests for gravity hex detection ✓

**Acceptance Criteria**:
- Ships move according to velocity vectors ✓
- Thrust modifies velocity correctly ✓
- Gravity affects ship trajectories ✓
- Orbital mechanics work realistically ✓
- Collisions are detected ✓
- All physics tests pass ✓ (526 tests)
- Gravity applies as discrete one-hex shifts per gravity hex ✓
- Gravity effects delayed by one turn ✓
- Multiple gravity hexes apply cumulatively in sequence ✓
- Weak gravity choices work correctly ✓
- Legacy and new systems both available ✓

**Status**: COMPLETED (2018 rules corrections implemented)

**Dependencies**: Phase 4, Phase 3

**Estimated Complexity**: High

---

### Phase 7: Turn Management System ✓ COMPLETED

**Objective**: Implement the turn-based game loop and phase management.

**Components**:

#### 7.1: Turn Order Management ✓ COMPLETED
- Player turn order initialization ✓
- Current player tracking ✓
- Turn order progression ✓
- Round counter ✓
- Turn history tracking ✓

**Testing & Verification**:
- Unit tests for turn order ✓
- Tests for turn progression ✓
- Tests for round counting ✓
- Tests for multiple rounds ✓

#### 7.2: Phase State Machine ✓ COMPLETED
- Phase enumeration (Plot, Ordnance, Movement, Combat, Maintenance) ✓
- Current phase tracking ✓
- Phase transition logic ✓
- Phase-specific state ✓
- Phase completion validation ✓

**Testing & Verification**:
- Unit tests for phase transitions ✓
- Tests for phase state machine ✓
- Tests for invalid transitions ✓
- Integration tests for full turn cycle ✓

#### 7.3: Turn Transition UI ✓ COMPLETED
- Phase indicator display ✓
- Current player indicator ✓
- Phase completion buttons ✓
- Turn summary display ✓
- Round counter display ✓

**Testing & Verification**:
- Screenshot tests of phase UI ✓
- E2E tests for phase transitions ✓
- Visual verification of indicators ✓
- Tests for button states ✓

**Acceptance Criteria**:
- Turn order is properly managed ✓
- Phases transition correctly ✓
- Current phase and player are clearly displayed ✓
- Phase completion works correctly ✓
- Round counter increments properly ✓
- All tests pass ✓

**Status**: COMPLETED

**Dependencies**: Phase 1, Phase 4

**Estimated Complexity**: Medium

---

### Phase 8: Plot Phase Implementation

**Objective**: Implement the Plot Phase where players plan ship movements.

**Components**:

#### 8.1: Plot Phase UI ✓ COMPLETED
- Ship selection interface ✓
- Current ship highlighting ✓
- Available thrust display ✓
- Velocity plotting interface ✓
- Thrust application controls ✓
- Plot confirmation UI ✓

**Testing & Verification**:
- Screenshot tests of Plot Phase UI ✓
- E2E tests for ship selection ✓
- Tests for UI state during plotting ✓

#### 8.2: Thrust Application ✓ COMPLETED
- Directional thrust controls ✓
- Thrust point expenditure ✓
- Velocity vector modification preview ✓
- Undo/redo for thrust application ✓
- Invalid thrust rejection ✓

**Testing & Verification**:
- E2E tests for thrust application ✓
- Tests for thrust limits ✓
- Tests for vector preview ✓
- Tests for undo/redo ✓

#### 8.3: Reachable Hex Highlighting ✓ COMPLETED
- Calculate all reachable hexes given current velocity and thrust ✓
- Visual highlighting of reachable hexes ✓
- Thrust requirement display for each hex ✓
- Resulting velocity preview for each reachable hex ✓
- Toggle highlighting on/off ✓
- Highlight style configuration ✓

**Testing & Verification**:
- Unit tests for reachable hex calculation ✓
- Screenshot tests of highlighting ✓
- Tests for thrust requirement accuracy ✓
- E2E tests for hex selection ✓
- Tests for highlight toggle ✓

#### 8.4: Plot Queue Management ✓ COMPLETED
- Store plotted moves temporarily ✓
- Track which ships have been plotted ✓
- Allow plot modification before confirmation ✓
- Clear plots if needed ✓
- Validate all ships are plotted before phase end ✓

**Testing & Verification**:
- Unit tests for plot queue ✓
- Tests for plot validation ✓
- Tests for partial plotting ✓
- Integration tests for complete plotting ✓

**Acceptance Criteria**:
- Ships can be selected for plotting ✓
- Thrust can be applied to modify velocity ✓
- Reachable hexes are highlighted correctly ✓
- Players can see resulting velocity for each option ✓
- Plot queue tracks all plotted moves ✓
- Phase cannot end until all ships plotted ✓
- All tests pass ✓

**Status**: COMPLETED

**Dependencies**: Phase 5, Phase 6, Phase 7

**Estimated Complexity**: High

---

### Phase 9: Movement Phase Implementation ✓ COMPLETED

**Objective**: Implement the Movement Phase where ships execute their plotted moves.

**Components**:

#### 9.1: Movement Execution ✓ COMPLETED
- Execute plotted moves from queue ✓
- Update ship positions ✓
- Update ship velocities ✓
- Apply gravity effects ✓
- Handle collisions ✓
- Clear plot queue after execution ✓

**Testing & Verification**:
- Unit tests for movement execution ✓
- Tests for position updates ✓
- Tests for velocity updates ✓
- Integration tests for full movement cycle ✓

#### 9.2: Movement Animation (SIMPLIFIED FOR MVP)
- Smooth ship movement animation (deferred - instant movement for MVP)
- Path visualization during movement (deferred)
- Gravity effect animation (deferred)
- Collision animation (deferred)
- Configurable animation speed (deferred)
- Skip animation option (deferred)

**Note**: For the MVP, movement is executed instantly when entering the Movement phase. Animation system can be added in future enhancement phases.

**Testing & Verification**:
- Movement executes correctly without animation ✓
- E2E tests for movement phase ✓

#### 9.3: Collision Resolution ✓ COMPLETED
- Detect ships in same hex after movement ✓
- Calculate collision damage ✓
- Apply damage to hull points ✓
- Display collision notification ✓
- Update ship status after collision ✓
- Handle ship destruction from collisions ✓

**Testing & Verification**:
- Unit tests for collision detection ✓
- Tests for damage calculation ✓
- Tests for ship destruction ✓
- E2E tests for collision scenarios ✓

**Acceptance Criteria**:
- Ships move to plotted destinations ✓
- Movement executes when phase begins ✓
- Gravity effects are applied correctly ✓
- Collisions are detected and resolved ✓
- Damage is calculated and applied ✓
- Notifications shown for collisions and destruction ✓
- All tests pass ✓

**Status**: COMPLETED (animation deferred to post-MVP)

**Dependencies**: Phase 6, Phase 8

**Estimated Complexity**: High

---

### Phase 10: Ordnance Phase Implementation ✓ COMPLETED

**Objective**: Implement the Ordnance Phase for launching weapons and mines.

**Components**:

#### 10.1: Ordnance Data Model ✓ COMPLETED
- Ordnance types (mines, torpedoes, missiles) ✓
- Ordnance properties (position, velocity, owner) ✓
- Ordnance inventory tracking ✓
- Ordnance state in Redux ✓
- Ordnance lifecycle management ✓

**Testing & Verification**:
- Unit tests for ordnance data model ✓
- Tests for ordnance creation ✓
- Tests for inventory management ✓

#### 10.2: Ordnance Launch UI ✓ COMPLETED
- Ship selection for ordnance launch ✓
- Available ordnance display ✓
- Ordnance type selection ✓
- Launch controls (velocity, direction if applicable) ✓
- Launch confirmation ✓
- Auto-skip if no ordnance available ✓

**Testing & Verification**:
- Screenshot tests of Ordnance Phase UI (visual verification needed)
- E2E tests for ordnance launch (can be added in future phases)
- Tests for auto-skip behavior (implemented via ship selection deselect)
- Tests for UI state ✓

#### 10.3: Ordnance Movement ✓ COMPLETED
- Ordnance movement calculation ✓
- Ordnance rendering on map ✓
- Ordnance trajectory display ✓
- Ordnance lifetime tracking ✓
- Ordnance detonation conditions ✓

**Testing & Verification**:
- Unit tests for ordnance movement ✓
- Screenshot tests of ordnance on map (visual verification needed)
- Tests for detonation logic ✓
- Integration tests for ordnance lifecycle ✓

**Acceptance Criteria**:
- Ordnance can be launched from ships ✓
- Ordnance inventory is tracked correctly ✓
- Ordnance moves according to physics ✓
- Ordnance is rendered on the map ✓
- Phase auto-skips when no ordnance available (via ship deselection) ✓
- All tests pass ✓

**Status**: COMPLETED

**Dependencies**: Phase 6, Phase 7, Phase 8

**Estimated Complexity**: Medium

---

### Phase 11: Combat Phase Implementation ✓ COMPLETED

**Objective**: Implement the Combat Phase for ship-to-ship combat.

**Components**:

#### 11.1: Weapon Systems Data ✓ COMPLETED
- Weapon types definition ✓
- Weapon properties (range, damage, accuracy) ✓
- Ship weapon inventory ✓
- Weapon state tracking ✓
- Ammunition management (deferred - basic weapons only for MVP)

**Testing & Verification**:
- Unit tests for weapon data ✓
- Tests for weapon properties ✓
- Tests for inventory management ✓

#### 11.2: Combat UI ✓ COMPLETED
- Attacking ship selection ✓
- Target selection interface ✓
- Weapon selection ✓
- Range and modifier display ✓
- Attack declaration ✓
- Combat resolution display ✓

**Testing & Verification**:
- Screenshot tests of Combat Phase UI (deferred - would require E2E tests)
- E2E tests for attack declaration (deferred to integration testing)
- Tests for target selection ✓
- Tests for UI feedback ✓

#### 11.3: Combat Resolution ✓ COMPLETED
- Range calculation ✓
- Hit probability calculation ✓
- Damage calculation ✓
- Damage application to hull ✓
- Ship destruction handling ✓
- Combat log generation ✓

**Testing & Verification**:
- Unit tests for all combat calculations ✓
- Tests for damage application ✓
- Tests for ship destruction ✓
- Integration tests for complete combat sequence ✓

#### 11.4: Combat Animation and Feedback (SIMPLIFIED FOR MVP)
- Weapon fire animation (deferred - instant combat for MVP)
- Hit/miss indication ✓ (via combat log)
- Damage display ✓ (via ship status)
- Ship destruction animation (deferred - instant for MVP)
- Combat log display ✓
- Status update visualization ✓ (via notifications and ship status)

**Note**: For the MVP, combat is resolved instantly when attacks are executed. The combat log provides textual feedback of all combat actions. Animation system can be added in future enhancement phases.

**Testing & Verification**:
- Visual tests of combat animations (deferred)
- Screenshot tests of combat effects (deferred)
- E2E tests for combat sequence (deferred)
- Tests for feedback clarity ✓

**Acceptance Criteria**:
- Ships can declare attacks ✓
- Targets can be selected ✓
- Range and modifiers are calculated ✓
- Hit/miss is determined ✓
- Damage is applied correctly ✓
- Ship destruction is handled ✓
- Combat feedback is clear ✓
- All tests pass ✓

**Status**: COMPLETED (animation deferred to post-MVP)

**Dependencies**: Phase 5, Phase 7, Phase 8

**Estimated Complexity**: High

---

### Phase 12: Maintenance Phase and Victory Conditions ✓ COMPLETED

**Objective**: Implement the Maintenance Phase and victory condition checking.

**Components**:

#### 12.1: Victory Condition System ✓ COMPLETED
- Victory condition data structure ✓
- Scenario-specific objectives ✓
- Victory evaluation logic ✓
- Victory state tracking ✓
- Winner determination ✓

**Testing & Verification**:
- Unit tests for victory conditions ✓
- Tests for different scenario types ✓
- Tests for victory evaluation ✓
- Tests for edge cases ✓

#### 12.2: Maintenance Phase Logic ✓ COMPLETED
- Victory condition check ✓
- Special situation resolution (deferred - not needed for MVP)
- Resource status updates (deferred - not needed for MVP)
- Turn end processing ✓
- Transition to next turn or victory ✓

**Testing & Verification**:
- Unit tests for maintenance logic ✓
- Tests for turn transitions ✓
- Integration tests for complete turn cycle ✓
- Tests for victory transitions ✓

#### 12.3: Maintenance Phase UI ✓ COMPLETED
- Victory status display ✓
- Special event notifications (handled via existing notification system) ✓
- Resource status display (deferred - not needed for MVP)
- End turn button ✓
- Victory screen (when conditions met) ✓

**Testing & Verification**:
- Screenshot tests of Maintenance UI (deferred - visual verification via manual testing)
- E2E tests for turn end (deferred - covered by existing turn management tests)
- Screenshot tests of victory screen (deferred - visual verification via manual testing)
- Tests for status displays ✓

**Acceptance Criteria**:
- Victory conditions are checked each turn ✓
- Maintenance phase completes correctly ✓
- Turn transitions to next player or ends game ✓
- Victory screen displays when game ends ✓
- All tests pass ✓

**Status**: COMPLETED

**Dependencies**: Phase 7, Phase 11

**Estimated Complexity**: Medium

---

### Phase 13: Scenario System

**Objective**: Implement support for multiple scenarios with different objectives and setups.

**Components**:

#### 13.1: Scenario Data Structure
- Scenario definitions
- Map configurations per scenario
- Initial ship placements
- Victory conditions per scenario
- Special rules per scenario

**Testing & Verification**:
- Unit tests for scenario data
- Tests for scenario validation
- Tests for different scenario types

#### 13.2: Scenario Selection UI
- Scenario list display
- Scenario details preview
- Scenario selection
- Scenario initialization
- Transition from config to scenario selection

**Testing & Verification**:
- Screenshot tests of scenario selection
- E2E tests for scenario selection flow
- Tests for scenario initialization

#### 13.3: Scenario Implementation
- Racing scenarios
- Combat scenarios
- Mixed objective scenarios
- Tutorial scenarios
- Checkpoint/gate implementation for racing

**Testing & Verification**:
- Integration tests for each scenario type
- E2E tests for complete scenario playthrough
- Tests for scenario-specific mechanics

**Acceptance Criteria**:
- Multiple scenarios are available
- Players can select scenarios
- Each scenario has correct setup
- Victory conditions match scenario type
- All scenario types work correctly
- All tests pass

**Dependencies**: Phase 12, Phase 1

**Estimated Complexity**: Medium

---

### Phase 14: Advanced Ship Features

**Objective**: Implement advanced ship systems and features.

**Components**:

#### 14.1: Ship Customization
- Ship template system
- Customizable ship attributes
- Point allocation system
- Ship specialization options
- Ship validation

**Testing & Verification**:
- Unit tests for customization system
- Tests for point allocation
- Tests for validation rules

#### 14.2: Special Systems
- Shield systems
- Sensor systems
- Cargo systems
- Docking systems
- System damage tracking

**Testing & Verification**:
- Unit tests for each system type
- Integration tests for system interaction
- Tests for system damage

#### 14.3: Docking Mechanics
- Docking initiation
- Velocity matching requirement
- Docking completion
- Refueling implementation
- Cargo transfer
- Repair implementation

**Testing & Verification**:
- Unit tests for docking logic
- E2E tests for docking sequence
- Tests for refuel/repair mechanics

**Acceptance Criteria**:
- Ships can be customized
- Special systems function correctly
- Docking works as designed
- Refueling and repairs work
- All tests pass

**Dependencies**: Phase 5, Phase 6

**Estimated Complexity**: High

---

### Phase 15: Game Polish and UX Improvements

**Objective**: Enhance the user experience with polish and quality-of-life features.

**Components**:

#### 15.1: UI Polish
- Improved visual styling
- Consistent color scheme
- Better font rendering
- Icon set for common actions
- Hover effects and tooltips
- Smooth transitions

**Testing & Verification**:
- Screenshot tests of all UI states
- Visual regression tests
- E2E tests for interactions

#### 15.2: Help and Tutorial System
- In-game help overlay
- Interactive tutorial scenario
- Rule reference accessible in-game
- Tooltips for UI elements
- Phase-specific help

**Testing & Verification**:
- E2E tests for help system
- Tests for tutorial completion
- Screenshot tests of help displays

#### 15.3: Quality of Life Features
- Undo/redo for Plot Phase
- Game state save/load
- Keyboard shortcuts
- Customizable controls
- Animation speed control
- Grid display options

**Testing & Verification**:
- Tests for undo/redo functionality
- Tests for save/load
- E2E tests for keyboard shortcuts
- Tests for customization

#### 15.4: Sound and Visual Effects
- Sound effects for actions
- Background music option
- Enhanced particle effects
- Screen shake for impacts
- Visual feedback for all actions

**Testing & Verification**:
- Tests for sound playback
- Visual tests for effects
- Tests for effect toggles

**Acceptance Criteria**:
- UI is polished and consistent
- Help system is accessible and useful
- Quality of life features work correctly
- Sound and effects enhance experience
- All tests pass

**Dependencies**: All previous phases

**Estimated Complexity**: Medium

---

### Phase 16: Performance Optimization

**Objective**: Optimize rendering and gameplay performance.

**Components**:

#### 16.1: Rendering Optimization
- Canvas rendering performance profiling
- Draw call reduction
- Offscreen canvas for static elements
- Sprite caching
- Efficient redraw strategies
- Level-of-detail rendering

**Testing & Verification**:
- Performance benchmarks
- Frame rate monitoring
- Stress tests with many ships
- Memory usage tests

#### 16.2: State Management Optimization
- Redux state structure optimization
- Selector memoization
- Action batching where appropriate
- Unnecessary re-render prevention
- State normalization

**Testing & Verification**:
- Performance tests for state updates
- Re-render count monitoring
- Tests for state consistency

#### 16.3: Asset Loading and Management
- Asset preloading
- Lazy loading for large assets
- Asset caching strategy
- Loading screen implementation
- Progress indication

**Testing & Verification**:
- Tests for loading performance
- Tests for cache effectiveness
- E2E tests for loading screens

**Acceptance Criteria**:
- Game runs smoothly at 60fps
- State updates are performant
- Assets load efficiently
- No memory leaks
- Performance metrics meet targets
- All tests pass

**Dependencies**: All previous phases

**Estimated Complexity**: Medium

---

### Phase 17: Multi-device Support

**Objective**: Ensure the game works well on various devices and screen sizes.

**Components**:

#### 17.1: Responsive Layout
- Dynamic canvas sizing
- Responsive UI element sizing
- Orientation change handling
- Different screen size layouts
- Minimum size constraints

**Testing & Verification**:
- Tests on various screen sizes
- Tests for orientation changes
- Screenshot tests at different resolutions

#### 17.2: Touch Optimization
- Touch gesture recognition
- Multi-touch support
- Touch target size optimization
- Touch feedback
- Touch vs mouse input handling

**Testing & Verification**:
- Touch interaction tests
- Gesture recognition tests
- Tests for touch targets

#### 17.3: Mobile Performance
- Mobile-specific optimizations
- Reduced visual effects on mobile
- Battery usage optimization
- Network optimization (for future online play)

**Testing & Verification**:
- Performance tests on mobile devices
- Battery usage monitoring
- Mobile-specific E2E tests

**Acceptance Criteria**:
- Game works on desktop and mobile
- Touch controls are responsive
- Performance is good on mobile
- UI adapts to screen size
- All tests pass

**Dependencies**: Phase 15, Phase 16

**Estimated Complexity**: Medium

---

### Phase 18: Campaign Mode

**Objective**: Implement campaign mode with linked scenarios and progression.

**Components**:

#### 18.1: Campaign Data Structure
- Campaign definition format
- Campaign progression tracking
- Persistent ship state between scenarios
- Victory points system
- Campaign save state

**Testing & Verification**:
- Unit tests for campaign data
- Tests for progression logic
- Tests for state persistence

#### 18.2: Ship Persistence and Upgrades
- Carry ship damage between missions
- Ship upgrade system
- Experience/skill system
- Resource accumulation
- Fleet management between missions

**Testing & Verification**:
- Tests for ship persistence
- Tests for upgrade application
- Tests for resource management

#### 18.3: Campaign UI
- Campaign map/progression display
- Mission briefing screens
- Post-mission summary
- Upgrade/repair interface
- Campaign status display

**Testing & Verification**:
- Screenshot tests of campaign UI
- E2E tests for campaign flow
- Tests for mission transitions

**Acceptance Criteria**:
- Campaign scenarios can be linked
- Ship state persists between missions
- Upgrades can be applied
- Campaign progression is tracked
- All tests pass

**Dependencies**: Phase 13, Phase 14

**Estimated Complexity**: High

---

### Phase 19: Testing and Quality Assurance

**Objective**: Comprehensive testing and bug fixing before release.

**Components**:

#### 19.1: Test Coverage Expansion
- Increase unit test coverage to >90%
- Comprehensive E2E test suite
- Edge case testing
- Error condition testing
- Integration test expansion

**Testing & Verification**:
- Code coverage metrics
- All tests passing
- No regressions found

#### 19.2: Bug Fixing
- Address all known bugs
- Fix issues found in testing
- Resolve edge cases
- Performance issue fixes
- UI/UX issue fixes

**Testing & Verification**:
- Bug tracking
- Regression tests for fixed bugs
- Verification of all fixes

#### 19.3: Cross-browser Testing
- Test in Chrome
- Test in Firefox
- Test in Safari
- Test in Edge
- Test on mobile browsers

**Testing & Verification**:
- Browser compatibility matrix
- Cross-browser E2E tests
- Visual consistency verification

#### 19.4: User Acceptance Testing
- Playtest sessions
- Usability testing
- Accessibility review
- Performance validation
- Collect and address feedback

**Testing & Verification**:
- UAT checklist completion
- Feedback incorporation
- Final acceptance sign-off

**Acceptance Criteria**:
- All tests pass on all browsers
- Test coverage exceeds 90%
- No critical or high-priority bugs
- UAT feedback addressed
- Game is ready for release

**Dependencies**: All previous phases

**Estimated Complexity**: High

---

### Phase 20: Documentation and Deployment

**Objective**: Complete documentation and deploy the game.

**Components**:

#### 20.1: User Documentation
- Complete game rules documentation
- How-to-play guide
- Tutorial walkthrough documentation
- FAQ
- Troubleshooting guide

**Testing & Verification**:
- Documentation review
- Accuracy verification
- Completeness check

#### 20.2: Developer Documentation
- Code documentation
- Architecture documentation
- API documentation (if applicable)
- Contributing guidelines
- Development setup guide

**Testing & Verification**:
- Documentation completeness
- Technical accuracy
- Code example verification

#### 20.3: Deployment Setup
- Production build optimization
- Deployment pipeline setup
- Hosting configuration
- Domain setup
- Analytics integration (if desired)

**Testing & Verification**:
- Production build testing
- Deployment verification
- Live site monitoring

#### 20.4: Release
- Version tagging
- Release notes
- Public announcement
- Monitor initial usage
- Address immediate issues

**Testing & Verification**:
- Release checklist completion
- Live site functionality
- User feedback monitoring

**Acceptance Criteria**:
- All documentation is complete
- Deployment is successful
- Game is publicly accessible
- No critical issues in production
- Release is announced

**Dependencies**: Phase 19

**Estimated Complexity**: Low

---

## Implementation Timeline Estimates

Based on a solo developer or small team:

- **Phase 1**: COMPLETED
- **Phase 2**: COMPLETED
- **Phase 3**: COMPLETED
- **Phase 4**: COMPLETED
- **Phase 5**: COMPLETED
- **Phase 6**: COMPLETED
- **Phase 7**: COMPLETED
- **Phase 8**: COMPLETED
- **Phase 9**: COMPLETED
- **Phase 10**: COMPLETED
- **Phase 11**: COMPLETED
- **Phase 12**: COMPLETED
- **Phase 13**: 1-2 weeks
- **Phase 14**: 2-3 weeks
- **Phase 15**: 2-3 weeks
- **Phase 16**: 1-2 weeks
- **Phase 17**: 1-2 weeks
- **Phase 18**: 2-3 weeks
- **Phase 19**: 2-3 weeks
- **Phase 20**: 1 week

**Total Estimated Timeline**: 6-9 months for complete implementation

## Critical Path

The critical path for core gameplay functionality:
1. Phase 1 (Foundation) ✓
2. Phase 2 (Game Board) ✓
3. Phase 3 (Celestial Bodies) ✓
4. Phase 4 (Ship Data) ✓
5. Phase 5 (Ship Rendering) ✓
6. Phase 6 (Physics) ✓
7. Phase 7 (Turn Management) ✓
8. Phase 8 (Plot Phase) ✓
9. Phase 9 (Movement Phase) ✓
10. Phase 11 (Combat Phase) ✓
11. Phase 12 (Victory Conditions) ✓

**The Minimum Viable Game (MVP) is now complete!**

These phases represent the minimum viable game that can be played.

## Parallel Development Opportunities

Some phases can be developed in parallel by different team members:
- Phase 3 (Celestial Bodies) can be done alongside Phase 4 (Ship Data)
- Phase 10 (Ordnance) can be done alongside Phase 11 (Combat)
- Phase 13 (Scenarios) can be started once Phase 12 is complete
- Phase 15 (Polish) can be incremental throughout development
- Phase 16 (Performance) can be addressed throughout development

## Risk Mitigation

**Technical Risks**:
- **Physics Complexity**: Phase 6 is the most complex; allocate extra time and consider using existing physics libraries
- **Performance**: Regular performance testing throughout development to catch issues early
- **Cross-browser Issues**: Test on multiple browsers from Phase 2 onwards

**Scope Risks**:
- **Feature Creep**: Stick to phase definitions; new features go into future phases
- **Timeline Slip**: Each phase has acceptance criteria; don't proceed until criteria are met
- **Over-engineering**: Focus on working functionality first, refactor later if needed

## Testing Strategy Summary

Each phase includes:
1. **Unit Tests**: For all logic and calculations
2. **Integration Tests**: For component interaction
3. **E2E Tests**: For user workflows
4. **Visual Tests**: Screenshot comparisons for UI
5. **Performance Tests**: Where applicable
6. **Manual Testing**: For gameplay feel and balance

## Success Metrics

For each phase:
- All tests passing
- Code review completed
- Acceptance criteria met
- No blocking bugs
- Documentation updated
- Demo/screenshot available

For the overall project:
- Playable game matching original Triplanetary rules
- Smooth 60fps performance
- >90% test coverage
- Works on desktop and mobile
- Positive user feedback

## Maintenance and Future Enhancements

Post-release phases (beyond scope of this plan):
- Online multiplayer
- AI opponents
- Additional scenarios
- Mod support
- Community features
- Advanced campaign modes
- Tournament mode

## Conclusion

This implementation plan provides a structured, testable path from the current foundation to a complete, polished Triplanetary game. Each phase builds incrementally on previous work, with clear acceptance criteria and independent verification. The modular approach allows for flexibility in scheduling and resource allocation while maintaining a clear path to completion.
