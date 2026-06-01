export const TILE_SIZE = 32

export const TILESET = {
  TERRAIN: {
    name: 'terrain',
    firstgid: 1,
    columns: 19,
    image: 'terrain.png',
    imageWidth: 608,
    imageHeight: 416,
    tileCount: 247,
  },
  DECORATIONS: {
    name: 'decorations',
    firstgid: 248,
    columns: 7,
    image: 'decorations.png',
    imageWidth: 224,
    imageHeight: 192,
    tileCount: 42,
  },
} as const

// Terrain gids (the tan/peach face points INTO the room). See docs/TILESET.md.
export const TERRAIN_TILE = {
  FLOOR: 22,
  CEIL: 60,
  WALL_L: 42,
  WALL_R: 40,
  // convex room corners (room bulges out)
  O_TL: 27,
  O_TR: 28,
  O_BL: 46,
  O_BR: 47,
  // concave inner corners (room wraps a notch)
  I_UL: 21,
  I_UR: 23,
  I_DL: 59,
  I_DR: 61,
  // background shadow 9-slice
  BG_TL: 135,
  BG_T: 136,
  BG_TR: 137,
  BG_L: 154,
  BG_P: 155,
  BG_R: 156,
  BG_BL: 173,
  BG_B: 174,
  BG_BR: 175,
  // convex shadow corners (wrap a protrusion)
  CV_DR: 141,
  CV_DL: 142,
  CV_UR: 160,
  CV_UL: 161,
  // brick platform caps (single row)
  PLAT_L: 97,
  PLAT_M: 98,
  PLAT_R: 99,
} as const

// Decoration gids.
export const DECO_TILE = {
  WIN_TL: 271,
  WIN_TR: 272,
  WIN_BL: 278,
  WIN_BR: 279,
  BEAM_L: 285,
  BEAM_R: 286,
  FLAG_TOP: 256,
  FLAG_BODY: 263,
  FLAG_TAIL: 270,
  PLANK_L: 264,
  PLANK_M: 265,
  PLANK_R: 266,
} as const
