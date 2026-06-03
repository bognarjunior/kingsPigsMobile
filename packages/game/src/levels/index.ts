import { TILEMAP_KEY } from '@/constants/keys'
import type { EnemySpawn } from '@/types/enemy'
import type { LevelDefinition, PickupSpawn, SpawnTile } from '@/types/level'

import { level2 } from './level2'

// Levels authored as compact definitions are built at runtime by LevelBuilder.
// (level1 is still a hand-authored Tiled JSON loaded in BootScene.)
export const LEVEL_DEFINITIONS: Readonly<Record<string, LevelDefinition>> = {
  [TILEMAP_KEY.LEVEL2]: level2,
}

// Enemy placements per level — kept apart from the tilemap source so a level can
// have enemies whether its map comes from a JSON file or from the LevelBuilder.
export const LEVEL_ENEMIES: Readonly<Record<string, readonly EnemySpawn[]>> = {
  [TILEMAP_KEY.LEVEL1]: [
    { type: 'pig', col: 10, row: 13, patrol: 3 },
    { type: 'bomb', col: 30, row: 13, patrol: 2 },
  ],
  [TILEMAP_KEY.LEVEL2]: [
    { type: 'pig', col: 16, row: 15, patrol: 2 },
    { type: 'pig', col: 28, row: 15, patrol: 1 },
  ],
}

// Collectibles per level. row = the floor row the King stands on; the pickup
// floats just above it. Hearts heal/raise the max; diamonds increment the score.
export const LEVEL_PICKUPS: Readonly<Record<string, readonly PickupSpawn[]>> = {
  [TILEMAP_KEY.LEVEL1]: [
    ...[13, 16, 19, 22, 25, 28, 31, 34, 37, 40].map((col) => ({ kind: 'heart' as const, col, row: 13 })),
    ...[11, 31, 44].map((col) => ({ kind: 'diamond' as const, col, row: 11 })),
  ],
}

// Loose bombs scattered on the floor (floor row); a bomb pig hunts the nearest
// one, picks it up to re-arm, throws it, then goes looking for another.
export const LEVEL_BOMB_SUPPLY: Readonly<Record<string, readonly SpawnTile[]>> = {
  [TILEMAP_KEY.LEVEL1]: [18, 26, 36, 42].map((col) => ({ col, row: 13 })),
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
