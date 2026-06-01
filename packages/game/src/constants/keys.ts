export const SCENE_KEY = {
  BOOT: 'boot',
  MENU: 'menu',
  GAME: 'game',
} as const

export const TEXTURE_KEY = {
  KING_IDLE: 'king-idle',
  KING_RUN: 'king-run',
  KING_JUMP: 'king-jump',
  KING_FALL: 'king-fall',
  KING_ATTACK: 'king-attack',
  KING_HIT: 'king-hit',
  KING_DEAD: 'king-dead',
  KING_DOOR_IN: 'king-door-in',
  KING_DOOR_OUT: 'king-door-out',
  PIG_IDLE: 'pig-idle',
  PIG_RUN: 'pig-run',
  TERRAIN: 'terrain',
  DECORATIONS: 'decorations',
  DOOR_IDLE: 'door-idle',
  DOOR_OPENING: 'door-opening',
  DOOR_CLOSING: 'door-closing',
} as const

export const TILEMAP_KEY = {
  LEVEL1: 'level1',
  LEVEL2: 'level2',
} as const

export const TILESET_NAME = 'terrain'

export const LAYER = {
  BACKGROUND: 'background',
  DECORATIONS: 'decorations',
  SOLID: 'solid',
} as const

export const OBJECT_LAYER = {
  SPAWNS: 'spawns',
} as const

export const SPAWN = {
  PLAYER: 'player_spawn',
  ENTRY_DOOR: 'entry_door',
  EXIT_DOOR: 'exit_door',
} as const

export const ANIM_KEY = {
  KING_IDLE: 'king-idle-anim',
  KING_RUN: 'king-run-anim',
  KING_JUMP: 'king-jump-anim',
  KING_FALL: 'king-fall-anim',
  KING_ATTACK: 'king-attack-anim',
  KING_HIT: 'king-hit-anim',
  KING_DEAD: 'king-dead-anim',
  KING_DOOR_IN: 'king-door-in-anim',
  KING_DOOR_OUT: 'king-door-out-anim',
  PIG_IDLE: 'pig-idle-anim',
  PIG_RUN: 'pig-run-anim',
  DOOR_OPENING: 'door-opening-anim',
  DOOR_CLOSING: 'door-closing-anim',
} as const
