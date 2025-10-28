// Celestial body rendering system for planets, the Sun, and gravity wells

import { HexLayout } from '../hex/types';
import { hexToPixel } from '../hex/operations';
import { AnyCelestialBody, Planet, Sun } from '../celestial/types';

export interface CelestialRenderOptions {
  /** Whether to show orbital paths */
  showOrbitalPaths: boolean;
  /** Orbital path color */
  orbitalPathColor: string;
  /** Orbital path line width */
  orbitalPathLineWidth: number;
  /** Whether to show gravity well zones */
  showGravityWells: boolean;
  /** Gravity well zone opacity (0-1) */
  gravityWellOpacity: number;
  /** Inner zone color */
  innerZoneColor: string;
  /** Middle zone color */
  middleZoneColor: string;
  /** Outer zone color */
  outerZoneColor: string;
}

export const DEFAULT_CELESTIAL_OPTIONS: CelestialRenderOptions = {
  showOrbitalPaths: true,
  orbitalPathColor: '#444466',
  orbitalPathLineWidth: 1,
  showGravityWells: true,
  gravityWellOpacity: 0.1,
  innerZoneColor: '#ff4444',
  middleZoneColor: '#ffaa44',
  outerZoneColor: '#44aaff',
};

export class CelestialRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Renders all celestial bodies including the Sun, planets, orbits, and gravity wells.
   */
  renderCelestialBodies(
    bodies: AnyCelestialBody[],
    layout: HexLayout,
    options: Partial<CelestialRenderOptions> = {}
  ): void {
    const opts: CelestialRenderOptions = { ...DEFAULT_CELESTIAL_OPTIONS, ...options };

    // Separate Sun and planets
    const sun = bodies.find(body => body.type === 'sun') as Sun | undefined;
    const planets = bodies.filter(body => body.type === 'planet') as Planet[];

    // Layer 1: Gravity wells (rendered first, behind everything)
    if (opts.showGravityWells) {
      if (sun) {
        this.renderGravityWells(sun, layout, opts);
      }
      planets.forEach(planet => {
        this.renderGravityWells(planet, layout, opts);
      });
    }

    // Layer 2: Orbital paths
    if (opts.showOrbitalPaths) {
      planets.forEach(planet => {
        this.renderOrbitalPath(planet, layout, opts);
      });
    }

    // Layer 3: The Sun
    if (sun) {
      this.renderSun(sun, layout);
    }

    // Layer 4: Planets
    planets.forEach(planet => {
      this.renderPlanet(planet, layout);
    });
  }

  /**
   * Renders the Sun at the center of the solar system.
   */
  private renderSun(sun: Sun, layout: HexLayout): void {
    const center = hexToPixel(sun.position, layout);
    const radius = sun.visualRadius * layout.size;

    // Draw a glowing Sun
    // Outer glow
    const gradient = this.ctx.createRadialGradient(
      center.x, center.y, 0,
      center.x, center.y, radius * 1.5
    );
    gradient.addColorStop(0, sun.color);
    gradient.addColorStop(0.6, sun.color + 'aa');
    gradient.addColorStop(1, sun.color + '00');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius * 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Main Sun body
    this.ctx.fillStyle = sun.color;
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Add a bright center
    const coreGradient = this.ctx.createRadialGradient(
      center.x, center.y, 0,
      center.x, center.y, radius * 0.5
    );
    coreGradient.addColorStop(0, '#FFFFFF');
    coreGradient.addColorStop(1, sun.color);

    this.ctx.fillStyle = coreGradient;
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius * 0.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Renders a planet at its current orbital position.
   */
  private renderPlanet(planet: Planet, layout: HexLayout): void {
    const center = hexToPixel(planet.position, layout);
    const radius = planet.visualRadius * layout.size;

    // Draw the planet as a solid circle with its color
    this.ctx.fillStyle = planet.color;
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Add a subtle border for visibility
    this.ctx.strokeStyle = '#ffffff44';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  /**
   * Renders the orbital path for a planet.
   */
  private renderOrbitalPath(planet: Planet, layout: HexLayout, options: CelestialRenderOptions): void {
    const sunCenter = hexToPixel({ q: 0, r: 0 }, layout);
    const orbitalRadius = planet.orbit.semiMajorAxis * layout.size;

    this.ctx.strokeStyle = options.orbitalPathColor;
    this.ctx.lineWidth = options.orbitalPathLineWidth;
    this.ctx.setLineDash([5, 5]); // Dashed line for orbital path
    
    this.ctx.beginPath();
    this.ctx.arc(sunCenter.x, sunCenter.y, orbitalRadius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.setLineDash([]); // Reset line dash
  }

  /**
   * Renders gravity well zones for a celestial body.
   */
  private renderGravityWells(
    body: AnyCelestialBody,
    layout: HexLayout,
    options: CelestialRenderOptions
  ): void {
    const center = hexToPixel(body.position, layout);

    // Render gravity wells from outer to inner (for proper layering)
    const sortedWells = [...body.gravityWells].sort((a, b) => b.radius - a.radius);

    sortedWells.forEach(well => {
      const radius = well.radius * layout.size;
      let color: string;

      switch (well.zone) {
        case 'inner':
          color = options.innerZoneColor;
          break;
        case 'middle':
          color = options.middleZoneColor;
          break;
        case 'outer':
          color = options.outerZoneColor;
          break;
      }

      // Convert hex color to rgba with opacity
      const rgba = this.hexToRGBA(color, options.gravityWellOpacity);

      this.ctx.fillStyle = rgba;
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  /**
   * Converts a hex color to rgba with specified opacity.
   */
  private hexToRGBA(hex: string, opacity: number): string {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse RGB values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
}
