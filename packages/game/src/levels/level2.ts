import type { LevelDefinition } from '@/types/level'

// Irregular castle hall: a small low chamber on the left, a tall main hall, and
// a raised section on the right (dark void below it). Stalactites/stalagmites
// are carved out of the contour; the LevelBuilder autotiles the walls.
export const level2: LevelDefinition = {
  width: 44,
  height: 17,
  rooms: [
    { left: 3, top: 9, right: 9, bottom: 14 }, // left low chamber
    { left: 10, top: 4, right: 18, bottom: 14 }, // hall left (tall)
    { left: 19, top: 6, right: 23, bottom: 14 }, // hall center (lower ceiling)
    { left: 24, top: 4, right: 29, bottom: 14 }, // hall right (tall)
    { left: 30, top: 6, right: 40, bottom: 11 }, // raised right section
  ],
  stalactites: [
    { col: 13, top: 4, bottom: 7, width: 2 },
    { col: 20, top: 6, bottom: 7, width: 3 },
    { col: 26, top: 4, bottom: 5, width: 2 },
  ],
  stalagmites: [
    { col: 12, top: 11, bottom: 14, width: 2 },
    { col: 24, top: 13, bottom: 14, width: 3 },
  ],
  planks: [
    { row: 11, from: 16, to: 19, material: 'wood' },
    { row: 10, from: 25, to: 28, material: 'wood' },
    { row: 9, from: 32, to: 34, material: 'wood' },
  ],
  decorations: [
    { kind: 'window', col: 11, row: 5 },
    { kind: 'flag', col: 39, row: 6 },
  ],
  spawns: {
    player: { col: 5, row: 15 },
    entryDoor: { col: 5, row: 15 },
    exitDoor: { col: 36, row: 12 },
  },
}
