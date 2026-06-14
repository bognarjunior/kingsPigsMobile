import { TILEMAP_KEY } from '@/constants/keys'
import type { LevelContent, LevelDefinition } from '@/types/level'

import { level2 } from './level2'

// Levels authored as compact definitions are built at runtime by LevelBuilder.
// (level1 is still a hand-authored Tiled JSON loaded in BootScene.)
export const LEVEL_DEFINITIONS: Readonly<Record<string, LevelDefinition>> = {
  [TILEMAP_KEY.LEVEL2]: level2,
}

export const LEVEL_CONTENT: Readonly<Record<string, LevelContent>> = {
  // sandbox: one of every enemy type spread along the floor, harmless (safe), so the
  // King can walk up and watch each animation — cannon pig, melee, bomb/box throwers,
  // crate ambush, and a boss
  [TILEMAP_KEY.LEVEL1]: {
    safe: true,
    enemies: [
      { type: 'pig', col: 12, row: 13, patrol: 2, tier: 0 }, // mans the cannon at col 10
      { type: 'pig', col: 17, row: 13, patrol: 2, tier: 1 }, // plain melee (white tier)
      { type: 'thrower', col: 23, row: 13, patrol: 2, tier: 0 }, // grabs the bomb at col 21
      { type: 'thrower', col: 30, row: 13, patrol: 2, tier: 2 }, // grabs the box at col 28 (blue tier)
    ],
    boxes: [
      { col: 28, row: 13, loot: { kind: 'empty' } }, // box thrower's ammo
      { col: 36, row: 13, loot: { kind: 'diamonds', amount: 1 } }, // camouflage for the crate ambush
      { col: 38, row: 13, loot: { kind: 'heart' } }, // camouflage for the crate ambush
    ],
    bombSupply: [{ col: 21, row: 13 }], // bomb thrower's ammo
    cannons: [{ col: 10, row: 13, facing: 'left' }],
    boxPigs: [{ type: 'pig', col: 37, row: 13, patrol: 2, tier: 0 }], // crate ambush, hatches a basic pig
    doorWaves: [],
    bosses: [{ col: 44, row: 13, patrol: 2, tier: 3, contactDamage: 0 }],
  },
  [TILEMAP_KEY.LEVEL2]: {
    enemies: [],
    boxes: [],
    bombSupply: [],
    cannons: [],
    boxPigs: [],
    doorWaves: [],
    bosses: [],
  },
}

const EMPTY_CONTENT: LevelContent = {
  enemies: [],
  boxes: [],
  bombSupply: [],
  cannons: [],
  boxPigs: [],
  doorWaves: [],
  bosses: [],
}

export function levelContent(key: string): LevelContent {
  return LEVEL_CONTENT[key] ?? EMPTY_CONTENT
}

export const LEVEL_SEQUENCE: readonly string[] = [TILEMAP_KEY.LEVEL1, TILEMAP_KEY.LEVEL2]

export function nextLevelKey(current: string): string {
  const index = LEVEL_SEQUENCE.indexOf(current)
  return LEVEL_SEQUENCE[(index + 1) % LEVEL_SEQUENCE.length]
}

export function previousLevelKey(current: string): string | null {
  const index = LEVEL_SEQUENCE.indexOf(current)
  return index <= 0 ? null : LEVEL_SEQUENCE[index - 1]
}
