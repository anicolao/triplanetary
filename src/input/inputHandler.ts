// Input handling and hit detection

import { UILayout, Button } from '../rendering/layout';
import { PLAYER_COLORS, GamePhase } from '../redux/types';
import { Renderer } from '../rendering/renderer';
import { store } from '../redux/store';
import {
  addPlayer,
  removePlayer,
  changePlayerColor,
  startGame,
  selectShip,
  selectNextShip,
  selectPreviousShip,
  plotShipMove,
  toggleReachableHexes,
  nextPhase,
  nextTurn,
  launchOrdnance,
  updateShipOrdnance,
  toggleMapLayout,
  toggleMapManipulation,
  resetViewport,
  setViewportPan,
  setViewportZoom,
} from '../redux/actions';
import { pixelToHex } from '../hex/operations';
import { HexLayout } from '../hex/types';
import { createOrdnance, generateOrdnanceId, OrdnanceType } from '../ordnance/types';

export class InputHandler {
  private renderer: Renderer;
  private currentLayout: UILayout | null = null;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private lastTouchDistance: number = 0;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.setupEventListeners();
  }

  setCurrentLayout(layout: UILayout): void {
    this.currentLayout = layout;
  }

  getCurrentLayout(): UILayout | null {
    return this.currentLayout;
  }

  private setupEventListeners(): void {
    const canvas = this.renderer.getCanvas();

    // Mouse events
    canvas.addEventListener('click', (event) => {
      const state = store.getState();
      // Only handle clicks if not in manipulation mode or if not dragged
      if (!state.viewport.manipulationEnabled || !this.isDragging) {
        this.handleClick(event.clientX, event.clientY);
      }
    });

    // Mouse wheel for zooming
    canvas.addEventListener('wheel', (event) => {
      const state = store.getState();
      if (state.viewport.manipulationEnabled && state.screen === 'gameplay') {
        event.preventDefault();
        const delta = -event.deltaY * 0.001;
        const newZoom = state.viewport.zoom * (1 + delta);
        store.dispatch(setViewportZoom(newZoom));
      }
    }, { passive: false });

    // Mouse drag for panning
    canvas.addEventListener('mousedown', (event) => {
      const state = store.getState();
      if (state.viewport.manipulationEnabled && state.screen === 'gameplay') {
        this.isDragging = true;
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
      }
    });

    canvas.addEventListener('mousemove', (event) => {
      const state = store.getState();
      if (this.isDragging && state.viewport.manipulationEnabled && state.screen === 'gameplay') {
        const dx = event.clientX - this.dragStartX;
        const dy = event.clientY - this.dragStartY;
        store.dispatch(setViewportPan(
          state.viewport.offsetX + dx,
          state.viewport.offsetY + dy
        ));
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
      }
    });

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });

    // Touch events - comprehensive support
    canvas.addEventListener('touchstart', (event) => {
      const state = store.getState();
      
      if (state.viewport.manipulationEnabled && state.screen === 'gameplay') {
        if (event.touches.length === 1) {
          // Single touch - start panning
          const touch = event.touches[0];
          this.isDragging = true;
          this.dragStartX = touch.clientX;
          this.dragStartY = touch.clientY;
        } else if (event.touches.length === 2) {
          // Two finger touch - prepare for pinch zoom
          const touch1 = event.touches[0];
          const touch2 = event.touches[1];
          const dx = touch2.clientX - touch1.clientX;
          const dy = touch2.clientY - touch1.clientY;
          this.lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
          this.isDragging = false;
        }
        event.preventDefault();
      } else if (event.touches.length > 0) {
        const touch = event.touches[0];
        this.handleClick(touch.clientX, touch.clientY);
        event.preventDefault();
      }
    });

    canvas.addEventListener('touchmove', (event) => {
      const state = store.getState();
      
      if (state.viewport.manipulationEnabled && state.screen === 'gameplay') {
        if (event.touches.length === 1 && this.isDragging) {
          // Single touch - panning
          const touch = event.touches[0];
          const dx = touch.clientX - this.dragStartX;
          const dy = touch.clientY - this.dragStartY;
          store.dispatch(setViewportPan(
            state.viewport.offsetX + dx,
            state.viewport.offsetY + dy
          ));
          this.dragStartX = touch.clientX;
          this.dragStartY = touch.clientY;
        } else if (event.touches.length === 2) {
          // Two finger touch - pinch zoom
          const touch1 = event.touches[0];
          const touch2 = event.touches[1];
          const dx = touch2.clientX - touch1.clientX;
          const dy = touch2.clientY - touch1.clientY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (this.lastTouchDistance > 0) {
            const scale = distance / this.lastTouchDistance;
            const newZoom = state.viewport.zoom * scale;
            store.dispatch(setViewportZoom(newZoom));
          }
          
          this.lastTouchDistance = distance;
        }
        event.preventDefault();
      } else {
        // Prevent scrolling and zooming while touching the game canvas
        event.preventDefault();
      }
    });

    canvas.addEventListener('touchend', (event) => {
      this.isDragging = false;
      this.lastTouchDistance = 0;
      event.preventDefault();
    });

    canvas.addEventListener('touchcancel', (event) => {
      this.isDragging = false;
      this.lastTouchDistance = 0;
      event.preventDefault();
    });

    // Keyboard events for panning and zooming
    window.addEventListener('keydown', (event) => {
      const state = store.getState();
      if (state.viewport.manipulationEnabled && state.screen === 'gameplay') {
        const panAmount = 50; // pixels
        let handled = false;
        
        switch (event.key) {
          case 'ArrowUp':
            store.dispatch(setViewportPan(state.viewport.offsetX, state.viewport.offsetY + panAmount));
            handled = true;
            break;
          case 'ArrowDown':
            store.dispatch(setViewportPan(state.viewport.offsetX, state.viewport.offsetY - panAmount));
            handled = true;
            break;
          case 'ArrowLeft':
            store.dispatch(setViewportPan(state.viewport.offsetX + panAmount, state.viewport.offsetY));
            handled = true;
            break;
          case 'ArrowRight':
            store.dispatch(setViewportPan(state.viewport.offsetX - panAmount, state.viewport.offsetY));
            handled = true;
            break;
          case '+':
          case '=':
            store.dispatch(setViewportZoom(state.viewport.zoom * 1.1));
            handled = true;
            break;
          case '-':
          case '_':
            store.dispatch(setViewportZoom(state.viewport.zoom * 0.9));
            handled = true;
            break;
        }
        
        if (handled) {
          event.preventDefault();
        }
      }
    });
  }

  private handleClick(clientX: number, clientY: number): void {
    if (!this.currentLayout) return;

    const canvas = this.renderer.getCanvas();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const state = store.getState();

    // Check if color picker is visible
    if (this.currentLayout.colorPicker?.visible) {
      this.handleColorPickerClick(x, y);
      return;
    }

    // Handle gameplay screen clicks
    if (state.screen === 'gameplay') {
      this.handleGameplayClick(x, y);
      return;
    }

    // Handle configuration screen clicks
    // Check for button clicks
    if (this.isPointInButton(x, y, this.currentLayout.addPlayerButton)) {
      if (this.currentLayout.addPlayerButton.enabled) {
        store.dispatch(addPlayer());
      }
      return;
    }

    if (this.isPointInButton(x, y, this.currentLayout.startGameButton)) {
      if (this.currentLayout.startGameButton.enabled) {
        store.dispatch(startGame());
      }
      return;
    }

    // Check for remove button clicks
    for (const entry of this.currentLayout.playerEntries) {
      if (this.isPointInButton(x, y, entry.removeButton)) {
        if (entry.removeButton.playerId) {
          store.dispatch(removePlayer(entry.removeButton.playerId));
        }
        return;
      }
    }

    // Check for color icon clicks
    for (const entry of this.currentLayout.playerEntries) {
      if (
        this.isPointInRect(
          x,
          y,
          entry.colorIconX,
          entry.colorIconY,
          entry.colorIconSize,
          entry.colorIconSize
        )
      ) {
        this.renderer.showColorPicker(entry.player.id);
        return;
      }
    }
  }

  private handleGameplayClick(x: number, y: number): void {
    const state = store.getState();
    const turnUI = this.renderer.getTurnUILayout();
    const plotUI = this.renderer.getCurrentPlotUIElements();
    const ordnanceUI = this.renderer.getCurrentOrdnanceUIElements();
    const shipNavButtons = this.renderer.getShipNavButtons();

    // Check for ship navigation button clicks if in Plot phase
    if (state.currentPhase === GamePhase.Plot && shipNavButtons) {
      // Check previous button
      if (shipNavButtons.previousButton && shipNavButtons.previousButton.visible) {
        const btn = shipNavButtons.previousButton;
        if (this.isPointInRect(x, y, btn.x, btn.y, btn.width, btn.height)) {
          store.dispatch(selectPreviousShip());
          return;
        }
      }

      // Check next/confirm button
      if (shipNavButtons.nextButton) {
        const btn = shipNavButtons.nextButton;
        if (this.isPointInRect(x, y, btn.x, btn.y, btn.width, btn.height)) {
          if (btn.isCheckmark) {
            // This is the last ship, move to next phase
            store.dispatch(selectShip(null));
            store.dispatch(nextPhase());
          } else {
            // Move to next ship
            store.dispatch(selectNextShip());
          }
          return;
        }
      }
    }

    // Check for Turn UI button clicks if available
    if (turnUI) {
      const button = turnUI.nextPhaseButton;
      if (this.isPointInRect(x, y, button.x, button.y, button.width, button.height)) {
        // Only dispatch action if button is enabled
        if (button.enabled) {
          if (button.action === 'next-phase') {
            store.dispatch(nextPhase());
          } else if (button.action === 'next-turn') {
            store.dispatch(nextTurn());
          }
        }
        return;
      }
      
      // Check for map layout button click
      const mapLayoutButton = turnUI.mapLayoutButton;
      if (this.isPointInRect(x, y, mapLayoutButton.x, mapLayoutButton.y, mapLayoutButton.width, mapLayoutButton.height)) {
        if (mapLayoutButton.enabled) {
          store.dispatch(toggleMapLayout());
        }
        return;
      }
      
      // Check for map manipulation toggle button click
      const mapManipulationButton = turnUI.mapManipulationButton;
      if (this.isPointInRect(x, y, mapManipulationButton.x, mapManipulationButton.y, mapManipulationButton.width, mapManipulationButton.height)) {
        if (mapManipulationButton.enabled) {
          store.dispatch(toggleMapManipulation());
        }
        return;
      }
      
      // Check for home button click (if visible)
      if (turnUI.homeButton) {
        const homeButton = turnUI.homeButton;
        if (this.isPointInRect(x, y, homeButton.x, homeButton.y, homeButton.width, homeButton.height)) {
          if (homeButton.enabled) {
            store.dispatch(resetViewport());
          }
          return;
        }
      }
    }

    // Check for Plot UI button clicks if available
    if (plotUI) {
      // Check toggle highlight button
      if (this.isPointInRect(
        x, y,
        plotUI.toggleHighlightButton.x,
        plotUI.toggleHighlightButton.y,
        plotUI.toggleHighlightButton.width,
        plotUI.toggleHighlightButton.height
      )) {
        store.dispatch(toggleReachableHexes());
        return;
      }
    }

    // Check for Ordnance UI button clicks if available
    if (ordnanceUI) {
      // Check ordnance launch buttons
      for (const button of ordnanceUI.ordnanceButtons) {
        if (button.enabled && this.isPointInRect(
          x, y, button.x, button.y, button.width, button.height
        )) {
          this.handleOrdnanceButtonClick(button.ordnanceType);
          return;
        }
      }

      // Check skip button
      if (this.isPointInRect(
        x, y,
        ordnanceUI.skipButton.x,
        ordnanceUI.skipButton.y,
        ordnanceUI.skipButton.width,
        ordnanceUI.skipButton.height
      )) {
        // Deselect ship when skipping
        store.dispatch(selectShip(null));
        return;
      }
    }

    // Check for ship clicks to select them and hex clicks to plot moves
    const hexSize = 10;
    const layout: HexLayout = {
      size: hexSize,
      origin: {
        x: this.renderer.getCanvasWidth() / 2,
        y: this.renderer.getCanvasHeight() / 2,
      },
      orientation: 'pointy',
    };

    const clickedHex = pixelToHex({ x, y }, layout);
    
    // In Plot phase, check if a ship is selected and user clicked on a reachable hex
    if (state.currentPhase === GamePhase.Plot && state.selectedShipId) {
      const selectedShip = state.ships.find((s) => s.id === state.selectedShipId);
      if (selectedShip && !selectedShip.destroyed) {
        // Get current velocity and remaining thrust
        const plottedMove = state.plottedMoves.get(state.selectedShipId);
        const currentVelocity = plottedMove ? plottedMove.newVelocity : selectedShip.velocity;
        const thrustAlreadyUsed = plottedMove ? plottedMove.thrustUsed : 0;
        const remainingThrust = selectedShip.stats.maxThrust - thrustAlreadyUsed;
        
        // Calculate reachable hexes
        const reachableHexes = this.calculateReachableHexesForPlotting(
          selectedShip.position,
          currentVelocity,
          remainingThrust
        );
        
        // Check if the clicked hex is reachable
        const hexKey = `${clickedHex.q},${clickedHex.r}`;
        const reachableData = reachableHexes.get(hexKey);
        
        if (reachableData) {
          // Plot move to this hex with the resulting velocity
          store.dispatch(plotShipMove(
            state.selectedShipId,
            reachableData.resultingVelocity,
            thrustAlreadyUsed + reachableData.thrustRequired
          ));
          return;
        }
      }
    }
    
    // Find ship at clicked hex
    for (const ship of state.ships) {
      if (ship.position.q === clickedHex.q && ship.position.r === clickedHex.r && !ship.destroyed) {
        store.dispatch(selectShip(ship.id));
        return;
      }
    }

    // If no ship clicked, deselect
    store.dispatch(selectShip(null));
  }
  
  private calculateReachableHexesForPlotting(
    position: { q: number; r: number },
    velocity: { q: number; r: number },
    availableThrust: number
  ): Map<string, { hex: { q: number; r: number }; thrustRequired: number; resultingVelocity: { q: number; r: number } }> {
    const reachable = new Map<string, { hex: { q: number; r: number }; thrustRequired: number; resultingVelocity: { q: number; r: number } }>();
    
    // Try all possible thrust applications within the available thrust
    for (let dq = -availableThrust; dq <= availableThrust; dq++) {
      for (let dr = -availableThrust; dr <= availableThrust; dr++) {
        const ds = -dq - dr;
        const thrustMagnitude = (Math.abs(dq) + Math.abs(dr) + Math.abs(ds)) / 2;
        
        if (thrustMagnitude <= availableThrust) {
          const resultingVelocity = {
            q: velocity.q + dq,
            r: velocity.r + dr,
          };
          
          const destination = {
            q: position.q + resultingVelocity.q,
            r: position.r + resultingVelocity.r,
          };
          const key = `${destination.q},${destination.r}`;
          
          if (!reachable.has(key) || reachable.get(key)!.thrustRequired > thrustMagnitude) {
            reachable.set(key, {
              hex: destination,
              thrustRequired: thrustMagnitude,
              resultingVelocity,
            });
          }
        }
      }
    }
    
    return reachable;
  }



  private getOrdnanceInfo(
    ship: { velocity: { q: number; r: number }; ordnance: { mines: number; torpedoes: number; missiles: number } },
    ordnanceType: OrdnanceType
  ): { currentCount: number; velocity: { q: number; r: number } } {
    switch (ordnanceType) {
      case OrdnanceType.Mine:
        return { currentCount: ship.ordnance.mines, velocity: { q: 0, r: 0 } };
      case OrdnanceType.Torpedo:
        return { currentCount: ship.ordnance.torpedoes, velocity: { ...ship.velocity } };
      case OrdnanceType.Missile:
        return { currentCount: ship.ordnance.missiles, velocity: { ...ship.velocity } };
    }
  }

  private handleOrdnanceButtonClick(ordnanceType: OrdnanceType): void {
    const state = store.getState();
    if (!state.selectedShipId) return;

    const selectedShip = state.ships.find((s) => s.id === state.selectedShipId);
    if (!selectedShip || selectedShip.destroyed) return;

    // Get ordnance count and determine velocity
    const { currentCount, velocity } = this.getOrdnanceInfo(selectedShip, ordnanceType);

    if (currentCount === 0) return;

    const ordnance = createOrdnance(
      generateOrdnanceId(),
      ordnanceType,
      selectedShip.playerId,
      { ...selectedShip.position },
      velocity,
      state.roundNumber
    );

    // Launch the ordnance
    store.dispatch(launchOrdnance(ordnance));

    // Decrease ship's ordnance count
    store.dispatch(updateShipOrdnance(
      selectedShip.id,
      ordnanceType,
      currentCount - 1
    ));

    // Deselect ship after launching
    store.dispatch(selectShip(null));
  }

  private handleColorPickerClick(x: number, y: number): void {
    if (!this.currentLayout?.colorPicker) return;

    const picker = this.currentLayout.colorPicker;
    const playerId = this.renderer.getColorPickerPlayerId();

    if (!playerId) {
      this.renderer.hideColorPicker();
      return;
    }

    // Check if click is outside the picker to close it
    if (
      !this.isPointInRect(x, y, picker.x, picker.y, picker.width, picker.height)
    ) {
      this.renderer.hideColorPicker();
      return;
    }

    // Check for color swatch clicks
    const colorSize = Math.min(picker.width, picker.height) * 0.15;
    const spacing = colorSize * 1.3;
    const startX = picker.x + (picker.width - spacing * 3) / 2 + colorSize / 2;
    const startY = picker.y + picker.height * 0.35;

    for (let index = 0; index < PLAYER_COLORS.length; index++) {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const swatchX = startX + col * spacing;
      const swatchY = startY + row * spacing;

      if (
        this.isPointInRect(
          x,
          y,
          swatchX - colorSize / 2,
          swatchY - colorSize / 2,
          colorSize,
          colorSize
        )
      ) {
        const color = PLAYER_COLORS[index];
        store.dispatch(changePlayerColor(playerId, color));
        this.renderer.hideColorPicker();
        return;
      }
    }
  }

  private isPointInButton(x: number, y: number, button: Button): boolean {
    return this.isPointInRect(x, y, button.x, button.y, button.width, button.height);
  }

  private isPointInRect(
    x: number,
    y: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number
  ): boolean {
    return (
      x >= rectX &&
      x <= rectX + rectWidth &&
      y >= rectY &&
      y <= rectY + rectHeight
    );
  }
}
