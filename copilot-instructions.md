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
The game follows a strict five-phase turn sequence:
1. **Plot Phase**: Players plan ship movements and thrust expenditure
2. **Ordnance Phase**: Launch mines, torpedoes, or nuclear weapons
3. **Movement Phase**: Ships move according to plotted velocities (automated with animations)
4. **Combat Phase**: Declare and resolve weapon attacks
5. **Maintenance Phase**: Check victory conditions and handle end-of-turn bookkeeping

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
- Players spend thrust points to modify velocity vectors
- Each thrust point shifts the velocity endpoint by one hex

### Gravity Simulation
- Celestial bodies exert gravitational influence during Movement Phase
- Gravity strength varies by zone (inner/middle/outer)
- Ships in incorrect orbits will fall toward or escape from planets
- See `src/physics/gravity.ts` for implementation

### Combat System
- Weapons have range limitations and hit probability calculations
- Damage reduces ship hull points
- Ships are destroyed at 0 hull points
- See `src/combat/` for combat logic

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
3. Add hit detection in `src/input/inputHandler.ts`
4. Wire up Redux action dispatch
5. Add E2E tests if user-facing

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

## Current Development Status

The project currently implements:
- ✅ Game configuration screen with player management
- ✅ Hexagonal grid rendering with celestial bodies
- ✅ Ship placement and rendering
- ✅ Turn management system (5-phase sequence)
- ✅ Plot phase with movement planning
- ✅ Movement phase with physics simulation
- ✅ Ordnance system (mines, torpedoes)
- ✅ Combat phase with weapon firing
- ✅ Victory condition evaluation
- ✅ Comprehensive test coverage (500+ tests)

## When Contributing

1. **Read the design docs first**: DESIGN.md and CODE_STRUCTURE.md explain the architecture
2. **Run tests before and after changes**: Ensure you don't break existing functionality
3. **Follow existing patterns**: Look at similar code for style and structure guidance
4. **Keep changes focused**: One feature or fix per change
5. **Write tests**: All new logic should have unit tests
6. **Update documentation**: If you change behavior, update relevant docs

## Build Artifacts

The following are generated and should not be committed:
- `node_modules/`: Dependencies (use `npm install`)
- `dist/`: Production build output
- `.vite/`: Vite cache
- Test screenshots in `tests/e2e/screenshots/` (generated by E2E tests)

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
- Review the original game rules (RULES.md, 2018rules.pdf)
- Look at test files for usage examples
- Examine Redux state structure in `src/redux/types.ts`

## Legal Notice

Triplanetary is a trademark of Game Designers' Workshop. This is a fan project not affiliated with or endorsed by the original publishers. Created for educational and entertainment purposes.

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
