import type { MusicTrack } from '@/types/audio'

// the persisted player profile + audio prefs, round-tripped through the Bridge
// (game emits game:save → app stores; on load the app injects it before boot).
// `version` lets us migrate the shape later.
export interface SaveData {
  readonly version: number
  readonly diamonds: number
  readonly lives: number
  readonly maxHeartBonus: number
  readonly damageBonus: number
  readonly takenLoot: readonly string[]
  readonly audio: {
    readonly track: MusicTrack
    readonly musicMuted: boolean
    readonly sfxMuted: boolean
    readonly musicVolume: number
    readonly sfxVolume: number
  }
}
