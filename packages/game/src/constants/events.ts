export const GAME_EVENT = {
  READY: 'game:ready',
  LEVEL_COMPLETE: 'game:level-complete',
  OVER: 'game:over',
  SCORE: 'game:score',
  PAUSE: 'game:pause',
  SAVE: 'game:save',
  LOAD: 'game:load',
} as const

export type GameEventName = (typeof GAME_EVENT)[keyof typeof GAME_EVENT]

// internal scene events (entity-to-entity communication, never leave the game)
export const ENTITY_EVENT = {
  PLAYER_ATTACK: 'player:attack',
  ENEMY_ATTACK: 'enemy:attack',
  PLAYER_HEALTH: 'player:health',
  PLAYER_MAX_HEARTS: 'player:max-hearts',
  PLAYER_DIAMONDS: 'player:diamonds',
  PLAYER_DIED: 'player:died',
} as const
