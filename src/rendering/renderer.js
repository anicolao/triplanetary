// Canvas rendering functions
import { PLAYER_COLORS } from '../redux/types';
import { calculateLayout } from './layout';
export class Renderer {
    constructor(canvas) {
        this.colorPickerPlayerId = null;
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = ctx;
        this.resizeCanvas();
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    showColorPicker(playerId) {
        this.colorPickerPlayerId = playerId;
    }
    hideColorPicker() {
        this.colorPickerPlayerId = null;
    }
    getColorPickerPlayerId() {
        return this.colorPickerPlayerId;
    }
    render(state) {
        const { screen } = state;
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (screen === 'configuration') {
            return this.renderConfigurationScreen(state);
        }
        else if (screen === 'gameplay') {
            return this.renderGameplayScreen(state);
        }
        return this.createEmptyLayout();
    }
    renderConfigurationScreen(state) {
        const layout = calculateLayout(this.canvas.width, this.canvas.height, state.players, this.colorPickerPlayerId);
        // Render title
        this.renderTitle(layout);
        // Render player entries
        layout.playerEntries.forEach((entry) => {
            this.renderPlayerEntry(entry);
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
    renderGameplayScreen(state) {
        // Placeholder for gameplay screen
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '48px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Gameplay Screen (Coming Soon)', this.canvas.width / 2, this.canvas.height / 2);
        // Show player list
        this.ctx.font = '24px sans-serif';
        state.players.forEach((player, index) => {
            this.ctx.fillStyle = player.color;
            this.ctx.fillText(`Player ${index + 1}`, this.canvas.width / 2, this.canvas.height / 2 + 60 + index * 30);
        });
        return this.createEmptyLayout();
    }
    renderTitle(layout) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `bold ${layout.titleSize}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('TRIPLANETARY', layout.titleX, layout.titleY);
    }
    renderPlayerEntry(entry) {
        // Render color icon
        this.ctx.fillStyle = entry.player.color;
        this.ctx.fillRect(entry.colorIconX, entry.colorIconY, entry.colorIconSize, entry.colorIconSize);
        // Add border to color icon
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(entry.colorIconX, entry.colorIconY, entry.colorIconSize, entry.colorIconSize);
        // Render player label
        const playerIndex = parseInt(entry.player.id.split('-')[1]) % 100 ||
            Math.floor(Math.random() * 100);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `${entry.colorIconSize * 0.4}px sans-serif`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Player ${playerIndex % 10 || 1}`, entry.labelX, entry.labelY);
        // Render remove button
        this.renderButton(entry.removeButton);
    }
    renderButton(button) {
        // Button background
        if (button.enabled) {
            this.ctx.fillStyle = button.type === 'remove-player' ? '#d32f2f' : '#4CAF50';
        }
        else {
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
        this.ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    }
    renderColorPicker(picker, players) {
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
        this.ctx.fillText('Select Color', picker.x + picker.width / 2, picker.y + picker.height * 0.15);
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
            this.ctx.fillRect(x - colorSize / 2, y - colorSize / 2, colorSize, colorSize);
            // Draw border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x - colorSize / 2, y - colorSize / 2, colorSize, colorSize);
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
    createEmptyLayout() {
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
    getCanvas() {
        return this.canvas;
    }
    getCanvasWidth() {
        return this.canvas.width;
    }
    getCanvasHeight() {
        return this.canvas.height;
    }
}
