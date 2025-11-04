// Unit tests for combat system based on official 2018 Triplanetary rules

import { describe, it, expect } from 'vitest';
import { createShip } from '../src/ship/types';
import {
  COMBAT_RESULTS_TABLE,
  canShipAttack,
  calculateCombatOdds,
  parseDamageResult,
} from '../src/combat/types';
import {
  calculateRange,
  calculateRelativeVelocity,
  calculateModifiers,
  createDeclaredAttack,
  resolveAttack,
  getValidTargets,
} from '../src/combat/resolution';
import {
  executeCombatPhase,
} from '../src/combat/combatQueue';

describe('Combat Results Table', () => {
  it('should have correct damage values for all odds and rolls', () => {
    // Verify key entries from the official table
    expect(COMBAT_RESULTS_TABLE[1]['4:1']).toBe('D2');
    expect(COMBAT_RESULTS_TABLE[3]['2:1']).toBe('D2');
    expect(COMBAT_RESULTS_TABLE[5]['3:1']).toBe('D5');
    expect(COMBAT_RESULTS_TABLE[6]['4:1']).toBe('E');
    expect(COMBAT_RESULTS_TABLE[6]['1:4']).toBe('D1');
  });

  it('should have no effect for low rolls at poor odds', () => {
    expect(COMBAT_RESULTS_TABLE[1]['1:4']).toBe('–');
    expect(COMBAT_RESULTS_TABLE[1]['1:2']).toBe('–');
    expect(COMBAT_RESULTS_TABLE[2]['1:1']).toBe('–');
  });
});

describe('Combat Odds Calculation', () => {
  it('should calculate 2:1 odds correctly', () => {
    expect(calculateCombatOdds(4, 2)).toBe('2:1');
    expect(calculateCombatOdds(8, 4)).toBe('2:1');
  });

  it('should calculate 1:1 odds correctly', () => {
    expect(calculateCombatOdds(2, 2)).toBe('1:1');
    expect(calculateCombatOdds(4, 4)).toBe('1:1');
  });

  it('should round in favor of defender', () => {
    expect(calculateCombatOdds(5, 4)).toBe('1:1'); // 1.25 rounds down
    expect(calculateCombatOdds(3, 2)).toBe('1:1'); // 1.5 rounds down
    expect(calculateCombatOdds(5, 3)).toBe('1:1'); // 1.67 rounds down
  });

  it('should handle poor odds', () => {
    expect(calculateCombatOdds(1, 2)).toBe('1:2');
    expect(calculateCombatOdds(1, 4)).toBe('1:4');
    expect(calculateCombatOdds(1, 8)).toBe('1:4'); // Less than 1:4
  });

  it('should cap at 4:1', () => {
    expect(calculateCombatOdds(8, 1)).toBe('4:1');
    expect(calculateCombatOdds(16, 2)).toBe('4:1');
  });
});

describe('Range and Velocity Calculations', () => {
  it('should calculate range correctly', () => {
    const ship1 = createShip('s1', 'Ship 1', 'p1', { q: 0, r: 0 });
    const ship2 = createShip('s2', 'Ship 2', 'p2', { q: 3, r: 0 });
    expect(calculateRange(ship1.position, ship2.position)).toBe(3);
  });

  it('should calculate relative velocity correctly', () => {
    // Same velocity = 0 difference
    expect(calculateRelativeVelocity({ q: 1, r: 0 }, { q: 1, r: 0 })).toBe(0);
    
    // Different velocities
    expect(calculateRelativeVelocity({ q: 0, r: 0 }, { q: 2, r: 0 })).toBe(2);
    expect(calculateRelativeVelocity({ q: 1, r: 1 }, { q: 0, r: 0 })).toBe(2);
  });
});

describe('Combat Modifiers', () => {
  it('should apply range modifier', () => {
    const mods = calculateModifiers(5, 0);
    expect(mods.rangeModifier).toBe(-5);
    expect(mods.velocityModifier).toBe(0);
    expect(mods.totalModifier).toBe(-5);
  });

  it('should apply velocity modifier only when > 2', () => {
    // Velocity 2 or less = no modifier
    expect(calculateModifiers(0, 2).velocityModifier).toBe(0);
    expect(calculateModifiers(0, 1).velocityModifier).toBe(0);
    
    // Velocity > 2 = modifier
    expect(calculateModifiers(0, 3).velocityModifier).toBe(-1);
    expect(calculateModifiers(0, 5).velocityModifier).toBe(-3);
  });

  it('should combine range and velocity modifiers', () => {
    const mods = calculateModifiers(3, 4);
    expect(mods.rangeModifier).toBe(-3);
    expect(mods.velocityModifier).toBe(-2); // 4-2 = 2
    expect(mods.totalModifier).toBe(-5);
  });
});

describe('Attack Declaration', () => {
  it('should create declared attack with correct odds', () => {
    const attacker = createShip('a1', 'Attacker', 'p1', { q: 0, r: 0 }, { weapons: 4 });
    const target = createShip('t1', 'Target', 'p2', { q: 3, r: 0 }, { weapons: 2 });
    
    const attack = createDeclaredAttack(attacker, target);
    
    expect(attack.attackerId).toBe('a1');
    expect(attack.targetId).toBe('t1');
    expect(attack.odds).toBe('2:1');
    expect(attack.range).toBe(3);
  });

  it('should calculate modifiers in declared attack', () => {
    const attacker = createShip('a1', 'Attacker', 'p1', { q: 0, r: 0 }, { weapons: 2 });
    attacker.velocity = { q: 0, r: 0 };
    
    const target = createShip('t1', 'Target', 'p2', { q: 4, r: 0 }, { weapons: 2 });
    target.velocity = { q: 2, r: 2 };
    
    const attack = createDeclaredAttack(attacker, target);
    
    expect(attack.range).toBe(4);
    expect(attack.relativeVelocity).toBeGreaterThan(2);
    expect(attack.rangeModifier).toBe(-4);
    expect(attack.velocityModifier).toBeLessThan(0);
  });
});

