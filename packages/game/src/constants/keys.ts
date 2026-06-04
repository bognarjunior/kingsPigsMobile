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
  PIG_ATTACK: 'pig-attack',
  PIG_HIT: 'pig-hit',
  PIG_DEAD: 'pig-dead',
  PIG_BOMB_IDLE: 'pig-bomb-idle',
  PIG_BOMB_RUN: 'pig-bomb-run',
  PIG_BOMB_PICK: 'pig-bomb-pick',
  PIG_BOMB_THROW: 'pig-bomb-throw',
  PIG_BOX_IDLE: 'pig-box-idle',
  PIG_BOX_RUN: 'pig-box-run',
  PIG_BOX_PICK: 'pig-box-pick',
  PIG_BOX_THROW: 'pig-box-throw',
  BOMB_OFF: 'bomb-off',
  BOMB_ON: 'bomb-on',
  BOMB_BOOM: 'bomb-boom',
  BOX_IDLE: 'box-idle',
  BOX_PIECES: 'box-pieces',
  TERRAIN: 'terrain',
  DECORATIONS: 'decorations',
  BAR_LEFT: 'bar-left',
  BAR_MID: 'bar-mid',
  BAR_RIGHT: 'bar-right',
  HEART: 'heart',
  BIG_HEART: 'big-heart',
  DIAMOND: 'diamond',
  BIG_DIAMOND: 'big-diamond',
  NUMBERS: 'numbers',
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
  PIG_ATTACK: 'pig-attack-anim',
  PIG_HIT: 'pig-hit-anim',
  PIG_DEAD: 'pig-dead-anim',
  PIG_BOMB_IDLE: 'pig-bomb-idle-anim',
  PIG_BOMB_RUN: 'pig-bomb-run-anim',
  PIG_BOMB_PICK: 'pig-bomb-pick-anim',
  PIG_BOMB_THROW: 'pig-bomb-throw-anim',
  PIG_BOX_IDLE: 'pig-box-idle-anim',
  PIG_BOX_RUN: 'pig-box-run-anim',
  PIG_BOX_PICK: 'pig-box-pick-anim',
  PIG_BOX_THROW: 'pig-box-throw-anim',
  BOMB_ON: 'bomb-on-anim',
  BOMB_BOOM: 'bomb-boom-anim',
  DOOR_OPENING: 'door-opening-anim',
  DOOR_CLOSING: 'door-closing-anim',
  HEART_IDLE: 'heart-idle-anim',
  BIG_HEART_IDLE: 'big-heart-idle-anim',
  DIAMOND_IDLE: 'diamond-idle-anim',
} as const
