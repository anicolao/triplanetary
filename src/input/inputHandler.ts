// Input handling and hit detection

import { UILayout, Button } from '../rendering/layout';
import { PLAYER_COLORS } from '../redux/types';
import { Renderer } from '../rendering/renderer';
import { store } from '../redux/store';
import {
  addPlayer,
  removePlayer,
  changePlayerColor,
  startGame,
  selectShip,
  plotShipMove,
  clearPlot,
  toggleReachableHexes,
} from '../redux/actions';
import { pixelToHex } from '../hex/operations';
import { HexLayout } from '../hex/types';
import { calculateRequiredThrust } from '../physics/velocity';
import { vectorAdd } from '../physics/vector';

export class InputHandler {
  private renderer: Renderer;
  private currentLayout: UILayout | null = null;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
    this.setupEventListeners();
  }

  setCurrentLayout(layout: UILayout): void {
    this.currentLayout = layout;
  }

  private setupEventListeners(): void {
    const canvas = this.renderer.getCanvas();

    canvas.addEventListener('click', (event) => {
      this.handleClick(event.clientX, event.clientY);
    });

    canvas.addEventListener('touchstart', (event) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        this.handleClick(touch.clientX, touch.clientY);
      }
      event.preventDefault();
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
    const plotUI = this.renderer.getCurrentPlotUIElements();

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

      // Check undo button
      if (plotUI.undoButton && this.isPointInRect(
        x, y,
        plotUI.undoButton.x,
        plotUI.undoButton.y,
        plotUI.undoButton.width,
        plotUI.undoButton.height
      )) {
        if (state.selectedShipId) {
          store.dispatch(clearPlot(state.selectedShipId));
        }
        return;
      }

      // Check confirm button
      if (plotUI.confirmButton && this.isPointInRect(
        x, y,
        plotUI.confirmButton.x,
        plotUI.confirmButton.y,
        plotUI.confirmButton.width,
        plotUI.confirmButton.height
      )) {
        // For now, just clear selection
        // In full implementation, this would move to next phase
        store.dispatch(selectShip(null));
        return;
      }

      // Check thrust direction buttons
      for (const button of plotUI.thrustButtons) {
        if (button.enabled && this.isPointInRect(
          x, y, button.x, button.y, button.width, button.height
        )) {
          this.handleThrustButtonClick(button.direction);
          return;
        }
      }
    }

    // Check for ship clicks to select them
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

  private handleThrustButtonClick(direction: { q: number; r: number }): void {
    const state = store.getState();
    if (!state.selectedShipId) return;

    const selectedShip = state.ships.find(s => s.id === state.selectedShipId);
    if (!selectedShip || selectedShip.destroyed) return;

    // Get current velocity (from plotted move if exists, otherwise from ship)
    const plottedMove = state.plottedMoves.get(state.selectedShipId);
    const currentVelocity = plottedMove ? plottedMove.newVelocity : selectedShip.velocity;
    const thrustAlreadyUsed = plottedMove ? plottedMove.thrustUsed : 0;
    const remainingThrust = selectedShip.stats.maxThrust - thrustAlreadyUsed;

    // Apply thrust in the clicked direction
    const newVelocity = vectorAdd(currentVelocity, direction);
    
    // Calculate thrust required for this change
    const { thrustRequired } = calculateRequiredThrust(currentVelocity, newVelocity);

    // Check if we have enough thrust
    if (thrustRequired <= remainingThrust) {
      store.dispatch(plotShipMove(
        state.selectedShipId,
        newVelocity,
        thrustAlreadyUsed + thrustRequired
      ));
    }
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
