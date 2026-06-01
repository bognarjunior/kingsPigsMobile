export const DISPLAY = {
  WIDTH: 480,
  HEIGHT: 270,
} as const

export const COLORS = {
  BACKGROUND: 0x3f3851,
  GROUND: 0x3d2b1f,
} as const

export const WORLD = {
  GROUND_HEIGHT: 24,
} as const

export const KING_SPRITE = {
  FRAME_WIDTH: 78,
  FRAME_HEIGHT: 58,
} as const

export const PIG_SPRITE = {
  FRAME_WIDTH: 34,
  FRAME_HEIGHT: 28,
} as const

export const DOOR_SPRITE = {
  FRAME_WIDTH: 46,
  FRAME_HEIGHT: 56,
} as const

export const KING_BODY = {
  WIDTH: 37,
  HEIGHT: 26,
  OFFSET_X: 9,
  OFFSET_Y: 18,
} as const

export const PIG_BODY = {
  WIDTH: 18,
  HEIGHT: 17,
  OFFSET_X: 11,
  OFFSET_Y: 11,
} as const

export const KING_FRAMES = {
  IDLE: 11,
  RUN: 8,
  JUMP: 1,
  FALL: 1,
  ATTACK: 3,
  HIT: 2,
  DEAD: 4,
  DOOR_IN: 8,
  DOOR_OUT: 8,
} as const

export const PIG_FRAMES = {
  IDLE: 11,
  RUN: 6,
  ATTACK: 5,
  HIT: 2,
  DEAD: 4,
} as const

export const DOOR_FRAMES = {
  OPENING: 5,
  CLOSING: 3,
} as const

export const ANIM = {
  IDLE_FPS: 8,
  RUN_FPS: 12,
  ATTACK_FPS: 14,
  HIT_FPS: 10,
  DEAD_FPS: 8,
  DOOR_FPS: 14,
  KING_DOOR_FPS: 12,
} as const

export const PLAYER = {
  SPEED: 160,
  JUMP_VELOCITY: -380,
  ATTACK_DAMAGE: 25,
  ATTACK_RANGE: 44,
  MAX_HEALTH: 100,
  HURT_INVULN_MS: 1500,
  STOMP_BOUNCE: 260,
  SPAWN_X: 80,
  SPAWN_Y: 360,
} as const

export const CAMERA = {
  LERP: 0.12,
} as const

export const PIG = {
  PATROL_SPEED: 60,
  CHASE_SPEED: 110,
  PATROL_DISTANCE: 120,
  DETECTION_RANGE: 200,
  ATTACK_DAMAGE: 15,
  ATTACK_RANGE: 30,
  ATTACK_VERTICAL: 12,
  ATTACK_COOLDOWN_MS: 1200,
  KNOCKBACK_SPEED: 160,
  KNOCKBACK_DRAG: 800,
  VISION_HEIGHT: 48,
  STOMP_DAMAGE: 25,
  STUN_MS: 1000,
  DEAD_LINGER_MS: 600,
  PATROL_WALK_MIN_MS: 1500,
  PATROL_WALK_MAX_MS: 3200,
  PATROL_PAUSE_MIN_MS: 700,
  PATROL_PAUSE_MAX_MS: 2000,
  MAX_HEALTH: 50,
  SPAWN_X: 360,
  SPAWN_Y: 180,
} as const

export const COMBAT = {
  VERTICAL_REACH: 40,
  STOMP_TOLERANCE: 12,
} as const

export const PHYSICS = {
  GRAVITY: 500,
} as const

export const CONTROLS = {
  BUTTON_SIZE: 56,
  MARGIN: 16,
  GAP: 12,
} as const

export const MENU = {
  TITLE_GAP: 20,
} as const
