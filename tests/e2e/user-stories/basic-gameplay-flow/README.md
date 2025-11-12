# User Story: Basic Gameplay Flow

## Description
This user story demonstrates the basic flow of starting a game, plotting moves, and advancing through phases.

## Steps

### Step 1: Initial Configuration Screen
**Action:** Load the game for the first time  
**Expected:** The configuration screen appears with the game title and "Add Player" button  
**Screenshot:** `01-initial-config.png`

### Step 2: Add First Player
**Action:** Click the "Add Player" button  
**Expected:** First player appears with default blue color and name "Player 1"  
**Screenshot:** `02-player-added.png`

### Step 3: Add Second Player
**Action:** Click the "Add Player" button again  
**Expected:** Second player appears with orange color and name "Player 2"  
**Screenshot:** `03-two-players.png`

### Step 4: Start Game
**Action:** Click the "Start Game" button  
**Expected:** Game starts and transitions to gameplay screen showing the hex grid, celestial bodies, and ships placed at starting positions  
**Screenshot:** `04-game-started.png`

### Step 5: Plot Phase - Select Ship
**Action:** Click on the first player's ship  
**Expected:** Ship becomes selected, reachable hexes are highlighted showing possible moves  
**Screenshot:** `05-ship-selected.png`

### Step 6: Plot Phase - Ready to Plot
**Action:** Wait for UI to stabilize with ship selected  
**Expected:** Ship remains selected, UI is ready for plotting actions  
**Screenshot:** `06-ship-ready-to-plot.png`

### Step 7: Plot Phase - Deselect Ship
**Action:** Click on empty space to deselect the ship  
**Expected:** Ship is no longer selected  
**Screenshot:** `07-ship-deselected.png`

## Success Criteria
- All screenshots match expected screenshots within tolerance
- Game state transitions correctly through all phases
- User interactions work as expected
- No errors or crashes occur
