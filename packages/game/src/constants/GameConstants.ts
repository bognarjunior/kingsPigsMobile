import type { PigTier, Rgb } from '@/types/enemy'

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

export const HEART_SPRITE = {
  FRAME_WIDTH: 18,
  FRAME_HEIGHT: 14,
} as const

export const NUMBER_SPRITE = {
  FRAME_WIDTH: 6,
  FRAME_HEIGHT: 8,
} as const

export const COLLECTIBLE_FRAMES = {
  HEART: 8,
  DIAMOND: 10,
} as const

export const KING_BODY = {
  WIDTH: 16,
  HEIGHT: 26,
  OFFSET_X: 18,
  // facing left mirrors the body to the other side of the 78px frame
  OFFSET_X_FLIPPED: 44,
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

export const PIG_BOMB_SPRITE = {
  FRAME_WIDTH: 26,
  FRAME_HEIGHT: 26,
} as const

export const PIG_BOMB_BODY = {
  WIDTH: 14,
  HEIGHT: 15,
  OFFSET_X: 6,
  OFFSET_Y: 10,
} as const

export const PIG_BOMB_FRAMES = {
  IDLE: 10,
  RUN: 6,
  PICK: 4,
  THROW: 5,
} as const

export const BOMB_SPRITE = {
  FRAME_WIDTH: 52,
  FRAME_HEIGHT: 56,
} as const

export const BOMB_BODY = {
  WIDTH: 16,
  HEIGHT: 16,
  OFFSET_X: 18,
  OFFSET_Y: 22,
} as const

export const BOMB_FRAMES = {
  ON: 4,
  BOOM: 6,
} as const

export const BOMB = {
  THROW_RANGE: 170,
  THROW_COOLDOWN_MS: 2200,
  THROW_SPEED_X: 150,
  THROW_SPEED_Y: -300,
  FUSE_MS: 1500,
  RADIUS: 34,
  DAMAGE: 1,
  FUSE_FPS: 10,
  BOOM_FPS: 14,
  // how close an unarmed thrower stands to a grounded bomb before grabbing it
  PICK_REACH: 8,
  // animation frame (1-based) where the bomb leaves the pig's hand
  RELEASE_FRAME: 4,
} as const

export const BOX_SPRITE = {
  FRAME_WIDTH: 22,
  FRAME_HEIGHT: 16,
} as const

export const BOX_PIECE_SPRITE = {
  FRAME_WIDTH: 10,
  FRAME_HEIGHT: 10,
} as const

export const BOX_BODY = {
  WIDTH: 18,
  HEIGHT: 14,
  OFFSET_X: 2,
  OFFSET_Y: 2,
} as const

export const BOX = {
  PIECE_COUNT: 4,
  PIECE_SPEED_MIN: 40,
  PIECE_SPEED_MAX: 90,
  PIECE_UP_MIN: 120,
  PIECE_UP_MAX: 210,
  PIECE_LIFETIME_MS: 600,
  DEPTH: 7,
  // a box pig grabs a ground crate and lobs it; it breaks on impact
  THROW_RANGE: 160,
  THROW_COOLDOWN_MS: 2400,
  THROW_SPEED_X: 140,
  THROW_SPEED_Y: -280,
  THROW_DAMAGE: 1,
  // animation frame (1-based) where the crate leaves the pig's hand
  RELEASE_FRAME: 4,
} as const

export const PIG_BOX_SPRITE = {
  FRAME_WIDTH: 26,
  FRAME_HEIGHT: 30,
} as const

export const PIG_BOX_BODY = {
  WIDTH: 14,
  HEIGHT: 17,
  OFFSET_X: 6,
  OFFSET_Y: 13,
} as const

export const PIG_BOX_FRAMES = {
  IDLE: 9,
  RUN: 6,
  PICK: 5,
  THROW: 5,
} as const

export const DOOR_FRAMES = {
  OPENING: 5,
  CLOSING: 3,
} as const

export const DOOR = {
  // how close (horizontally) the King must stand to a door to open it with attack
  INTERACT_RANGE: 28,
  // first level has no "back": the entry door lingers, then disappears
  VANISH_DELAY_MS: 600,
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
  MAX_HEARTS: 3,
  MAX_HEARTS_CAP: 10,
  HEARTS_PER_MAX_UP: 10,
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
  HEART_DAMAGE: 1,
  ATTACK_RANGE: 30,
  ATTACK_VERTICAL: 12,
  ATTACK_COOLDOWN_MS: 1200,
  // melee lands as the swing starts (1-based animation frame)
  ATTACK_RELEASE_FRAME: 1,
  KNOCKBACK_SPEED: 160,
  KNOCKBACK_DRAG: 800,
  VISION_HEIGHT: 48,
  STOMP_DAMAGE: 50,
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

// the pig's skin ramp in the source art (highlight -> deep shadow); only these
// four colours are swapped per tier, leaving eyes/teeth/outline untouched.
export const PIG_SKIN: readonly Rgb[] = [
  [145, 234, 156],
  [72, 195, 138],
  [55, 171, 156],
  [41, 138, 145],
]

// difficulty tiers: colour ramp + scaled stats. Index 0 (green) is the base art.
export const PIG_TIERS: readonly PigTier[] = [
  { name: '', skin: null, health: 50, speedScale: 1.0, heartDamage: 1 },
  {
    name: 'white',
    skin: [
      [228, 226, 222],
      [209, 205, 199],
      [202, 198, 190],
      [195, 191, 182],
    ],
    health: 75,
    speedScale: 1.1,
    heartDamage: 1,
  },
  {
    name: 'blue',
    skin: [
      [147, 187, 232],
      [75, 130, 192],
      [58, 109, 168],
      [44, 90, 142],
    ],
    health: 100,
    speedScale: 1.2,
    heartDamage: 1,
  },
  {
    name: 'red',
    skin: [
      [236, 146, 143],
      [198, 73, 69],
      [174, 56, 52],
      [148, 42, 38],
    ],
    health: 125,
    speedScale: 1.3,
    heartDamage: 2,
  },
  {
    name: 'gray',
    skin: [
      [152, 156, 164],
      [120, 125, 135],
      [101, 105, 114],
      [81, 85, 92],
    ],
    health: 150,
    speedScale: 1.4,
    heartDamage: 2,
  },
]

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

export const PICKUP = {
  FLOAT_ABOVE_FLOOR: 16,
  DEPTH: 8,
} as const

export const HUD = {
  BAR_X: 6,
  BAR_Y: 6,
  DEPTH: 100,
  // the Live Bar sliced into 3 tileable pieces: a left end (tail + 1st socket),
  // a repeatable 1-socket middle, and a right end (last socket + tail). A bar of
  // N hearts = left + (N-2) middles + right.
  CAP_LEFT_WIDTH: 25,
  MID_WIDTH: 11,
  CAP_RIGHT_WIDTH: 30,
  HEART_Y: 17,
  LEFT_SOCKET_X: 20,
  MID_FIRST_SOCKET_X: 31,
  DIAMOND_ICON_X: 12,
  DIAMOND_ICON_Y: 48,
  DIGIT_X: 24,
  DIGIT_Y: 45,
  DIGIT_SPACING: 7,
} as const