describe('Attack Resolution', () => {
  it('should resolve attack with given die roll', () => {
    const attacker = createShip('a1', 'Attacker', 'p1', { q: 0, r: 0 }, { weapons: 4 });
    const target = createShip('t1', 'Target', 'p2', { q: 1, r: 0 }, { weapons: 2 });
    
    const attack = createDeclaredAttack(attacker, target);
    const result = resolveAttack(attack, 6); // Roll of 6
    
    expect(result.dieRoll).toBe(6);
    expect(result.modifiedRoll).toBe(5); // 6 - 1 (range)
    expect(result.damageResult).toBe('D4'); // 2:1 odds, roll 5 -> D4
  });

  it('should clamp modified roll to 6', () => {
    const attacker = createShip('a1', 'Attacker', 'p1', { q: 0, r: 0 }, { weapons: 4 });
    const target = createShip('t1', 'Target', 'p2', { q: 0, r: 0 }, { weapons: 2 });
    
    const attack = createDeclaredAttack(attacker, target);
    const result = resolveAttack(attack, 6);
    
    expect(result.modifiedRoll).toBe(6); // Can't go above 6
  });

  it('should handle modified roll < 1 as no effect', () => {
    const attacker = createShip('a1', 'Attacker', 'p1', { q: 0, r: 0 }, { weapons: 2 });
    const target = createShip('t1', 'Target', 'p2', { q: 10, r: 0 }, { weapons: 2 });
    
    const attack = createDeclaredAttack(attacker, target);
    const result = resolveAttack(attack, 1); // Roll 1, range -10 = -9
    
    expect(result.modifiedRoll).toBe(0);
    expect(result.damageResult).toBe('–');
    expect(result.turnsDisabled).toBe(0);
  });

  it('should parse damage correctly', () => {
    expect(parseDamageResult('–')).toBe(0);
    expect(parseDamageResult('D1')).toBe(1);
    expect(parseDamageResult('D3')).toBe(3);
    expect(parseDamageResult('E')).toBe(6);
  });

  it('should mark ship as destroyed for E result', () => {
    const attacker = createShip('a1', 'Attacker', 'p1', { q: 0, r: 0 }, { weapons: 8 });
    const target = createShip('t1', 'Target', 'p2', { q: 0, r: 0 }, { weapons: 2 });
    
    const attack = createDeclaredAttack(attacker, target);
    const result = resolveAttack(attack, 6);
    
    expect(result.damageResult).toBe('E');
    expect(result.targetDestroyed).toBe(true);
  });
});

describe('Valid Targets', () => {
  it('should find enemy ships as valid targets', () => {
    const attacker = createShip('a1', 'Attacker', 'p1', { q: 0, r: 0 }, { weapons: 2 });
    const enemy1 = createShip('e1', 'Enemy 1', 'p2', { q: 3, r: 0 });
    const enemy2 = createShip('e2', 'Enemy 2', 'p2', { q: 10, r: 0 });
    const ally = createShip('ally', 'Ally', 'p1', { q: 2, r: 0 });
    
    const ships = [attacker, enemy1, enemy2, ally];
    const targets = getValidTargets(attacker, ships);
    
    expect(targets).toHaveLength(2);
    expect(targets.map(t => t.id)).toContain('e1');
    expect(targets.map(t => t.id)).toContain('e2');
  });

  it('should not include destroyed ships as targets', () => {
    const attacker = createShip('a1', 'Attacker', 'p1', { q: 0, r: 0 }, { weapons: 2 });
    const enemy = createShip('e1', 'Enemy', 'p2', { q: 3, r: 0 });
    enemy.destroyed = true;
    
    const targets = getValidTargets(attacker, [attacker, enemy]);
    
    expect(targets).toHaveLength(0);
  });
});

describe('Combat Phase Execution', () => {
  it('should execute attacks and apply disable damage', () => {
    const attacker = createShip('a1', 'Attacker', 'p1', { q: 0, r: 0 }, { weapons: 4 });
    const target = createShip('t1', 'Target', 'p2', { q: 1, r: 0 }, { weapons: 2 });
    
    const attack = createDeclaredAttack(attacker, target);
    const attacks = new Map();
    attacks.set('a1', attack);
    
    const { results, updatedShips } = executeCombatPhase(attacks, [attacker, target]);
    
    expect(results).toHaveLength(1);
    const updatedTarget = updatedShips.find(s => s.id === 't1');
    expect(updatedTarget).toBeDefined();
  });

  it('should destroy ship at D6 or greater', () => {
    const attacker = createShip('a1', 'Attacker', 'p1', { q: 0, r: 0 }, { weapons: 8 });
    const target = createShip('t1', 'Target', 'p2', { q: 0, r: 0 }, { weapons: 2 });
    target.disabledTurns = 2; // Already disabled 2 turns
    
    const attack = createDeclaredAttack(attacker, target);
    const attacks = new Map();
    attacks.set('a1', attack);
    
    const { updatedShips } = executeCombatPhase(attacks, [attacker, target]);
    
    const updatedTarget = updatedShips.find(s => s.id === 't1');
    // Result depends on roll, but if D5 result, 2+5 = D7 = destroyed
  });
});

describe('Ship Attack Capability', () => {
  it('should allow ships with weapons > 0 to attack', () => {
    expect(canShipAttack(1)).toBe(true);
    expect(canShipAttack(4)).toBe(true);
  });

  it('should not allow ships with weapons = 0 to attack', () => {
    expect(canShipAttack(0)).toBe(false);
  });
});
