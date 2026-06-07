import { TILEMAP_KEY } from '@/constants/keys'
import type { LevelContent, LevelDefinition } from '@/types/level'

import { level2 } from './level2'

// Levels authored as compact definitions are built at runtime by LevelBuilder.
// (level1 is still a hand-authored Tiled JSON loaded in BootScene.)
export const LEVEL_DEFINITIONS: Readonly<Record<string, LevelDefinition>> = {
  [TILEMAP_KEY.LEVEL2]: level2,
}

export const LEVEL_CONTENT: Readonly<Record<string, LevelContent>> = {
  [TILEMAP_KEY.LEVEL1]: {
    enemies: [],
    boxes: [],
    bombSupply: [],
    cannons: [],
    boxPigs: [],
    doorWaves: [],
    // sandbox: one king pig per colour, zero contact damage — movement/hit preview
    bosses: [
      { col: 8, row: 13, patrol: 2, tier: 0, contactDamage: 0 },
      { col: 16, row: 13, patrol: 2, tier: 1, contactDamage: 0 },
      { col: 24, row: 13, patrol: 2, tier: 2, contactDamage: 0 },
      { col: 32, row: 13, patrol: 2, tier: 3, contactDamage: 0 },
      { col: 40, row: 13, patrol: 2, tier: 4, contactDamage: 0 },
    ],
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
