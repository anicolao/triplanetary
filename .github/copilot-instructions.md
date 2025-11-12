# Copilot Instructions for Triplanetary

## Project Overview

Triplanetary is a web-based implementation of the classic 1973 science fiction board game by Game Designers' Workshop (GDW). The game features tactical space combat and racing with realistic Newtonian physics and orbital mechanics in the inner solar system.

## Technology Stack

- **TypeScript**: Type-safe game logic and rendering (strict mode enabled)
- **HTML5 Canvas**: All UI rendering (no HTML/CSS UI components)
- **Redux**: State management for game configuration and gameplay
- **Vite**: Build tool and development server
- **Vitest**: Unit testing framework
- **Playwright**: End-to-end testing

## Project Structure

```
triplanetary/
├── src/
│   ├── celestial/         # Celestial bodies and scenarios
│   ├── combat/            # Combat system logic
│   ├── hex/               # Hexagonal grid utilities
│   ├── input/             # User input handling (mouse/touch)
│   ├── ordnance/          # Ordnance types and lifecycle
│   ├── physics/           # Movement, gravity, vectors
│   ├── redux/             # State management (actions, reducers, store)
│   ├── rendering/         # Canvas rendering for all UI
│   ├── ship/              # Ship types, placement, management
│   ├── victory/           # Victory condition evaluation
│   └── main.ts            # Application entry point
├── tests/                 # Unit and E2E tests
├── public/                # Static assets
└── index.html             # HTML entry point (minimal)
```

## Getting Started

### Setup
```bash
npm install              # Install dependencies
npm run dev              # Start development server (http://localhost:5173)
```

### Building and Testing
```bash
npm run build            # Build for production (TypeScript compile + Vite build)
npm test                 # Run unit tests with Vitest
npm run test:ui          # Run tests with UI
npm run test:e2e         # Run Playwright E2E tests
```

## Architecture and Design Patterns

### Canvas-Based UI
- **Everything is rendered on HTML5 Canvas** - no HTML/CSS UI elements
- All buttons, text, and graphics are painted via TypeScript rendering functions
- See `src/rendering/` for all rendering logic

### Redux State Management
- **Single source of truth**: All application state lives in Redux store
- **Unidirectional data flow**: User interactions → Actions → Reducers → State → Re-render
- **Pure reducers**: State transformations are predictable and testable
- See `src/redux/` for state structure, actions, and reducers

### Hit Detection
- Since UI is canvas-based, `src/input/inputHandler.ts` performs coordinate-based hit detection
- Input handler maps click coordinates to UI elements and dispatches Redux actions

### Physics Simulation
- **Newtonian physics**: Ships maintain velocity vectors that persist turn-to-turn
- **Gravity effects**: Celestial bodies influence ship trajectories
- **Thrust system**: Limited thrust points for velocity modifications
- See `src/physics/` for movement, gravity, and vector calculations

### Turn-Based Game Loop
The game follows a strict five-phase turn sequence (per official 2018 rules):
1. **Astrogation Phase**: Players plot predicted courses and plan thrust modifications
2. **Ordnance Phase**: Launch mines, torpedoes, or nuclear weapons
3. **Movement Phase**: Ships move according to plotted velocities (automated with animations), gravity effects applied
4. **Combat Phase**: Declare and resolve weapon attacks
5. **Resupply Phase**: Refuel, transfer cargo, loot ships, and recover 1 D damage level

## Key Design Principles

### Minimal Changes Philosophy
- Make surgical, focused changes to accomplish specific goals
- Avoid refactoring working code unless necessary
- Preserve existing behavior and test coverage

### Type Safety
- Use TypeScript strict mode throughout
- Define clear interfaces and types for all data structures
- Avoid `any` types - be explicit with types

### Functional Programming
- Prefer pure functions where possible
- Immutable state updates in Redux reducers
- Avoid side effects in core logic

### Testing Strategy
- **Unit tests**: Redux reducers, physics calculations, utility functions
- **Integration tests**: Full user workflows with Playwright
- **Touch tests**: All interactive UI elements must have E2E tests using Playwright's `page.touchscreen.tap()` API
- Test files mirror source structure (e.g., `src/physics/gravity.ts` → `tests/gravity.test.ts`)
- All tests should pass before committing changes

