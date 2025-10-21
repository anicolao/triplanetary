// Main application entry point
import { store } from './redux/store';
import { Renderer } from './rendering/renderer';
import { InputHandler } from './input/inputHandler';
// Initialize the application
function init() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        throw new Error('Canvas element not found');
    }
    const renderer = new Renderer(canvas);
    const inputHandler = new InputHandler(renderer);
    // Handle window resize
    window.addEventListener('resize', () => {
        renderer.resizeCanvas();
        render();
    });
    // Main render function
    function render() {
        const state = store.getState();
        const layout = renderer.render(state);
        inputHandler.setCurrentLayout(layout);
    }
    // Subscribe to store changes
    store.subscribe(render);
    // Initial render
    render();
    // Animation loop for smooth rendering
    function animate() {
        requestAnimationFrame(animate);
        // We only render when state changes, so nothing to do here
        // But keeping the animation loop for future enhancements
    }
    animate();
}
// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}
