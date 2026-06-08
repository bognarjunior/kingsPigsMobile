import { SOUND_KEY } from '@/constants/keys'

export type MusicTrack = 'original' | 'epic' | 'metal'

export const MUSIC_KEY: Readonly<Record<MusicTrack, string>> = {
  original: SOUND_KEY.MUSIC_ORIGINAL,
  epic: SOUND_KEY.MUSIC_EPIC,
  metal: SOUND_KEY.MUSIC_METAL,
}

export const MUSIC_TRACKS: readonly MusicTrack[] = ['original', 'epic', 'metal']

const STEP = 0.2

const clampVolume = (v: number): number => Math.max(0, Math.min(1, Math.round(v * 5) / 5))

// Player-facing audio preferences. Held in memory for now (Phase 6 persists it via
// the Bridge, like the run profile); the audio service reads/applies these.
class AudioSettings {
  track: MusicTrack = 'epic'
  musicMuted = false
  sfxMuted = false
  musicVolume = 0.6
  sfxVolume = 0.8

  stepMusicVolume(direction: number): void {
    this.musicVolume = clampVolume(this.musicVolume + direction * STEP)
  }

  stepSfxVolume(direction: number): void {
    this.sfxVolume = clampVolume(this.sfxVolume + direction * STEP)
  }
}

export const audioSettings = new AudioSettings()
