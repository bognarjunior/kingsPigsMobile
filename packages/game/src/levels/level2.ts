import type { LevelDefinition } from '@/types/level'

// L2 — mechanics hall: a long flat room (floor at row 13) with two ledges to break
// line of sight. Wide enough to space out the throwers, the cannon and the crate
// ambush so each threat reads on its own. Geometry stays simple on purpose so the
// content placement is reliable; the prettier castle layout is a later polish pass.
export const level2: LevelDefinition = {
  width: 46,
  height: 14,
  rooms: [{ left: 1, top: 2, right: 44, bottom: 12 }],
  stalactites: [{ col: 24, top: 2, bottom: 3, width: 2 }],
  stalagmites: [],
  planks: [
    { row: 9, from: 15, to: 19, material: 'wood' },
    { row: 8, from: 30, to: 34, material: 'brick' },
  ],
  decorations: [
    { kind: 'window', col: 6, row: 4 },
    { kind: 'flag', col: 41, row: 4 },
  ],
  spawns: {
    player: { col: 2, row: 13 },
    entryDoor: { col: 2, row: 13 },
    exitDoor: { col: 43, row: 13 },
  },
}
