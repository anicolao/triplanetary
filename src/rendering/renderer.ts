// Canvas rendering functions

import { GameState, PLAYER_COLORS, GamePhase } from '../redux/types';
import { UILayout, Button, PlayerEntry, calculateLayout } from './layout';
import { GridRenderer } from './gridRenderer';
import { CelestialRenderer } from './celestialRenderer';
import { ShipRenderer } from './shipRenderer';
import { PlotRenderer, createPlotUIElements, PlotUIElements } from './plotRenderer';
import { TurnRenderer } from './turnRenderer';
import { createTurnUILayout, TurnUILayout } from './turnUI';
import { CombatRenderer } from './combatRenderer';
import { createCombatUILayout, getAttackInfoText, CombatUILayout } from './combatUI';
import { HexLayout } from '../hex/types';
import { hexToPixel } from '../hex/operations';
import { calculateReachableHexes } from '../physics/movement';
import { areAllShipsPlotted } from '../physics/plotQueue';
import { getValidTargets } from '../combat/resolution';
import { renderOrdnance } from './ordnanceRenderer';
import { createOrdnanceUIElements, renderOrdnanceUI, OrdnanceUIElements } from './ordnanceUI';

export interface ShipNavButtons {
  previousButton: { x: number; y: number; width: number; height: number; visible: boolean } | null;
  nextButton: { x: number; y: number; width: number; height: number; isCheckmark: boolean };
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private colorPickerPlayerId: string | null = null;
  private onRenderNeeded: (() => void) | null = null;
  private gridRenderer: GridRenderer;
  private celestialRenderer: CelestialRenderer;
  private shipRenderer: ShipRenderer;
  private plotRenderer: PlotRenderer;
  private turnRenderer: TurnRenderer;
  private combatRenderer: CombatRenderer;
  private currentPlotUIElements: PlotUIElements | null = null;
  private currentTurnUILayout: TurnUILayout | null = null;
  private currentCombatUILayout: CombatUILayout | null = null;
  private currentOrdnanceUIElements: OrdnanceUIElements | null = null;
  private shipNavButtons: ShipNavButtons | null = null;
  private originalMapImage: HTMLImageElement | null = null;
  private originalMapImageLoaded: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    this.gridRenderer = new GridRenderer(ctx);
    this.celestialRenderer = new CelestialRenderer(ctx);
    this.shipRenderer = new ShipRenderer(ctx);
    this.plotRenderer = new PlotRenderer(ctx);
    this.turnRenderer = new TurnRenderer(ctx);
    this.combatRenderer = new CombatRenderer(ctx);
    this.resizeCanvas();
    this.loadOriginalMapImage();
  }

  private loadOriginalMapImage(): void {
    this.originalMapImage = new Image();
    this.originalMapImage.onload = () => {
      this.originalMapImageLoaded = true;
      if (this.onRenderNeeded) {
        this.onRenderNeeded();
      }
    };
    this.originalMapImage.onerror = () => {
      console.error('Failed to load original map image');
      this.originalMapImageLoaded = false;
    };
    // Images in public folder are served relative to the document base URI
    this.originalMapImage.src = new URL('original-map.png', document.baseURI).href;
  }

  setRenderCallback(callback: () => void): void {
    this.onRenderNeeded = callback;
  }

  resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  showColorPicker(playerId: string): void {
    this.colorPickerPlayerId = playerId;
    if (this.onRenderNeeded) {
      this.onRenderNeeded();
    }
  }

  hideColorPicker(): void {
    this.colorPickerPlayerId = null;
    if (this.onRenderNeeded) {
      this.onRenderNeeded();
    }
  }

  getColorPickerPlayerId(): string | null {
    return this.colorPickerPlayerId;
  }

  getTurnUILayout(): TurnUILayout | null {
    return this.currentTurnUILayout;
  }

  getCombatUILayout(): CombatUILayout | null {
    return this.currentCombatUILayout;
  }

  getShipNavButtons(): ShipNavButtons | null {
    return this.shipNavButtons;
  }

  render(state: GameState): UILayout {
    const { screen } = state;

    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (screen === 'configuration') {
      return this.renderConfigurationScreen(state);
    } else if (screen === 'gameplay') {
      return this.renderGameplayScreen(state);
    }

    return this.createEmptyLayout();
  }

  private renderConfigurationScreen(state: GameState): UILayout {
    const layout = calculateLayout(
      this.canvas.width,
      this.canvas.height,
      state.players,
      this.colorPickerPlayerId
    );

    // Render title
    this.renderTitle(layout);

    // Render player entries
    layout.playerEntries.forEach((entry, index) => {
      this.renderPlayerEntry(entry, index + 1);
    });

    // Render buttons
    this.renderButton(layout.addPlayerButton);
    this.renderButton(layout.startGameButton);

    // Render color picker if visible
    if (layout.colorPicker && layout.colorPicker.visible) {
      this.renderColorPicker(layout.colorPicker, state.players);
    }

    return layout;
  }

  private renderGameplayScreen(state: GameState): UILayout {
    // Define hex layout for the game board
    // When using original map, align with the bitmap's hex grid
    const usingOriginalMap = state.currentScenario.mapLayout === 'original' && 
                             this.originalMapImageLoaded && 
                             this.originalMapImage;
    
    // Hex size needs to match the bitmap's hex size
    // Original map (after 90° rotation): 1083x791 pixels
    // The bitmap has approximately 60 hexes across its width
    // Both modern and original maps now use the same hex size for consistency
    const hexSize = 10.5;
    
    // Origin needs to be adjusted for proper alignment with bitmap
    // After rotation, the center needs to account for the bitmap's hex grid offset
    // Both modern and original maps use the same origin calculation for consistency
    const originX = this.canvas.width / 2 - 3;
    const originY = this.canvas.height / 2 + 1;
    
    const layout: HexLayout = {
      size: hexSize,
      origin: {
        x: originX,
        y: originY,
      },
      orientation: 'pointy',
    };

    // Render the hex grid with a radius to show all planets
    // Mars orbits at ~26 hexes (matching original map), so we need at least that much radius
    const gridRadius = 36;
    const gridOptions: any = {
      showCoordinates: false, // Hide coordinates for cleaner view at this zoom level
    };
    
    // If using original map layout and image is loaded, use it as background
    if (usingOriginalMap) {
      gridOptions.backgroundImage = this.originalMapImage;
      // Don't show grid when using original map - use embedded bitmap grid
      gridOptions.showGrid = false;
    }
    
    this.gridRenderer.renderGameBoard(layout, gridRadius, this.canvas.width, this.canvas.height, gridOptions);

    // Render all map objects (celestial bodies, stations, asteroids)
    // Skip when using original map - use embedded features in the bitmap instead
    if (state.currentScenario.mapLayout !== 'original') {
      this.celestialRenderer.renderCelestialBodies(state.mapObjects, layout);
    }

    // If a ship is selected and we should show reachable hexes, render them
    if (state.selectedShipId && state.showReachableHexes) {
      const selectedShip = state.ships.find(s => s.id === state.selectedShipId);
      if (selectedShip && !selectedShip.destroyed) {
        // Check if there's a plotted move for this ship
        const plottedMove = state.plottedMoves.get(state.selectedShipId);
        const currentVelocity = plottedMove ? plottedMove.newVelocity : selectedShip.velocity;
        const remainingThrust = plottedMove 
          ? selectedShip.stats.maxThrust - plottedMove.thrustUsed 
          : selectedShip.remainingThrust;
        
        const reachableHexes = calculateReachableHexes(
          selectedShip.position,
          currentVelocity,
          remainingThrust
        );
        this.plotRenderer.renderReachableHexes(reachableHexes, layout);
        
        // If there's a plotted move, show preview
        if (plottedMove) {
          this.plotRenderer.renderVelocityPreview(
            selectedShip.position,
            plottedMove.newVelocity,
            layout
          );
        }
      }
    }

    // Create player color map for ship rendering
    const playerColors = new Map<string, string>();
    state.players.forEach((player) => {
      playerColors.set(player.id, player.color);
    });

    // Render all ships
    this.shipRenderer.renderShips(state.ships, layout, playerColors, {
      showVelocity: true,
      showStatus: true,
      selectedShipId: state.selectedShipId,
    });

    // Render all ordnance
    renderOrdnance(this.ctx, state, layout);

    // Render phase-specific UI
    if (state.currentPhase === GamePhase.Plot) {
      // Render Plot Phase UI if a ship is selected
      if (state.selectedShipId) {
        const selectedShip = state.ships.find(s => s.id === state.selectedShipId);
        if (selectedShip && !selectedShip.destroyed) {
          const hasPlottedMove = state.plottedMoves.has(state.selectedShipId);
          this.currentPlotUIElements = createPlotUIElements(
            selectedShip,
            this.canvas.width,
            this.canvas.height,
            hasPlottedMove
          );
          this.plotRenderer.renderPlotUI(
            this.currentPlotUIElements
          );
        }
      } else {
        this.currentPlotUIElements = null;
      }
      this.currentOrdnanceUIElements = null;
    } else if (state.currentPhase === GamePhase.Ordnance) {
      // Render Ordnance Phase UI if a ship is selected
      if (state.selectedShipId) {
        const selectedShip = state.ships.find(s => s.id === state.selectedShipId);
        if (selectedShip && !selectedShip.destroyed) {
          this.currentOrdnanceUIElements = createOrdnanceUIElements(
            selectedShip,
            this.canvas.width
          );
          renderOrdnanceUI(this.ctx, this.currentOrdnanceUIElements);
        }
      } else {
        this.currentOrdnanceUIElements = null;
      }
      this.currentPlotUIElements = null;
    } else {
      // Clear UI elements for other phases
      this.currentPlotUIElements = null;
      this.currentOrdnanceUIElements = null;
    }

    // Render Combat Phase UI if in Combat phase
    if (state.currentPhase === GamePhase.Combat) {
      const selectedShip = state.selectedShipId 
        ? state.ships.find(s => s.id === state.selectedShipId)
        : null;
      
      // Get potential targets (all enemy ships)
      const potentialTargets = selectedShip 
        ? getValidTargets(selectedShip, state.ships)
        : [];
      
      // Get selected target
      const selectedTarget = state.selectedTargetId
        ? state.ships.find(s => s.id === state.selectedTargetId) || null
        : null;
      
      // Get declared attack for current ship (if any)
      const declaredAttack = state.selectedShipId 
        ? state.declaredAttacks.get(state.selectedShipId) || null
        : null;
      
      this.currentCombatUILayout = createCombatUILayout(
        this.canvas.width,
        this.canvas.height,
        selectedShip || null,
        potentialTargets,
        selectedTarget,
        declaredAttack,
        state.combatLog,
        (q, r) => hexToPixel({ q, r }, layout)
      );
      
      this.combatRenderer.renderCombatUI(this.currentCombatUILayout);
      
      // Render attack info if available
      if (declaredAttack && this.currentCombatUILayout.attackInfoVisible) {
        const infoLines = getAttackInfoText(declaredAttack);
        this.combatRenderer.renderAttackInfo(
          this.currentCombatUILayout.attackInfoX,
          this.currentCombatUILayout.attackInfoY,
          infoLines
        );
      }
    } else {
      this.currentCombatUILayout = null;
    }

    // Render UI overlay showing player information
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 200, 60 + state.players.length * 25);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText('Players:', 20, 20);

    // Render ship navigation buttons only in Plot phase for current player
    this.shipNavButtons = null;
    if (state.currentPhase === GamePhase.Plot) {
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer) {
        const playerShips = state.ships.filter(s => s.playerId === currentPlayer.id && !s.destroyed);
        const currentShipIndex = state.selectedShipId 
          ? playerShips.findIndex(s => s.id === state.selectedShipId)
          : -1;
        const isLastShip = currentShipIndex === playerShips.length - 1;
        const hasMultipleShips = playerShips.length > 1;

        state.players.forEach((player, index) => {
          this.ctx.fillStyle = player.color;
          this.ctx.fillRect(20, 45 + index * 25, 15, 15);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillText(`Player ${index + 1}`, 40, 45 + index * 25);

          // Add navigation buttons for current player
          if (index === state.currentPlayerIndex) {
            const buttonY = 45 + index * 25;
            const buttonSize = 20;
            const buttonSpacing = 5;
            let buttonX = 150;

            // Previous button (only if multiple ships)
            if (hasMultipleShips) {
              this.ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
              this.ctx.fillRect(buttonX, buttonY, buttonSize, buttonSize);
              this.ctx.strokeStyle = '#ffffff';
              this.ctx.lineWidth = 2;
              this.ctx.strokeRect(buttonX, buttonY, buttonSize, buttonSize);
              
              // Draw left arrow
              this.ctx.fillStyle = '#ffffff';
              this.ctx.beginPath();
              this.ctx.moveTo(buttonX + buttonSize * 0.65, buttonY + buttonSize * 0.25);
              this.ctx.lineTo(buttonX + buttonSize * 0.35, buttonY + buttonSize * 0.5);
              this.ctx.lineTo(buttonX + buttonSize * 0.65, buttonY + buttonSize * 0.75);
              this.ctx.stroke();

              if (!this.shipNavButtons) {
                this.shipNavButtons = {
                  previousButton: { x: buttonX, y: buttonY, width: buttonSize, height: buttonSize, visible: true },
                  nextButton: { x: 0, y: 0, width: 0, height: 0, isCheckmark: false }
                };
              } else {
                this.shipNavButtons.previousButton = { x: buttonX, y: buttonY, width: buttonSize, height: buttonSize, visible: true };
              }

              buttonX += buttonSize + buttonSpacing;
            }

            // Next/Confirm button
            this.ctx.fillStyle = isLastShip ? 'rgba(0, 200, 0, 0.8)' : 'rgba(100, 100, 100, 0.8)';
            this.ctx.fillRect(buttonX, buttonY, buttonSize, buttonSize);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(buttonX, buttonY, buttonSize, buttonSize);
            
            if (isLastShip) {
              // Draw checkmark
              this.ctx.strokeStyle = '#ffffff';
              this.ctx.lineWidth = 2;
              this.ctx.beginPath();
              this.ctx.moveTo(buttonX + buttonSize * 0.25, buttonY + buttonSize * 0.5);
              this.ctx.lineTo(buttonX + buttonSize * 0.45, buttonY + buttonSize * 0.7);
              this.ctx.lineTo(buttonX + buttonSize * 0.75, buttonY + buttonSize * 0.3);
              this.ctx.stroke();
            } else {
              // Draw right arrow
              this.ctx.fillStyle = '#ffffff';
              this.ctx.beginPath();
              this.ctx.moveTo(buttonX + buttonSize * 0.35, buttonY + buttonSize * 0.25);
              this.ctx.lineTo(buttonX + buttonSize * 0.65, buttonY + buttonSize * 0.5);
              this.ctx.lineTo(buttonX + buttonSize * 0.35, buttonY + buttonSize * 0.75);
              this.ctx.stroke();
            }

            if (!this.shipNavButtons) {
              this.shipNavButtons = {
                previousButton: hasMultipleShips ? { x: buttonX - buttonSize - buttonSpacing, y: buttonY, width: buttonSize, height: buttonSize, visible: true } : null,
                nextButton: { x: buttonX, y: buttonY, width: buttonSize, height: buttonSize, isCheckmark: isLastShip }
              };
            } else {
              this.shipNavButtons.nextButton = { x: buttonX, y: buttonY, width: buttonSize, height: buttonSize, isCheckmark: isLastShip };
            }
          }
        });
      } else {
        // No ship navigation in other phases
        state.players.forEach((player, index) => {
          this.ctx.fillStyle = player.color;
          this.ctx.fillRect(20, 45 + index * 25, 15, 15);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillText(`Player ${index + 1}`, 40, 45 + index * 25);
        });
      }
    } else {
      // No ship navigation in other phases
      state.players.forEach((player, index) => {
        this.ctx.fillStyle = player.color;
        this.ctx.fillRect(20, 45 + index * 25, 15, 15);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`Player ${index + 1}`, 40, 45 + index * 25);
      });
    }

    // Render turn management UI
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer) {
      // Check if all ships are plotted (only relevant in Plot phase)
      const allShipsPlotted = state.currentPhase === GamePhase.Plot
        ? areAllShipsPlotted(state.ships, state.plottedMoves, currentPlayer.id)
        : true;
      
      this.currentTurnUILayout = createTurnUILayout(
        this.canvas.width,
        this.canvas.height,
        state.currentPhase,
        state.currentPlayerIndex,
        state.players.length,
        state.roundNumber,
        currentPlayer.color,
        allShipsPlotted,
        state.victoryState,
        state.players.map(p => p.id),
        state.currentScenario.mapLayout
      );
      this.turnRenderer.renderTurnUI(this.currentTurnUILayout);
    } else {
      this.currentTurnUILayout = null;
    }

    return this.createEmptyLayout();
  }

  private renderTitle(layout: UILayout): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold ${layout.titleSize}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('TRIPLANETARY', layout.titleX, layout.titleY);
  }

  private renderPlayerEntry(entry: PlayerEntry, playerNumber: number): void {
    // Render color icon
    this.ctx.fillStyle = entry.player.color;
    this.ctx.fillRect(
      entry.colorIconX,
      entry.colorIconY,
      entry.colorIconSize,
      entry.colorIconSize
    );

    // Add border to color icon
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      entry.colorIconX,
      entry.colorIconY,
      entry.colorIconSize,
      entry.colorIconSize
    );

    // Render player label
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `${entry.colorIconSize * 0.4}px sans-serif`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`Player ${playerNumber}`, entry.labelX, entry.labelY);

    // Render remove button
    this.renderButton(entry.removeButton);
  }

  private renderButton(button: Button): void {
    // Button background
    if (button.enabled) {
      this.ctx.fillStyle = button.type === 'remove-player' ? '#d32f2f' : '#4CAF50';
    } else {
      this.ctx.fillStyle = '#555555';
    }
    this.ctx.fillRect(button.x, button.y, button.width, button.height);

    // Button border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(button.x, button.y, button.width, button.height);

    // Button text
    this.ctx.fillStyle = button.enabled ? '#ffffff' : '#999999';
    this.ctx.font = `${button.height * 0.4}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      button.text,
      button.x + button.width / 2,
      button.y + button.height / 2
    );
  }

  private renderColorPicker(
    picker: { x: number; y: number; width: number; height: number },
    players: { id: string; color: string }[]
  ): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Picker background
    this.ctx.fillStyle = '#2a2a3e';
    this.ctx.fillRect(picker.x, picker.y, picker.width, picker.height);

    // Picker border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(picker.x, picker.y, picker.width, picker.height);

    // Title
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `${picker.height * 0.08}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      'Select Color',
      picker.x + picker.width / 2,
      picker.y + picker.height * 0.15
    );

    // Color swatches
    const colorSize = Math.min(picker.width, picker.height) * 0.15;
    const spacing = colorSize * 1.3;
    const startX = picker.x + (picker.width - spacing * 3) / 2 + colorSize / 2;
    const startY = picker.y + picker.height * 0.35;

    const usedColors = new Set(players.map((p) => p.color));

    PLAYER_COLORS.forEach((color, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = startX + col * spacing;
      const y = startY + row * spacing;

      // Draw color swatch
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        x - colorSize / 2,
        y - colorSize / 2,
        colorSize,
        colorSize
      );

      // Draw border
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        x - colorSize / 2,
        y - colorSize / 2,
        colorSize,
        colorSize
      );

      // Mark if color is in use
      if (usedColors.has(color)) {
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x - colorSize * 0.3, y - colorSize * 0.3);
        this.ctx.lineTo(x + colorSize * 0.3, y + colorSize * 0.3);
        this.ctx.moveTo(x + colorSize * 0.3, y - colorSize * 0.3);
        this.ctx.lineTo(x - colorSize * 0.3, y + colorSize * 0.3);
        this.ctx.stroke();
      }
    });
  }

  private createEmptyLayout(): UILayout {
    return {
      titleX: 0,
      titleY: 0,
      titleSize: 0,
      playerEntries: [],
      addPlayerButton: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: '',
        enabled: false,
        type: 'add-player',
      },
      startGameButton: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: '',
        enabled: false,
        type: 'start-game',
      },
      colorPicker: null,
    };
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getCanvasWidth(): number {
    return this.canvas.width;
  }

  getCanvasHeight(): number {
    return this.canvas.height;
  }

  getCurrentPlotUIElements(): PlotUIElements | null {
    return this.currentPlotUIElements;
  }

  getCurrentOrdnanceUIElements(): OrdnanceUIElements | null {
    return this.currentOrdnanceUIElements;
  }
}
