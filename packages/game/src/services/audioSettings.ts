import { SOUND_KEY } from '@/constants/keys'
import type { MusicTrack, MusicTrackInfo } from '@/types/audio'

// the catalogue every part of the audio stack reads from: BootScene loads each
// file, the service maps id → sound key, and the settings panel lists the labels.
export const MUSIC_TRACKS: readonly MusicTrackInfo[] = [
  { id: 'original', key: SOUND_KEY.MUSIC_ORIGINAL, file: 'audio/music.mp3', label: 'ORIGINAL' },
  { id: 'epic', key: SOUND_KEY.MUSIC_EPIC, file: 'audio/music-epic.mp3', label: 'EPIC' },
  { id: 'metal', key: SOUND_KEY.MUSIC_METAL, file: 'audio/music-metal.mp3', label: 'METAL' },
  { id: 'medieval', key: SOUND_KEY.MUSIC_MEDIEVAL, file: 'audio/music-medieval.mp3', label: 'MEDIEVAL' },
  { id: 'whistler', key: SOUND_KEY.MUSIC_WHISTLER, file: 'audio/music-whistler.mp3', label: 'WHISTLER' },
  { id: 'whistler-short', key: SOUND_KEY.MUSIC_WHISTLER_SHORT, file: 'audio/music-whistler-short.mp3', label: 'WHISTLER 30S' },
  { id: 'minstrels', key: SOUND_KEY.MUSIC_MINSTRELS, file: 'audio/music-minstrels.mp3', label: 'MINSTRELS' },
  { id: 'exploration', key: SOUND_KEY.MUSIC_EXPLORATION, file: 'audio/music-exploration.mp3', label: 'EXPLORATION' },
]

export const MUSIC_KEY: Readonly<Record<MusicTrack, string>> = MUSIC_TRACKS.reduce(
  (map, track) => ({ ...map, [track.id]: track.key }),
  {} as Record<MusicTrack, string>,
)

const STEP = 0.2

const clampVolume = (v: number): number => Math.max(0, Math.min(1, Math.round(v * 5) / 5))

// Player-facing audio preferences. Held in memory for now (Phase 6 persists it via
// the Bridge, like the run profile); the audio service reads/applies these.
class AudioSettings {
  track: MusicTrack = 'epic'
  musicMuted = false
  sfxMuted = false
  musicVolume = 0.2 // starts low on first launch; the player raises it in settings
  sfxVolume = 0.8

  stepMusicVolume(direction: number): void {
    this.musicVolume = clampVolume(this.musicVolume + direction * STEP)
  }

  stepSfxVolume(direction: number): void {
    this.sfxVolume = clampVolume(this.sfxVolume + direction * STEP)
  }
}

export const audioSettings = new AudioSettings()
