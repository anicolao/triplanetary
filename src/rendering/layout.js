// UI element definitions and layout calculations
// Calculate layout based on canvas dimensions and game state
export function calculateLayout(canvasWidth, canvasHeight, players, colorPickerPlayerId) {
    const padding = Math.min(canvasWidth, canvasHeight) * 0.05;
    const buttonHeight = Math.min(canvasWidth, canvasHeight) * 0.08;
    const buttonWidth = Math.min(canvasWidth * 0.6, 400);
    const colorIconSize = Math.min(canvasWidth, canvasHeight) * 0.06;
    const removeButtonSize = Math.min(canvasWidth, canvasHeight) * 0.05;
    // Title
    const titleSize = Math.min(canvasWidth, canvasHeight) * 0.06;
    const titleX = canvasWidth / 2;
    const titleY = padding + titleSize;
    // Player list area
    const playerListStartY = titleY + titleSize + padding * 2;
    const playerEntryHeight = colorIconSize + padding * 0.5;
    const playerEntries = players.map((player, index) => {
        const entryY = playerListStartY + index * playerEntryHeight;
        const entryX = canvasWidth / 2 - buttonWidth / 2;
        return {
            player,
            colorIconX: entryX,
            colorIconY: entryY,
            colorIconSize,
            labelX: entryX + colorIconSize + padding * 0.5,
            labelY: entryY + colorIconSize / 2,
            removeButton: {
                x: entryX + buttonWidth - removeButtonSize,
                y: entryY,
                width: removeButtonSize,
                height: removeButtonSize,
                text: '×',
                enabled: true,
                type: 'remove-player',
                playerId: player.id,
            },
        };
    });
    // Add Player button
    const addPlayerButtonY = playerEntries.length > 0
        ? playerEntries[playerEntries.length - 1].colorIconY +
            colorIconSize +
            padding * 1.5
        : playerListStartY;
    const addPlayerButton = {
        x: canvasWidth / 2 - buttonWidth / 2,
        y: addPlayerButtonY,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Add Player',
        enabled: players.length < 6,
        type: 'add-player',
    };
    // Start Game button
    const startGameButton = {
        x: canvasWidth / 2 - buttonWidth / 2,
        y: addPlayerButtonY + buttonHeight + padding,
        width: buttonWidth,
        height: buttonHeight,
        text: 'Start Game',
        enabled: players.length > 0,
        type: 'start-game',
    };
    // Color picker overlay
    let colorPicker = null;
    if (colorPickerPlayerId) {
        const pickerWidth = Math.min(canvasWidth * 0.8, 500);
        const pickerHeight = Math.min(canvasHeight * 0.5, 300);
        const pickerX = canvasWidth / 2 - pickerWidth / 2;
        const pickerY = canvasHeight / 2 - pickerHeight / 2;
        colorPicker = {
            visible: true,
            playerId: colorPickerPlayerId,
            x: pickerX,
            y: pickerY,
            width: pickerWidth,
            height: pickerHeight,
            colors: [],
        };
    }
    return {
        titleX,
        titleY,
        titleSize,
        playerEntries,
        addPlayerButton,
        startGameButton,
        colorPicker,
    };
}
