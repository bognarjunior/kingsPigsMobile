export type EnemyState = 'idle' | 'run' | 'attack' | 'hurt' | 'dead'

// only the basic pig for now; bomb/box/match/king variants come later
export type PigType = 'pig'

export interface EnemySpawn {
  readonly type: PigType
  readonly col: number
  readonly row: number
  readonly patrol: number
}

// pluggable attack: the pig delegates "what is my reach / can I attack now"
export interface AttackBehavior {
  readonly range: number
  ready(now: number): boolean
  trigger(now: number): void
}

export interface AttackEvent {
  readonly x: number
  readonly y: number
  readonly facingLeft: boolean
}
