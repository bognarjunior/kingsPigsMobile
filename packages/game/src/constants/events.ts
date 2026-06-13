export const GAME_EVENT = {
  READY: 'game:ready',
  LEVEL_COMPLETE: 'game:level-complete',
  OVER: 'game:over',
  SCORE: 'game:score',
  PAUSE: 'game:pause',
  RESUME: 'game:resume',
  SAVE: 'game:save',
  LOAD: 'game:load',
  EXIT: 'game:exit',
} as const

export type GameEventName = (typeof GAME_EVENT)[keyof typeof GAME_EVENT]

// internal scene events (entity-to-entity communication, never leave the game)
export const ENTITY_EVENT = {
  PLAYER_ATTACK: 'player:attack',
  ENEMY_ATTACK: 'enemy:attack',
  ENEMY_THROW_BOMB: 'enemy:throw-bomb',
  ENEMY_THROW_BOX: 'enemy:throw-box',
  BOMB_EXPLODE: 'bomb:explode',
  BOX_BROKEN: 'box:broken',
  BOXPIG_REVEAL: 'boxpig:reveal',
  CANNON_FIRE: 'cannon:fire',
  PLAYER_HEALTH: 'player:health',
  PLAYER_MAX_HEARTS: 'player:max-hearts',
  PLAYER_DIAMONDS: 'player:diamonds',
  PLAYER_LIVES: 'player:lives',
  PLAYER_DIED: 'player:died',
  KING_PIG_HEALTH: 'king-pig:health',
  KING_PIG_SUMMON: 'king-pig:summon',
  KING_PIG_DEFEATED: 'king-pig:defeated',
} as const
