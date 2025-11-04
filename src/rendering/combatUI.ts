// UI elements for Combat Phase display

import { Ship } from '../ship/types';
import { DeclaredAttack, CombatLogEntry } from '../combat/types';

export interface CombatUIButton {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  enabled: boolean;
  action: 'declare-attack' | 'cancel-attack' | 'end-combat';
}

export interface TargetIndicator {
  shipId: string;
  x: number;
  y: number;
  radius: number;
  inRange: boolean;
  selected: boolean;
}

export interface CombatUILayout {
  // Selected ship info panel
  shipInfoX: number;
  shipInfoY: number;
  shipInfoWidth: number;
  shipInfoHeight: number;
  
  // Target selection
  targetIndicators: TargetIndicator[];
  
  // Attack info panel (when target selected)
  attackInfoX: number;
  attackInfoY: number;
  attackInfoWidth: number;
  attackInfoHeight: number;
  attackInfoVisible: boolean;
  
  // Attack declaration button
  declareAttackButton: CombatUIButton | null;
  
  // Cancel attack button (if attack already declared)
  cancelAttackButton: CombatUIButton | null;
  
  // End combat phase button
  endCombatButton: CombatUIButton;
  
  // Combat log display
  combatLogX: number;
  combatLogY: number;
  combatLogWidth: number;
  combatLogHeight: number;
  combatLogEntries: string[];
}

/**
 * Create the Combat Phase UI layout
 */
export function createCombatUILayout(
  canvasWidth: number,
  canvasHeight: number,
  selectedShip: Ship | null,
  potentialTargets: Ship[],
  selectedTarget: Ship | null,
  declaredAttack: DeclaredAttack | null,
  combatLog: CombatLogEntry[],
  hexToPixel: (q: number, r: number) => { x: number; y: number }
): CombatUILayout {
  const padding = 10;
  const buttonHeight = 40;
  const buttonWidth = 180;
  
  // Position ship info in bottom-left corner
  const shipInfoWidth = 250;
  const shipInfoHeight = 150;
  const shipInfoX = padding;
  const shipInfoY = canvasHeight - shipInfoHeight - padding;
  
  // Target indicators for each potential target
  const targetIndicators: TargetIndicator[] = potentialTargets.map(target => {
    const pos = hexToPixel(target.position.q, target.position.r);
    return {
      shipId: target.id,
      x: pos.x,
      y: pos.y,
      radius: 20,
      inRange: true,
      selected: selectedTarget?.id === target.id,
    };
  });
  
  // Attack info panel in bottom-center (visible when target selected)
  const attackInfoWidth = 350;
  const attackInfoHeight = 180;
  const attackInfoX = (canvasWidth - attackInfoWidth) / 2;
  const attackInfoY = canvasHeight - attackInfoHeight - padding;
  const attackInfoVisible = selectedShip !== null && selectedTarget !== null;
  
  // Declare attack button (visible when target and weapon selected, no attack declared yet)
  let declareAttackButton: CombatUIButton | null = null;
  if (attackInfoVisible && !declaredAttack) {
    declareAttackButton = {
      x: attackInfoX + (attackInfoWidth - buttonWidth) / 2,
      y: attackInfoY + attackInfoHeight - buttonHeight - 10,
      width: buttonWidth,
      height: buttonHeight,
      text: 'Declare Attack',
      enabled: true,
      action: 'declare-attack',
    };
  }
  
  // Cancel attack button (visible when attack already declared)
  let cancelAttackButton: CombatUIButton | null = null;
  if (declaredAttack) {
    cancelAttackButton = {
      x: shipInfoX,
      y: shipInfoY + shipInfoHeight + 10,
      width: buttonWidth,
      height: buttonHeight,
      text: 'Cancel Attack',
      enabled: true,
      action: 'cancel-attack',
    };
  }
  
  // End combat phase button in bottom-right
  const endCombatButton: CombatUIButton = {
    x: canvasWidth - buttonWidth - padding,
    y: canvasHeight - buttonHeight - padding,
    width: buttonWidth,
    height: buttonHeight,
    text: 'End Combat Phase',
    enabled: true,
    action: 'end-combat',
  };
  
  // Combat log in top-left
  const combatLogWidth = 400;
  const combatLogHeight = 200;
  const combatLogX = padding;
  const combatLogY = padding + 200; // Below turn UI
  
  // Get last 5 combat log entries
  const combatLogEntries = combatLog
    .slice(-5)
    .map(entry => entry.message);
  
  return {
    shipInfoX,
    shipInfoY,
    shipInfoWidth,
    shipInfoHeight,
    targetIndicators,
    attackInfoX,
    attackInfoY,
    attackInfoWidth,
    attackInfoHeight,
    attackInfoVisible,
    declareAttackButton,
    cancelAttackButton,
    endCombatButton,
    combatLogX,
    combatLogY,
    combatLogWidth,
    combatLogHeight,
    combatLogEntries,
  };
}

/**
 * Get text for attack info panel
 * Shows combat odds and modifiers per official Triplanetary rules
 */
export function getAttackInfoText(attack: DeclaredAttack): string[] {
  const lines: string[] = [];
  lines.push(`Combat Odds: ${attack.odds}`);
  lines.push(`Attacker Strength: ${attack.attackerStrength}`);
  lines.push(`Defender Strength: ${attack.defenderStrength}`);
  lines.push('');
  lines.push(`Range: ${attack.range} hexes`);
  lines.push(`Relative Velocity: ${attack.relativeVelocity.toFixed(1)} hexes`);
  lines.push('');
  lines.push('Die Roll Modifiers:');
  lines.push(`  Range: ${attack.rangeModifier >= 0 ? '+' : ''}${attack.rangeModifier}`);
  lines.push(`  Velocity: ${attack.velocityModifier >= 0 ? '+' : ''}${attack.velocityModifier}`);
  lines.push(`  Total: ${attack.totalModifier >= 0 ? '+' : ''}${attack.totalModifier}`);
  return lines;
}
