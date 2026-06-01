import { TILEMAP_KEY } from '@/constants/keys'
import type { LevelDefinition } from '@/types/level'

import { level2 } from './level2'

// Levels authored as compact definitions are built at runtime by LevelBuilder.
// (level1 is still a hand-authored Tiled JSON loaded in BootScene.)
export const LEVEL_DEFINITIONS: Readonly<Record<string, LevelDefinition>> = {
  [TILEMAP_KEY.LEVEL2]: level2,
}

// Play order; the exit door advances to the next level (wrapping to the first).
export const LEVEL_SEQUENCE: readonly string[] = [TILEMAP_KEY.LEVEL1, TILEMAP_KEY.LEVEL2]

export function nextLevelKey(current: string): string {
  const index = LEVEL_SEQUENCE.indexOf(current)
  return LEVEL_SEQUENCE[(index + 1) % LEVEL_SEQUENCE.length]
}
