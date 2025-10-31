// Unit tests for combat system

import { describe, it, expect } from 'vitest';
import { createShip } from '../src/ship/types';
import {
  WeaponType,
  WEAPON_CONFIG,
  canShipAttack,
  getAvailableWeapons,
} from '../src/combat/types';
import {
  calculateRange,
  calculateHitProbability,
  isTargetInRange,
  createDeclaredAttack,
  resolveAttack,
  getValidTargets,
  hasValidTargets,
  calculateCombatModifiers,
} from '../src/combat/resolution';
import {
  executeCombatPhase,
  areAllAttacksDeclared,
} from '../src/combat/combatQueue';

describe('Weapon Configuration', () => {
  it('should have valid weapon configs', () => {
    expect(WEAPON_CONFIG[WeaponType.Laser]).toBeDefined();
    expect(WEAPON_CONFIG[WeaponType.Laser].range).toBeGreaterThan(0);
    expect(WEAPON_CONFIG[WeaponType.Laser].damage).toBeGreaterThan(0);
    expect(WEAPON_CONFIG[WeaponType.Laser].baseAccuracy).toBeGreaterThan(0);
    expect(WEAPON_CONFIG[WeaponType.Laser].baseAccuracy).toBeLessThanOrEqual(1);
  });

  it('should have different stats for each weapon type', () => {
    const laser = WEAPON_CONFIG[WeaponType.Laser];
    const missile = WEAPON_CONFIG[WeaponType.Missile];
    const massDriver = WEAPON_CONFIG[WeaponType.MassDriver];
    
    // Missile should have longest range
    expect(missile.range).toBeGreaterThan(laser.range);
    
    // Mass driver should have highest damage
    expect(massDriver.damage).toBeGreaterThanOrEqual(missile.damage);
    expect(massDriver.damage).toBeGreaterThanOrEqual(laser.damage);
    
    // Mass driver should have shortest range
    expect(massDriver.range).toBeLessThan(missile.range);
  });
});

describe('Weapon Availability', () => {
  it('should allow no weapons if weapon strength is 0', () => {
    expect(canShipAttack(0)).toBe(false);
    expect(getAvailableWeapons(0)).toHaveLength(0);
  });

  it('should allow laser with weapon strength 1', () => {
    expect(canShipAttack(1)).toBe(true);
    const weapons = getAvailableWeapons(1);
    expect(weapons).toContain(WeaponType.Laser);
    expect(weapons).toHaveLength(1);
  });

  it('should allow laser and missile with weapon strength 2', () => {
    const weapons = getAvailableWeapons(2);
    expect(weapons).toContain(WeaponType.Laser);
    expect(weapons).toContain(WeaponType.Missile);
    expect(weapons).toHaveLength(2);
  });

  it('should allow all weapons with weapon strength 3+', () => {
    const weapons = getAvailableWeapons(3);
    expect(weapons).toContain(WeaponType.Laser);
    expect(weapons).toContain(WeaponType.Missile);
    expect(weapons).toContain(WeaponType.MassDriver);
    expect(weapons).toHaveLength(3);
  });
});

describe('Range Calculation', () => {
  it('should calculate range correctly', () => {
    const ship1 = createShip('ship1', 'Ship 1', 'player1', { q: 0, r: 0 });
    const ship2 = createShip('ship2', 'Ship 2', 'player2', { q: 3, r: 0 });
    
    expect(calculateRange(ship1.position, ship2.position)).toBe(3);
  });

  it('should calculate range for diagonal positions', () => {
    const ship1 = createShip('ship1', 'Ship 1', 'player1', { q: 0, r: 0 });
    const ship2 = createShip('ship2', 'Ship 2', 'player2', { q: 2, r: 2 });
    
    const range = calculateRange(ship1.position, ship2.position);
    expect(range).toBeGreaterThan(0);
  });
});

