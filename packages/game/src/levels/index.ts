import { TILEMAP_KEY } from '@/constants/keys'
import type { LevelContent, LevelDefinition } from '@/types/level'

import { level2 } from './level2'
import { level3 } from './level3'

// Levels authored as compact definitions are built at runtime by LevelBuilder.
// (level1 is still a hand-authored Tiled JSON loaded in BootScene.)
export const LEVEL_DEFINITIONS: Readonly<Record<string, LevelDefinition>> = {
  [TILEMAP_KEY.LEVEL2]: level2,
  [TILEMAP_KEY.LEVEL3]: level3,
}

export const LEVEL_CONTENT: Readonly<Record<string, LevelContent>> = {
  // L1 — tutorial: break a couple of crates for loot and fight two slow green pigs on
  // the way to the exit door. No throwers/cannon/boss yet (those arrive in L2/L3).
  [TILEMAP_KEY.LEVEL1]: {
    enemies: [
      { type: 'pig', col: 20, row: 13, patrol: 3, tier: 0 },
      { type: 'pig', col: 34, row: 13, patrol: 3, tier: 0 },
    ],
    boxes: [
      { col: 11, row: 13, loot: { kind: 'heart' } },
      { col: 27, row: 13, loot: { kind: 'diamonds', amount: 3 } },
      { col: 43, row: 13, loot: { kind: 'empty' } },
    ],
    bombSupply: [],
    cannons: [],
    boxPigs: [],
    doorWaves: [],
    bosses: [],
  },
  // L2 — mechanics: meet the threats one at a time — a melee pig, a bomb thrower, a
  // box thrower, a manned cannon, and a crate ambush — at tiers 0–1.
  [TILEMAP_KEY.LEVEL2]: {
    enemies: [
      { type: 'pig', col: 9, row: 13, patrol: 2, tier: 0 },
      { type: 'thrower', col: 14, row: 13, patrol: 2, tier: 1 }, // grabs the bomb at col 12
      { type: 'thrower', col: 22, row: 13, patrol: 2, tier: 1 }, // grabs the box at col 20
      { type: 'pig', col: 32, row: 13, patrol: 2, tier: 0 }, // mans the cannon at col 30
    ],
    boxes: [
      { col: 6, row: 13, loot: { kind: 'heart' } },
      { col: 20, row: 13, loot: { kind: 'empty' } }, // box thrower ammo
      { col: 26, row: 13, loot: { kind: 'diamonds', amount: 3 } },
      { col: 37, row: 13, loot: { kind: 'diamonds', amount: 1 } }, // crate-ambush camouflage
      { col: 39, row: 13, loot: { kind: 'heart' } }, // crate-ambush camouflage
    ],
    bombSupply: [{ col: 12, row: 13 }], // bomb thrower ammo
    cannons: [{ col: 30, row: 13, facing: 'left' }],
    boxPigs: [{ type: 'pig', col: 38, row: 13, patrol: 2, tier: 1 }],
    doorWaves: [],
    bosses: [],
  },
  // L3 — mini-boss: a short approach (one melee, one thrower) into the King Pig arena.
  // The boss summons a pair of pigs once it drops below half health.
  [TILEMAP_KEY.LEVEL3]: {
    enemies: [
      { type: 'pig', col: 8, row: 13, patrol: 2, tier: 1 },
      { type: 'thrower', col: 13, row: 13, patrol: 2, tier: 1 }, // grabs the bomb at col 11
    ],
    boxes: [
      { col: 5, row: 13, loot: { kind: 'heart' } },
      { col: 33, row: 13, loot: { kind: 'diamonds', amount: 5 } },
    ],
    bombSupply: [{ col: 11, row: 13 }],
    cannons: [],
    boxPigs: [],
    doorWaves: [],
    bosses: [
      {
        col: 26,
        row: 13,
        patrol: 3,
        tier: 1,
        summons: [
          {
            atHealthBelow: 0.5,
            minions: [
              { type: 'pig', col: 20, row: 13, patrol: 2, tier: 1 },
              { type: 'pig', col: 30, row: 13, patrol: 2, tier: 1 },
            ],
          },
        ],
      },
    ],
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

export const LEVEL_SEQUENCE: readonly string[] = [TILEMAP_KEY.LEVEL1, TILEMAP_KEY.LEVEL2, TILEMAP_KEY.LEVEL3]

export function nextLevelKey(current: string): string {
  const index = LEVEL_SEQUENCE.indexOf(current)
  return LEVEL_SEQUENCE[(index + 1) % LEVEL_SEQUENCE.length]
}

export function previousLevelKey(current: string): string | null {
  const index = LEVEL_SEQUENCE.indexOf(current)
  return index <= 0 ? null : LEVEL_SEQUENCE[index - 1]
}
