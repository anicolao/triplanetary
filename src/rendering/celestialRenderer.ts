// Celestial body rendering system for planets, the Sun, gravity wells, stations, and asteroids

import { HexLayout } from '../hex/types';
import { hexToPixel } from '../hex/operations';
import { MapObject, Planet, Sun, SpaceStation, Asteroid } from '../celestial/types';

export interface CelestialRenderOptions {
  /** Whether to show orbital paths */
  showOrbitalPaths: boolean;
  /** Orbital path color */
  orbitalPathColor: string;
  /** Orbital path line width */
  orbitalPathLineWidth: number;
  /** Whether to show gravity well zones (legacy) */
  showGravityWells: boolean;
  /** Gravity well zone opacity (0-1) (legacy) */
  gravityWellOpacity: number;
  /** Inner zone color (legacy) */
  innerZoneColor: string;
  /** Middle zone color (legacy) */
  middleZoneColor: string;
  /** Outer zone color (legacy) */
  outerZoneColor: string;
  /** Whether to show gravity arrows (2018 rules) */
  showGravityArrows: boolean;
  /** Gravity arrow color */
  gravityArrowColor: string;
  /** Weak gravity arrow color */
  weakGravityArrowColor: string;
  /** Gravity arrow line width */
  gravityArrowLineWidth: number;
}

export const DEFAULT_CELESTIAL_OPTIONS: CelestialRenderOptions = {
  showOrbitalPaths: true,
  orbitalPathColor: '#444466',
  orbitalPathLineWidth: 1,
  showGravityWells: false, // Legacy - disabled by default
  gravityWellOpacity: 0.1,
  innerZoneColor: '#ff4444',
  middleZoneColor: '#ffaa44',
  outerZoneColor: '#44aaff',
  showGravityArrows: true, // New 2018 rules - enabled by default
  gravityArrowColor: '#ff8800',
  weakGravityArrowColor: '#88ff88',
  gravityArrowLineWidth: 2,
};

