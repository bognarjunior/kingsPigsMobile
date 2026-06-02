import { TILEMAP_KEY } from '@/constants/keys'
import type { EnemySpawn } from '@/types/enemy'
import type { LevelDefinition, SpawnTile } from '@/types/level'

import { level2 } from './level2'

// Levels authored as compact definitions are built at runtime by LevelBuilder.
// (level1 is still a hand-authored Tiled JSON loaded in BootScene.)
export const LEVEL_DEFINITIONS: Readonly<Record<string, LevelDefinition>> = {
  [TILEMAP_KEY.LEVEL2]: level2,
}

// Enemy placements per level — kept apart from the tilemap source so a level can
// have enemies whether its map comes from a JSON file or from the LevelBuilder.
export const LEVEL_ENEMIES: Readonly<Record<string, readonly EnemySpawn[]>> = {
  [TILEMAP_KEY.LEVEL1]: [{ type: 'pig', col: 10, row: 13, patrol: 3 }],
  [TILEMAP_KEY.LEVEL2]: [
    { type: 'pig', col: 16, row: 15, patrol: 2 },
    { type: 'pig', col: 28, row: 15, patrol: 1 },
  ],
}

// Heart pickups (raise the King's max hearts). row = the floor row the King
// stands on; the heart floats just above it. Test heart in level 1.
export const LEVEL_PICKUPS: Readonly<Record<string, readonly SpawnTile[]>> = {
  // a test row of 10 hearts in level 1: heal as you go, and the 10th raises the max
  [TILEMAP_KEY.LEVEL1]: [13, 16, 19, 22, 25, 28, 31, 34, 37, 40].map((col) => ({ col, row: 13 })),
}

// Play order; the exit door advances to the next level (wrapping to the first).
export const LEVEL_SEQUENCE: readonly string[] = [TILEMAP_KEY.LEVEL1, TILEMAP_KEY.LEVEL2]

export function nextLevelKey(current: string): string {
  const index = LEVEL_SEQUENCE.indexOf(current)
  return LEVEL_SEQUENCE[(index + 1) % LEVEL_SEQUENCE.length]
}
