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
  returnToConfig,
  endPhase,
} from '../redux/actions';

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

    // Check if color picker is visible
    if (this.currentLayout.colorPicker?.visible) {
      this.handleColorPickerClick(x, y);
      return;
    }

    // Check for end phase button
    if (this.currentLayout.endPhaseButton) {
      if (this.isPointInButton(x, y, this.currentLayout.endPhaseButton)) {
        if (this.currentLayout.endPhaseButton.enabled) {
          store.dispatch(endPhase());
        }
        return;
      }
    }

    // Check for return to config button
    if (this.currentLayout.returnButton) {
      if (this.isPointInButton(x, y, this.currentLayout.returnButton)) {
        if (this.currentLayout.returnButton.enabled) {
          store.dispatch(returnToConfig());
        }
        return;
      }
    }

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