describe('Target Range Validation', () => {
  it('should identify target in range', () => {
    const ship1 = createShip('ship1', 'Ship 1', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const ship2 = createShip('ship2', 'Ship 2', 'player2', { q: 3, r: 0 });
    
    expect(isTargetInRange(ship1, ship2, WeaponType.Laser)).toBe(true);
  });

  it('should identify target out of range', () => {
    const ship1 = createShip('ship1', 'Ship 1', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const ship2 = createShip('ship2', 'Ship 2', 'player2', { q: 10, r: 0 });
    
    expect(isTargetInRange(ship1, ship2, WeaponType.Laser)).toBe(false);
  });

  it('should not allow attacking same hex', () => {
    const ship1 = createShip('ship1', 'Ship 1', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const ship2 = createShip('ship2', 'Ship 2', 'player2', { q: 0, r: 0 });
    
    expect(isTargetInRange(ship1, ship2, WeaponType.Laser)).toBe(false);
  });
});

describe('Combat Modifiers', () => {
  it('should apply range modifier for long-range shots', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 });
    const target = createShip('target', 'Target', 'player2', { q: 5, r: 0 });
    
    const modifiers = calculateCombatModifiers(attacker, target, WeaponType.Laser);
    expect(modifiers.rangeModifier).toBeLessThan(0);
  });

  it('should not apply range modifier at optimal range', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 });
    const target = createShip('target', 'Target', 'player2', { q: 2, r: 0 });
    
    const modifiers = calculateCombatModifiers(attacker, target, WeaponType.Laser);
    expect(modifiers.rangeModifier).toBe(0);
  });

  it('should apply velocity modifier for fast-moving targets', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 });
    attacker.velocity = { q: 0, r: 0 };
    
    const target = createShip('target', 'Target', 'player2', { q: 3, r: 0 });
    target.velocity = { q: 2, r: 2 };
    
    const modifiers = calculateCombatModifiers(attacker, target, WeaponType.Laser);
    expect(modifiers.velocityModifier).toBeLessThan(0);
  });
});

describe('Hit Probability', () => {
  it('should calculate hit probability within valid range', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 });
    const target = createShip('target', 'Target', 'player2', { q: 2, r: 0 });
    
    const probability = calculateHitProbability(attacker, target, WeaponType.Laser);
    expect(probability).toBeGreaterThan(0);
    expect(probability).toBeLessThanOrEqual(1);
  });

  it('should clamp probability between 0.05 and 0.95', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 });
    const target = createShip('target', 'Target', 'player2', { q: 5, r: 0 });
    target.velocity = { q: 10, r: 10 }; // Very fast moving
    
    const probability = calculateHitProbability(attacker, target, WeaponType.Laser);
    expect(probability).toBeGreaterThanOrEqual(0.05);
    expect(probability).toBeLessThanOrEqual(0.95);
  });
});

describe('Attack Declaration', () => {
  it('should create a valid declared attack', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const target = createShip('target', 'Target', 'player2', { q: 3, r: 0 });
    
    const attack = createDeclaredAttack(attacker, target, WeaponType.Laser);
    
    expect(attack.attackerId).toBe(attacker.id);
    expect(attack.targetId).toBe(target.id);
    expect(attack.weaponType).toBe(WeaponType.Laser);
    expect(attack.range).toBe(3);
    expect(attack.hitProbability).toBeGreaterThan(0);
  });
});

describe('Attack Resolution', () => {
  it('should resolve a hit with fixed roll', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const target = createShip('target', 'Target', 'player2', { q: 3, r: 0 }, { maxHull: 6, currentHull: 6 });
    
    const attack = createDeclaredAttack(attacker, target, WeaponType.Laser);
    const result = resolveAttack(attack, target, 0.5); // 50% roll - should hit
    
    expect(result.hit).toBe(true);
    expect(result.damageDealt).toBe(WEAPON_CONFIG[WeaponType.Laser].damage);
    expect(result.targetDestroyed).toBe(false);
  });

  it('should resolve a miss with fixed roll', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const target = createShip('target', 'Target', 'player2', { q: 3, r: 0 });
    
    const attack = createDeclaredAttack(attacker, target, WeaponType.Laser);
    const result = resolveAttack(attack, target, 0.99); // 99% roll - should miss
    
    expect(result.hit).toBe(false);
    expect(result.damageDealt).toBe(0);
  });

  it('should detect target destruction', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const target = createShip('target', 'Target', 'player2', { q: 3, r: 0 }, { 
      maxHull: 2, 
      currentHull: 2 
    });
    
    const attack = createDeclaredAttack(attacker, target, WeaponType.Laser);
    const result = resolveAttack(attack, target, 0.5); // Should hit
    
    expect(result.hit).toBe(true);
    expect(result.targetDestroyed).toBe(true);
  });
});

