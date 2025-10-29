// Tests for ship rendering

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShipRenderer } from '../src/rendering/shipRenderer';
import { Ship, createShip } from '../src/ship/types';
import { HexLayout } from '../src/hex/types';

describe('ShipRenderer', () => {
  let mockCtx: any;
  let renderer: ShipRenderer;
  let layout: HexLayout;

  beforeEach(() => {
    // Create a mock canvas context
    mockCtx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      globalAlpha: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      fillRect: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
    };
    renderer = new ShipRenderer(mockCtx);

    // Define a basic hex layout
    layout = {
      size: 20,
      origin: { x: 400, y: 300 },
      orientation: 'pointy',
    };
  });

  describe('Basic Ship Rendering', () => {
    it('should create a ship renderer instance', () => {
      expect(renderer).toBeDefined();
    });

    it('should render a ship at the correct position', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      const playerColors = new Map([['player1', '#FF0000']]);

      // This should not throw
      expect(() => {
        renderer.renderShips([ship], layout, playerColors);
      }).not.toThrow();
    });

    it('should render multiple ships', () => {
      const ships = [
        createShip('ship1', 'Ship 1', 'player1', { q: 0, r: 0 }),
        createShip('ship2', 'Ship 2', 'player2', { q: 1, r: 0 }),
        createShip('ship3', 'Ship 3', 'player1', { q: -1, r: 1 }),
      ];
      const playerColors = new Map([
        ['player1', '#FF0000'],
        ['player2', '#00FF00'],
      ]);

      expect(() => {
        renderer.renderShips(ships, layout, playerColors);
      }).not.toThrow();
    });

    it('should not render destroyed ships', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.destroyed = true;
      const playerColors = new Map([['player1', '#FF0000']]);

      // This should still not throw but won't render the ship
      expect(() => {
        renderer.renderShips([ship], layout, playerColors);
      }).not.toThrow();
    });

    it('should highlight selected ship', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      const playerColors = new Map([['player1', '#FF0000']]);

      expect(() => {
        renderer.renderShips([ship], layout, playerColors, {
          selectedShipId: 'ship1',
        });
      }).not.toThrow();
    });
  });

  describe('Velocity Vector Rendering', () => {
    it('should render velocity vector when ship has velocity', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.velocity = { q: 2, r: 1 };
      const playerColors = new Map([['player1', '#FF0000']]);

      expect(() => {
        renderer.renderShips([ship], layout, playerColors, {
          showVelocity: true,
        });
      }).not.toThrow();
    });

    it('should not render velocity vector when velocity is zero', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.velocity = { q: 0, r: 0 };
      const playerColors = new Map([['player1', '#FF0000']]);

      expect(() => {
        renderer.renderShips([ship], layout, playerColors, {
          showVelocity: true,
        });
      }).not.toThrow();
    });

    it('should not render velocity vectors when option is disabled', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.velocity = { q: 2, r: 1 };
      const playerColors = new Map([['player1', '#FF0000']]);

      expect(() => {
        renderer.renderShips([ship], layout, playerColors, {
          showVelocity: false,
        });
      }).not.toThrow();
    });
  });

  describe('Ship Status Indicators', () => {
    it('should render hull and thrust status', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      const playerColors = new Map([['player1', '#FF0000']]);

      expect(() => {
        renderer.renderShips([ship], layout, playerColors, {
          showStatus: true,
        });
      }).not.toThrow();
    });

    it('should render damaged indicator when hull is low', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.stats.currentHull = 2; // Less than 50% of max (6)
      const playerColors = new Map([['player1', '#FF0000']]);

      expect(() => {
        renderer.renderShips([ship], layout, playerColors, {
          showStatus: true,
        });
      }).not.toThrow();
    });

    it('should render out-of-fuel indicator when thrust is zero', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.remainingThrust = 0;
      const playerColors = new Map([['player1', '#FF0000']]);

      expect(() => {
        renderer.renderShips([ship], layout, playerColors, {
          showStatus: true,
        });
      }).not.toThrow();
    });

    it('should not render status indicators when option is disabled', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      const playerColors = new Map([['player1', '#FF0000']]);

      expect(() => {
        renderer.renderShips([ship], layout, playerColors, {
          showStatus: false,
        });
      }).not.toThrow();
    });
  });

  describe('Ship Positioning', () => {
    it('should get ship pixel position', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 2, r: 3 });
      const position = renderer.getShipPixelPosition(ship, layout);

      expect(position).toBeDefined();
      expect(position.x).toBeDefined();
      expect(position.y).toBeDefined();
      // Position should be offset from origin based on hex coordinates
      expect(position.x).not.toBe(layout.origin.x);
      expect(position.y).not.toBe(layout.origin.y);
    });

    it('should detect point within ship bounds', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      const shipPosition = renderer.getShipPixelPosition(ship, layout);

      // Point at ship center should be within bounds
      expect(
        renderer.isPointInShip(shipPosition, ship, layout)
      ).toBe(true);

      // Point far from ship should not be within bounds
      expect(
        renderer.isPointInShip({ x: 0, y: 0 }, ship, layout)
      ).toBe(false);
    });
  });

  describe('Ship Orientation', () => {
    it('should orient ship based on velocity direction', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      
      // Ship with velocity pointing east
      ship.velocity = { q: 2, r: 0 };
      const playerColors = new Map([['player1', '#FF0000']]);

      expect(() => {
        renderer.renderShips([ship], layout, playerColors);
      }).not.toThrow();
    });

    it('should orient ship upward when velocity is zero', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      ship.velocity = { q: 0, r: 0 };
      const playerColors = new Map([['player1', '#FF0000']]);

      expect(() => {
        renderer.renderShips([ship], layout, playerColors);
      }).not.toThrow();
    });
  });

  describe('Color Rendering', () => {
    it('should use player color for ship', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      const playerColors = new Map([['player1', '#FF0000']]);

      expect(() => {
        renderer.renderShips([ship], layout, playerColors);
      }).not.toThrow();
    });

    it('should use default color when player color is not found', () => {
      const ship = createShip('ship1', 'Test Ship', 'player1', { q: 0, r: 0 });
      const playerColors = new Map<string, string>();

      expect(() => {
        renderer.renderShips([ship], layout, playerColors);
      }).not.toThrow();
    });

    it('should render different colored ships for different players', () => {
      const ships = [
        createShip('ship1', 'Ship 1', 'player1', { q: 0, r: 0 }),
        createShip('ship2', 'Ship 2', 'player2', { q: 1, r: 0 }),
      ];
      const playerColors = new Map([
        ['player1', '#FF0000'],
        ['player2', '#00FF00'],
      ]);

      expect(() => {
        renderer.renderShips(ships, layout, playerColors);
      }).not.toThrow();
    });
  });
});
