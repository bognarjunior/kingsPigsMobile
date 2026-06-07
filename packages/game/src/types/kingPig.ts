import type { EnemySpawn } from '@/types/enemy'

export interface BossSummon {
  readonly atHealthBelow: number
  readonly minions: readonly EnemySpawn[]
}

export interface KingPigSpawn {
  readonly col: number
  readonly row: number
  readonly patrol: number
  readonly tier?: number
  readonly contactDamage?: number
  readonly summons?: readonly BossSummon[]
}

export interface KingPigHealthEvent {
  readonly current: number
  readonly max: number
}

export interface KingPigSummonEvent {
  readonly minions: readonly EnemySpawn[]
}
