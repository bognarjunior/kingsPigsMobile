export const DISPLAY = {
  WIDTH: 480,
  HEIGHT: 270,
} as const

export const COLORS = {
  BACKGROUND: 0x1a1a2e,
  GROUND: 0x3d2b1f,
} as const

export const WORLD = {
  GROUND_HEIGHT: 24,
} as const

export const KING = {
  FRAME_WIDTH: 78,
  FRAME_HEIGHT: 58,
} as const

export const PLAYER = {
  SPEED: 160,
  JUMP_VELOCITY: -380,
  ATTACK_DAMAGE: 25,
  MAX_HEALTH: 100,
  SPAWN_X: 80,
  SPAWN_Y: 180,
} as const

export const PIG = {
  SPEED: 80,
  PATROL_DISTANCE: 120,
  ATTACK_DAMAGE: 15,
  MAX_HEALTH: 50,
  DETECTION_RANGE: 200,
} as const

export const PHYSICS = {
  GRAVITY: 500,
} as const

export const CONTROLS = {
  BUTTON_SIZE: 56,
  MARGIN: 16,
  GAP: 12,
} as const