export class CelestialRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Renders all map objects including celestial bodies, stations, and asteroids.
   */
  renderCelestialBodies(
    objects: MapObject[],
    layout: HexLayout,
    options: Partial<CelestialRenderOptions> = {}
  ): void {
    const opts: CelestialRenderOptions = { ...DEFAULT_CELESTIAL_OPTIONS, ...options };

    // Separate objects by type
    const sun = objects.find(obj => obj.type === 'sun') as Sun | undefined;
    const planets = objects.filter(obj => obj.type === 'planet') as Planet[];
    const stations = objects.filter(obj => obj.type === 'station') as SpaceStation[];
    const asteroids = objects.filter(obj => obj.type === 'asteroid') as Asteroid[];

    // Layer 1: Gravity wells (legacy - rendered first, behind everything)
    if (opts.showGravityWells) {
      if (sun && sun.gravityWells) {
        this.renderGravityWells(sun, layout, opts);
      }
      planets.forEach(planet => {
        if (planet.gravityWells) {
          this.renderGravityWells(planet, layout, opts);
        }
      });
    }

    // Layer 1b: Gravity arrows (2018 rules - rendered after zones but before other elements)
    if (opts.showGravityArrows) {
      if (sun) {
        this.renderGravityArrows(sun, layout, opts);
      }
      planets.forEach(planet => {
        this.renderGravityArrows(planet, layout, opts);
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

    // Layer 5: Asteroids
    asteroids.forEach(asteroid => {
      this.renderAsteroid(asteroid, layout);
    });

    // Layer 6: Stations (on top so they're visible)
    stations.forEach(station => {
      this.renderStation(station, layout);
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
   * Renders gravity well zones for a celestial body (legacy).
   */
  private renderGravityWells(
    body: Sun | Planet,
    layout: HexLayout,
    options: CelestialRenderOptions
  ): void {
    if (!body.gravityWells || body.gravityWells.length === 0) {
      return;
    }

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
        default:
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
   * Renders a space station.
   */
  private renderStation(station: SpaceStation, layout: HexLayout): void {
    const center = hexToPixel(station.position, layout);
    const radius = station.visualRadius * layout.size;

    // Draw station as a square with a cross pattern
    this.ctx.fillStyle = station.color;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;

    // Draw square
    this.ctx.fillRect(center.x - radius, center.y - radius, radius * 2, radius * 2);
    this.ctx.strokeRect(center.x - radius, center.y - radius, radius * 2, radius * 2);

    // Draw cross
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(center.x - radius, center.y);
    this.ctx.lineTo(center.x + radius, center.y);
    this.ctx.moveTo(center.x, center.y - radius);
    this.ctx.lineTo(center.x, center.y + radius);
    this.ctx.stroke();

    // Draw station name
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(station.name, center.x, center.y + radius + 3);
  }

  /**
   * Renders an asteroid.
   */
  private renderAsteroid(asteroid: Asteroid, layout: HexLayout): void {
    const center = hexToPixel(asteroid.position, layout);
    const radius = asteroid.visualRadius * layout.size;

    // Draw asteroid as an irregular polygon
    this.ctx.fillStyle = asteroid.color;
    this.ctx.strokeStyle = '#888888';
    this.ctx.lineWidth = 1;

    // Create irregular shape with random points
    const ASTEROID_SHAPE_VARIANCE = 30; // Controls randomness range for asteroid shapes
    this.ctx.beginPath();
    const points = 6;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      // Add slight randomness to radius (using asteroid id as seed for consistency)
      const hashCode = asteroid.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomFactor = 0.7 + ((hashCode + i) % ASTEROID_SHAPE_VARIANCE) / 100;
      const r = radius * randomFactor;
      const x = center.x + r * Math.cos(angle);
      const y = center.y + r * Math.sin(angle);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  /**
   * Renders gravity arrows for a celestial body (2018 rules).
   * Arrows are in hexes adjacent to the body, pointing toward it.
   */
  private renderGravityArrows(
    body: Sun | Planet,
    layout: HexLayout,
    options: CelestialRenderOptions
  ): void {
    if (!body.gravityHexes || body.gravityHexes.length === 0) {
      return;
    }

    for (const gravityHex of body.gravityHexes) {
      const hexCenter = hexToPixel(gravityHex.position, layout);
      
      // Calculate arrow direction (points toward the body)
      const arrowEndOffset = {
        x: gravityHex.direction.q * layout.size * 0.4,
        y: gravityHex.direction.r * layout.size * 0.4,
      };
      
      const arrowStart = {
        x: hexCenter.x - arrowEndOffset.x,
        y: hexCenter.y - arrowEndOffset.y,
      };
      
      const arrowEnd = {
        x: hexCenter.x + arrowEndOffset.x,
        y: hexCenter.y + arrowEndOffset.y,
      };
      
      // Choose color based on weak vs full gravity
      const color = gravityHex.isWeak 
        ? options.weakGravityArrowColor 
        : options.gravityArrowColor;
      
      // Draw arrow line
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = options.gravityArrowLineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(arrowStart.x, arrowStart.y);
      this.ctx.lineTo(arrowEnd.x, arrowEnd.y);
      this.ctx.stroke();
      
      // Draw arrowhead
      const arrowHeadLength = layout.size * 0.15;
      const angle = Math.atan2(arrowEndOffset.y, arrowEndOffset.x);
      
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(arrowEnd.x, arrowEnd.y);
      this.ctx.lineTo(
        arrowEnd.x - arrowHeadLength * Math.cos(angle - Math.PI / 6),
        arrowEnd.y - arrowHeadLength * Math.sin(angle - Math.PI / 6)
      );
      this.ctx.lineTo(
        arrowEnd.x - arrowHeadLength * Math.cos(angle + Math.PI / 6),
        arrowEnd.y - arrowHeadLength * Math.sin(angle + Math.PI / 6)
      );
      this.ctx.closePath();
      this.ctx.fill();
    }
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
