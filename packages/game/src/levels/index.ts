import { TILEMAP_KEY } from '@/constants/keys'
import type { LevelContent, LevelDefinition } from '@/types/level'

import { level2 } from './level2'

// Levels authored as compact definitions are built at runtime by LevelBuilder.
// (level1 is still a hand-authored Tiled JSON loaded in BootScene.)
export const LEVEL_DEFINITIONS: Readonly<Record<string, LevelDefinition>> = {
  [TILEMAP_KEY.LEVEL2]: level2,
}

// Everything that populates a level lives here, kept apart from the map source so
// it works whether the geometry is a JSON file or built by LevelBuilder.
//   enemies    — pig placements (col/row + patrol radius in tiles)
//   boxes      — breakable crates on the floor row; the King smashes them for loot
//   bombSupply — loose bombs a bomb pig hunts, picks up to re-arm, then throws
export const LEVEL_CONTENT: Readonly<Record<string, LevelContent>> = {
  [TILEMAP_KEY.LEVEL1]: {
    enemies: [{ type: 'pig', col: 10, row: 13, patrol: 2, tier: 0 }],
    boxes: [
      { col: 16, row: 13, loot: { kind: 'diamonds', amount: 1 } },
      { col: 22, row: 13, loot: { kind: 'heart' } },
      { col: 28, row: 13, loot: { kind: 'empty' } },
      { col: 34, row: 13, loot: { kind: 'diamonds', amount: 1 } },
    ],
    bombSupply: [],
    cannons: [],
    // disguised among the loot crates above — the King can't tell which is which
    boxPigs: [
      { col: 19, row: 13 },
      { col: 31, row: 13 },
    ],
  },
  [TILEMAP_KEY.LEVEL2]: {
    enemies: [
      { type: 'pig', col: 16, row: 15, patrol: 2 },
      { type: 'pig', col: 28, row: 15, patrol: 1 },
    ],
    boxes: [],
    bombSupply: [],
    cannons: [],
    boxPigs: [],
  },
}

const EMPTY_CONTENT: LevelContent = { enemies: [], boxes: [], bombSupply: [], cannons: [], boxPigs: [] }

export function levelContent(key: string): LevelContent {
  return LEVEL_CONTENT[key] ?? EMPTY_CONTENT
}

// Play order; the exit door advances to the next level (wrapping to the first).
export const LEVEL_SEQUENCE: readonly string[] = [TILEMAP_KEY.LEVEL1, TILEMAP_KEY.LEVEL2]

export function nextLevelKey(current: string): string {
  const index = LEVEL_SEQUENCE.indexOf(current)
  return LEVEL_SEQUENCE[(index + 1) % LEVEL_SEQUENCE.length]
}

// previous level for the back door; null on the first level (no way back)
export function previousLevelKey(current: string): string | null {
  const index = LEVEL_SEQUENCE.indexOf(current)
  return index <= 0 ? null : LEVEL_SEQUENCE[index - 1]
}