### Color-Blind Accessibility
The game uses a scientifically validated 6-color palette:
1. Blue (#0173B2)
2. Orange (#DE8F05)
3. Green (#029E73)
4. Yellow (#ECE133)
5. Purple (#CC78BC)
6. Red (#CA5127)

Maintain this palette for player colors to ensure accessibility.

## Code Style and Conventions

### File Organization
- One primary responsibility per file
- Related functionality grouped in directories
- Export public APIs via index files (e.g., `src/physics/index.ts`)

### Naming Conventions
- **Types/Interfaces**: PascalCase (e.g., `GameState`, `Ship`, `HexCoordinate`)
- **Functions/Variables**: camelCase (e.g., `calculateGravity`, `moveShip`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PLAYERS`, `DEFAULT_THRUST`)
- **Files**: kebab-case (e.g., `movement-execution.ts`, `ship-renderer.ts`)

### Comments
- Use comments for complex algorithms and non-obvious logic
- Avoid obvious comments that restate the code
- Document public APIs and complex interfaces
- Follow existing comment style in each file

### Canvas Rendering Patterns
```typescript
// Typical rendering function structure
export function renderElement(
  ctx: CanvasRenderingContext2D,
  element: ElementData,
  layout: LayoutInfo
): void {
  // Save context state
  ctx.save();
  
  // Apply transformations if needed
  // Draw element
  
  // Restore context state
  ctx.restore();
}
```

### Touch Support Requirements
**All UI/UX implementations MUST support touch interactions:**
- **Touch events**: Implement `touchstart`, `touchend`, `touchmove`, and `touchcancel` handlers
- **Event prevention**: Prevent default browser behaviors (scrolling, zooming) on touch events within the game canvas
- **Unified handling**: Touch and mouse events should trigger the same game actions
- **Testing**: All new UI elements MUST include E2E tests for touch interactions
- **Accessibility**: Touch targets should be appropriately sized for finger interaction (minimum 44x44 pixels recommended)
- **No mouse-only features**: Never implement features that only work with mouse input

### Redux Patterns
```typescript
// Action creator
export function actionName(payload: PayloadType): ActionType {
  return { type: ACTION_CONSTANT, payload };
}

// Reducer case
case ACTION_CONSTANT:
  return {
    ...state,
    property: action.payload,
  };
```

## Game Rules and Physics

### Movement System
- Ships have velocity vectors represented as hex-based direction and magnitude
- Velocity persists turn-to-turn (momentum conservation)
- Players spend thrust points (fuel) to modify velocity vectors
- Each thrust point shifts the velocity endpoint by one hex
- Ships may burn up to 1 fuel point per turn (2 with overload maneuver)

### Ship Types
The game features 9 official ship types plus Orbital Bases:

**Civilian Ships:**
- **Transport** (1D defense, 10 fuel, 50 ton cargo, 10 MCr)
- **Tanker** (1D defense, 50 fuel, 0 cargo, 10 MCr)
- **Liner** (2D defense, 10 fuel, 0 cargo, 50 MCr)
- **Packet** (2 combat, 10 fuel, 50 ton cargo, 20 MCr)

**Military Ships:**
- **Corvette** (2 combat, 20 fuel, 5 ton cargo, 40 MCr)
- **Corsair** (4 combat, 20 fuel, 10 ton cargo, 80 MCr)
- **Frigate** (8 combat, 20 fuel, 40 ton cargo, 150 MCr)
- **Dreadnaught** (15 combat, 15 fuel, 50 ton cargo, 600 MCr) - note spelling
- **Torchship** (8 combat, unlimited fuel, 10 ton cargo, 400 MCr)

**Orbital Base** (16 combat, unlimited fuel/cargo, 1000 MCr)

Ships with "D" suffix (1D, 2D) are defensive only and cannot attack. See RULES.md for complete specifications.

### Gravity Simulation
Per official 2018 rules, gravity uses a **discrete hex-based system**:
- Gravity is represented by **arrows in hexes adjacent to celestial bodies**
- Each gravity hex applies **one hex of acceleration in the arrow direction**
- Gravity takes effect **on the turn after** entering the gravity hex (one-turn delay)
- Gravity is **cumulative and mandatory** - multiple gravity hexes apply in sequence
- Gravity hexes are discrete full-hex effects (not gradual force zones)
- Luna and Io have weak gravity (player choice to use or ignore)
- A ship moving one hex per turn between adjacent gravity hexes is in orbit

**Note:** Current implementation may use continuous force model with zones. Per PR#28 and IMPLEMENTATION_PLAN.md, this needs correction to match the official discrete hex-by-hex arrow system where each gravity hex shifts the ship's endpoint by exactly one hex in the arrow's direction after a one-turn delay.

### Combat System
Gun combat uses odds-based damage tables:
- Combat odds calculated as attacker:defender strength ratio (1:4, 1:2, 1:1, 2:1, 3:1, 4:1)
- Range modifier: subtract range in hexes from die roll
- Relative velocity modifier: subtract 1 per hex of velocity difference greater than 2
- Damage levels: D1-D5 (disabled 1-5 turns), E (eliminated/destroyed)
- Cumulative damage: D6+ results in ship destruction
- Ships recover 1 D level per turn automatically
- Disabled ships cannot maneuver, launch ordnance, or attack (exception: Dreadnaughts can fire when disabled)
- See `src/combat/` for combat logic and Gun Combat Damage Table

### Ordnance System
Three types of ordnance are available:

**Mines** (10 MCr, 10 tons):
- Assume launching ship's vector
- Active for 5 turns, then self-destruct
- Detonate when ship or ordnance enters their hex
- Use Other Damage Table for effects

**Torpedoes** (20 MCr, 20 tons):
- Can accelerate 1-2 hexes on launch turn only
- Active for 5 turns, then self-destruct
- Hit single target per hex
- Only warships may launch torpedoes

**Nukes** (300 MCr, 20 tons):
- Destroy everything in hex automatically
- Devastate planetary hex sides
- Active for 5 turns
- Scenario-dependent availability

See RULES.md for complete ordnance rules and damage tables.

### Official Scenarios
The 2018 rules include several official scenarios:
- **Bi-Planetary**: Learning scenario - navigate from one planet to another
- **Grand Tour**: Multi-player race through the solar system
- **Escape**: Pilgrims vs Enforcers pursuit scenario
- **Lateral 7**: Liner escort and piracy scenario
- **Piracy**: Long-form 3-player campaign with Patrol, Merchants, and Pirates

See RULES.md for complete scenario rules, victory conditions, and special rules.

## Common Tasks

### Adding a New Redux Action
1. Add action type constant in `src/redux/actions.ts`
2. Define action interface
3. Add to `GameAction` union type
4. Create action creator function
5. Add case to reducer in `src/redux/reducer.ts`
6. Write unit tests in `tests/reducer.test.ts`

### Adding a New UI Element
1. Define layout calculations in `src/rendering/layout.ts`
2. Add rendering function in appropriate renderer file
3. Add hit detection in `src/input/inputHandler.ts` for both mouse and touch
4. Wire up Redux action dispatch
5. **REQUIRED**: Add E2E tests for both mouse clicks and touch interactions
6. Verify touch targets are appropriately sized (minimum 44x44 pixels)

### Adding Physics Calculations
1. Implement pure functions in `src/physics/`
2. Maintain Newtonian physics principles
3. Use hex-based coordinate system
4. Write comprehensive unit tests
5. Ensure calculations are deterministic

## Testing Guidelines

### Unit Tests (Vitest)
- Test pure functions in isolation
- Mock external dependencies
- Cover edge cases and error conditions
- Use descriptive test names: `describe('Feature', () => { it('should behave correctly when...', () => {}) })`

### E2E Tests (Playwright)
- Test complete user workflows
- Capture screenshots for visual verification
- Test on actual rendered UI
- See `tests/e2e/` for examples

### Running Specific Tests
```bash
npm test -- gravity.test.ts           # Run specific test file
npm test -- --watch                   # Watch mode
npm run test:e2e -- --headed          # E2E with visible browser
```

### User Story Tests (REQUIRED for Gameplay Changes)
**CRITICAL: Every modification to gameplay MUST be tested in a user story test.**

User story tests are comprehensive E2E tests that validate complete user workflows with visual verification:

#### Purpose
- Document user journeys through the game
- Validate both functionality and visual appearance
- Catch regressions in gameplay and UI
- Provide visual documentation of features

#### Structure
Each user story lives in `tests/e2e/user-stories/<story-name>/`:
- `README.md`: Describes each step with expected results and screenshot names
- `<story-name>.spec.ts`: Playwright test that captures screenshots at each step
- `expected/`: Baseline screenshots for comparison
- `actual/`: Generated screenshots (gitignored, created during test runs)

#### Creating a User Story
1. **Create directory structure:**
   ```bash
   mkdir -p tests/e2e/user-stories/my-feature/{expected,actual}
   ```

2. **Write README.md** documenting each step:
   ```markdown
   # User Story: My Feature
   
   ## Step 1: Initial Action
   **Action:** What the user does
   **Expected:** What should happen
   **Screenshot:** `01-step-name.png`
   ```

3. **Write test spec** with screenshots:
   ```typescript
   import { test } from '@playwright/test';
   import { gotoWithTestMode, clickButton } from '../../helpers';
   
   const STORY_PATH = 'tests/e2e/user-stories/my-feature';
   
   test('should complete workflow', async ({ page }) => {
     await gotoWithTestMode(page);
     await page.screenshot({ path: `${STORY_PATH}/actual/01-step.png` });
     // ... more steps with screenshots
   });
   ```

4. **Generate baseline screenshots:**
   ```bash
   npm run test:e2e -- tests/e2e/user-stories/my-feature
   # Review actual/ screenshots
   cp tests/e2e/user-stories/my-feature/actual/*.png \
      tests/e2e/user-stories/my-feature/expected/
   git add tests/e2e/user-stories/my-feature/expected/
   ```

#### When to Create User Stories
- **REQUIRED**: Any gameplay change (movement, combat, phases, etc.)
- **REQUIRED**: New UI features or interactions
- **REQUIRED**: Bug fixes that affect user workflows
- **RECOMMENDED**: Major refactorings to verify behavior unchanged

#### Pre-commit Hook
The project uses a pre-commit hook that runs user story tests:
```bash
./scripts/install-hooks.sh  # Install the hook
```

The hook will:
- Run all user story tests before each commit
- Compare screenshots with baselines
- Block commit if tests fail or screenshots differ
- Allow commits on first run (no baseline yet)

To skip temporarily: `git commit --no-verify`

#### Screenshot Best Practices
- Use numbered prefixes: `01-initial.png`, `02-action.png`
- Add waits after actions: `await page.waitForTimeout(200)`
- Capture at stable points (no animations)
- Use `fullPage: false` for consistency
- Document what each screenshot shows in README.md

#### Updating Baselines
When intentional changes affect screenshots:
```bash
npm run test:e2e -- tests/e2e/user-stories
# Review changes in actual/ directories
# If correct, update expected/:
cp tests/e2e/user-stories/*/actual/*.png \
   tests/e2e/user-stories/*/expected/
git add tests/e2e/user-stories/*/expected/
git commit -m "Update user story baselines for [change description]"
```

**See `tests/e2e/USER_STORIES.md` for complete documentation.**

## Important Files to Understand

### Core Application
- `src/main.ts`: Application entry point, render loop setup
- `src/redux/types.ts`: Complete state structure definition
- `src/redux/reducer.ts`: All state transformations

### Game Logic
- `src/physics/movement.ts`: Core movement mechanics
- `src/physics/gravity.ts`: Gravitational effects
- `src/ship/types.ts`: Ship data structures
- `src/victory/evaluation.ts`: Win condition checking

### Rendering
- `src/rendering/renderer.ts`: Main render coordinator
- `src/rendering/layout.ts`: UI layout calculations
- `src/rendering/shipRenderer.ts`: Ship visualization

### Input Handling
- `src/input/inputHandler.ts`: Mouse/touch event processing and hit detection

## Documentation References

- **README.md**: Getting started, project overview
- **DESIGN.md**: Detailed design specifications for all screens and game phases
- **CODE_STRUCTURE.md**: Directory organization and module responsibilities
- **RULES.md**: Complete game rules from original Triplanetary
- **IMPLEMENTATION_PLAN.md**: Development roadmap and milestones
- **tests/e2e/README.md**: E2E test automation API guide
- **tests/e2e/USER_STORIES.md**: User story testing system documentation

## Current Development Status

The project currently implements:
- ✅ Game configuration screen with player management
- ✅ Hexagonal grid rendering with celestial bodies
- ✅ Ship placement and rendering
- ✅ Turn management system (5-phase sequence)
- ✅ Astrogation phase with movement planning (predicted courses and thrust modifications)
- ✅ Movement phase with physics simulation
- ✅ Ordnance system (mines, torpedoes)
- ✅ Combat phase with weapon firing
- ✅ Resupply phase for refueling and damage recovery
- ✅ Victory condition evaluation
- ✅ Comprehensive test coverage (500+ tests)

## When Contributing

1. **Read the design docs first**: DESIGN.md and CODE_STRUCTURE.md explain the architecture
2. **Run tests before and after changes**: Ensure you don't break existing functionality
3. **Follow existing patterns**: Look at similar code for style and structure guidance
4. **Keep changes focused**: One feature or fix per change
5. **Write tests**: All new logic should have unit tests
6. **Touch support is mandatory**: All UI/UX changes MUST include touch event support and corresponding E2E tests
7. **User story tests REQUIRED for gameplay changes**: Every modification to gameplay MUST include or update a user story test (see User Story Tests section)
8. **Update documentation**: If you change behavior, update relevant docs
9. **Verify screenshots**: When providing screenshots in PR comments, always verify they match the description given. Screenshots should clearly show the specific feature or UI being described.
10. **Install git hooks**: Run `./scripts/install-hooks.sh` to enable pre-commit validation

## Build Artifacts

The following are generated and should not be committed:
- `node_modules/`: Dependencies (use `npm install`)
- `dist/`: Production build output
- `.vite/`: Vite cache
- Test screenshots in `tests/e2e/screenshots/` (generated by E2E tests)
- User story actual screenshots in `tests/e2e/user-stories/*/actual/` (gitignored)

## Performance Considerations

- Canvas rendering is CPU-intensive - minimize redraws
- Only re-render when Redux state changes
- Use `requestAnimationFrame` for smooth animations
- Cache complex calculations when possible
- Profile with browser DevTools before optimizing

## Debugging Tips

### Redux DevTools
The project includes Redux DevTools integration. Use the browser extension to:
- Inspect current state
- Time-travel through state changes
- Track action dispatch history

### Canvas Debugging
- Use `console.log` in rendering functions to trace execution
- Draw debug information directly on canvas (hit boxes, coordinates, etc.)
- Use browser's canvas inspector tools

### Test Debugging
```bash
npm test -- --reporter=verbose        # Detailed test output
npm run test:ui                       # Visual test runner
npm run test:e2e -- --debug           # Playwright debug mode
```

## Common Pitfalls to Avoid

1. **Mutating Redux state directly**: Always return new objects from reducers
2. **Forgetting canvas save/restore**: Can cause unexpected rendering state
3. **Hardcoded coordinates**: Use layout calculations for responsive design
4. **Missing hit detection**: New UI elements need click handling
5. **Breaking Newtonian physics**: Maintain momentum conservation in physics code
6. **Ignoring color-blind palette**: Only use the approved 6 colors for players
7. **Skipping tests**: All logic changes should have test coverage

## Getting Help

- Check existing code for similar functionality
- Read the design docs (DESIGN.md, CODE_STRUCTURE.md)
- Review the original game rules (RULES.md, reference/2018rules.pdf)
- Look at test files for usage examples
- Examine Redux state structure in `src/redux/types.ts`

## Legal Notice

Triplanetary is a trademark of Game Designers' Workshop. This is a fan project not affiliated with or endorsed by the original publishers. Created for educational and entertainment purposes.

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
