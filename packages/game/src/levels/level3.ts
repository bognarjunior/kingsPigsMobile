import type { LevelDefinition } from '@/types/level'

// L3 — boss arena: a single wide flat hall (floor at row 13) with two symmetric
// ledges to break the King Pig's charge and give the player somewhere to retreat.
// A short approach on the left leads into the open fight space.
export const level3: LevelDefinition = {
  width: 38,
  height: 14,
  rooms: [{ left: 1, top: 2, right: 36, bottom: 12 }],
  stalactites: [],
  stalagmites: [],
  planks: [
    { row: 8, from: 5, to: 9, material: 'brick' },
    { row: 8, from: 28, to: 32, material: 'brick' },
  ],
  decorations: [
    { kind: 'flag', col: 12, row: 4 },
    { kind: 'flag', col: 25, row: 4 },
  ],
  spawns: {
    player: { col: 2, row: 13 },
    entryDoor: { col: 2, row: 13 },
    exitDoor: { col: 35, row: 13 },
  },
}