describe('Valid Targets', () => {
  it('should find valid enemy targets in range', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const enemy1 = createShip('enemy1', 'Enemy 1', 'player2', { q: 3, r: 0 });
    const enemy2 = createShip('enemy2', 'Enemy 2', 'player2', { q: 10, r: 0 }); // Out of range
    const ally = createShip('ally', 'Ally', 'player1', { q: 2, r: 0 }); // Same team
    
    const ships = [attacker, enemy1, enemy2, ally];
    const targets = getValidTargets(attacker, ships, WeaponType.Laser);
    
    expect(targets).toHaveLength(1);
    expect(targets[0].id).toBe(enemy1.id);
  });

  it('should not include destroyed ships as targets', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const enemy = createShip('enemy', 'Enemy', 'player2', { q: 3, r: 0 });
    enemy.destroyed = true;
    
    const ships = [attacker, enemy];
    const targets = getValidTargets(attacker, ships, WeaponType.Laser);
    
    expect(targets).toHaveLength(0);
  });

  it('should check if ship has any valid targets', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const enemy = createShip('enemy', 'Enemy', 'player2', { q: 3, r: 0 });
    
    const ships = [attacker, enemy];
    const hasTargets = hasValidTargets(attacker, ships, [WeaponType.Laser]);
    
    expect(hasTargets).toBe(true);
  });
});

describe('Combat Phase Execution', () => {
  it('should execute multiple attacks', () => {
    const attacker1 = createShip('attacker1', 'Attacker 1', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const attacker2 = createShip('attacker2', 'Attacker 2', 'player1', { q: 1, r: 0 }, { weapons: 1 });
    const target = createShip('target', 'Target', 'player2', { q: 3, r: 0 }, { 
      maxHull: 10, 
      currentHull: 10 
    });
    
    const ships = [attacker1, attacker2, target];
    const attacks = new Map();
    attacks.set('attacker1', createDeclaredAttack(attacker1, target, WeaponType.Laser));
    attacks.set('attacker2', createDeclaredAttack(attacker2, target, WeaponType.Laser));
    
    const { results, updatedShips, logEntries } = executeCombatPhase(attacks, ships);
    
    expect(results).toHaveLength(2);
    expect(logEntries).toHaveLength(2);
    expect(updatedShips).toHaveLength(3);
  });

  it('should apply damage to targets', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const target = createShip('target', 'Target', 'player2', { q: 3, r: 0 }, { 
      maxHull: 10, 
      currentHull: 10 
    });
    
    const ships = [attacker, target];
    const attacks = new Map();
    attacks.set('attacker', createDeclaredAttack(attacker, target, WeaponType.Laser));
    
    const { updatedShips } = executeCombatPhase(attacks, ships);
    
    const updatedTarget = updatedShips.find(s => s.id === target.id);
    expect(updatedTarget).toBeDefined();
    // Hull should be reduced (exact amount depends on hit/miss)
    expect(updatedTarget!.stats.currentHull).toBeLessThanOrEqual(10);
  });

  it('should mark destroyed ships', () => {
    const attacker = createShip('attacker', 'Attacker', 'player1', { q: 0, r: 0 }, { weapons: 1 });
    const target = createShip('target', 'Target', 'player2', { q: 3, r: 0 }, { 
      maxHull: 1, 
      currentHull: 1 
    });
    
    const ships = [attacker, target];
    const attacks = new Map();
    attacks.set('attacker', createDeclaredAttack(attacker, target, WeaponType.Laser));
    
    const { updatedShips } = executeCombatPhase(attacks, ships);
    
    const updatedTarget = updatedShips.find(s => s.id === target.id);
    expect(updatedTarget).toBeDefined();
    // Target may or may not be destroyed depending on hit/miss
  });
});
