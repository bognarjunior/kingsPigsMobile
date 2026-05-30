export const GAME_EVENT = {
  READY: 'game:ready',
  OVER: 'game:over',
  SCORE: 'game:score',
  PAUSE: 'game:pause',
  SAVE: 'game:save',
  LOAD: 'game:load',
} as const

export type GameEventName = (typeof GAME_EVENT)[keyof typeof GAME_EVENT]
