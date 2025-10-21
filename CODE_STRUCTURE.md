# Code Structure

This document describes the organization of the Triplanetary codebase.

## Directory Structure

```
triplanetary/
├── src/
│   ├── redux/           # State management
│   │   ├── types.ts     # Type definitions for state
│   │   ├── actions.ts   # Action types and action creators
│   │   ├── reducer.ts   # Redux reducer
│   │   └── store.ts     # Redux store configuration
│   ├── rendering/       # Canvas rendering
│   │   ├── layout.ts    # UI layout calculations
│   │   └── renderer.ts  # Canvas rendering functions
│   ├── input/           # User input handling
│   │   └── inputHandler.ts  # Click/touch event handling
│   └── main.ts          # Application entry point
├── tests/
│   ├── reducer.test.ts  # Unit tests for Redux reducer
│   └── e2e/             # End-to-end tests and screenshots
│       ├── configuration.spec.ts
│       └── screenshots/
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vitest.config.ts     # Vitest test configuration
└── playwright.config.ts # Playwright E2E test configuration

## Module Responsibilities

### Redux State Management (`src/redux/`)

- **types.ts**: Defines the application state structure, player objects, and constants
- **actions.ts**: Action types and action creators for state mutations
- **reducer.ts**: Pure functions that handle state transitions
- **store.ts**: Redux store creation and configuration

### Rendering (`src/rendering/`)

- **layout.ts**: Calculates UI element positions based on canvas size and state
- **renderer.ts**: Draws UI elements onto the canvas using 2D context

### Input Handling (`src/input/`)

- **inputHandler.ts**: Captures mouse/touch events, performs hit detection, and dispatches Redux actions

### Main Application (`src/main.ts`)

- Initializes the canvas, renderer, and input handler
- Sets up the Redux store subscription
- Manages the main render loop

## Data Flow

1. User interacts with canvas (click/touch)
2. InputHandler detects which UI element was clicked
3. InputHandler dispatches appropriate Redux action
4. Redux reducer updates state
5. Store notifies subscribers of state change
6. Main render function is called
7. Renderer paints new state to canvas

## Key Design Patterns

### Redux Pattern
All state changes go through Redux actions and reducers, ensuring predictable state management.

### Canvas Rendering
Everything is rendered directly to a single canvas element. No HTML UI elements are used for the game interface.

### Hit Detection
Since there are no HTML elements to click, the input handler maintains a map of clickable regions based on the current layout and checks mouse coordinates against these regions.

### Responsive Design
Layout calculations are proportional to canvas dimensions, making the UI adapt to different screen sizes.

## Testing Strategy

### Unit Tests (Vitest)
- Test Redux reducers in isolation
- Verify state transitions for all actions
- Test edge cases (max players, non-existent IDs, etc.)

### Integration Tests (Playwright)
- Test full user workflows
- Capture screenshots for visual verification
- Verify UI state after interactions

## Building and Running

### Development
```bash
npm run dev        # Start dev server with hot reload
```

### Production
```bash
npm run build      # Build for production (TypeScript + Vite)
npm run preview    # Preview production build
```

### Testing
```bash
npm test           # Run unit tests
npm run test:ui    # Run unit tests with UI
npm run test:e2e   # Run E2E tests (requires Playwright browsers)
```

## Adding New Features

### Adding a New Redux Action

1. Add action type constant in `src/redux/actions.ts`
2. Define action interface in `src/redux/actions.ts`
3. Add action to `GameAction` union type
4. Create action creator function
5. Add case to reducer in `src/redux/reducer.ts`
6. Write unit tests in `tests/reducer.test.ts`

### Adding New UI Elements

1. Define element structure in `src/rendering/layout.ts`
2. Add layout calculation logic in `calculateLayout()`
3. Add rendering function in `src/rendering/renderer.ts`
4. Add hit detection in `src/input/inputHandler.ts`
5. Wire up to Redux action dispatch

## Code Style

- Use TypeScript strict mode
- Follow functional programming principles where possible
- Keep functions small and focused
- Use descriptive variable names
- Document complex algorithms with comments
- Maintain type safety throughout
