import { SOUND_KEY } from '@/constants/keys'
import { requestSave } from '@/services/saveBus'
import type { MusicTrack, MusicTrackInfo } from '@/types/audio'
import type { SaveData } from '@/types/save'

// the catalogue every part of the audio stack reads from: BootScene loads each
// file, the service maps id → sound key, and the settings panel lists the labels.
export const MUSIC_TRACKS: readonly MusicTrackInfo[] = [
  { id: 'original', key: SOUND_KEY.MUSIC_ORIGINAL, file: 'audio/music.mp3', label: 'ORIGINAL' },
  { id: 'epic', key: SOUND_KEY.MUSIC_EPIC, file: 'audio/music-epic.mp3', label: 'EPIC' },
  { id: 'metal', key: SOUND_KEY.MUSIC_METAL, file: 'audio/music-metal.mp3', label: 'METAL' },
  { id: 'medieval', key: SOUND_KEY.MUSIC_MEDIEVAL, file: 'audio/music-medieval.mp3', label: 'MEDIEVAL' },
  { id: 'whistler', key: SOUND_KEY.MUSIC_WHISTLER, file: 'audio/music-whistler.mp3', label: 'WHISTLER' },
  { id: 'minstrels', key: SOUND_KEY.MUSIC_MINSTRELS, file: 'audio/music-minstrels.mp3', label: 'MINSTRELS' },
  { id: 'exploration', key: SOUND_KEY.MUSIC_EXPLORATION, file: 'audio/music-exploration.mp3', label: 'EXPLORATION' },
]

export const MUSIC_KEY: Readonly<Record<MusicTrack, string>> = MUSIC_TRACKS.reduce(
  (map, track) => ({ ...map, [track.id]: track.key }),
  {} as Record<MusicTrack, string>,
)

const STEP = 0.1

const clampVolume = (v: number): number => Math.max(0, Math.min(1, Math.round(v * 10) / 10))

// Player-facing audio preferences, persisted via the Bridge like the run profile.
// The audio service reads/applies these; mutators request a save so a change to a
// track / mute / volume survives an app restart.
class AudioSettings {
  track: MusicTrack = 'epic'
  musicMuted = false
  sfxMuted = false
  musicVolume = 0.2 // starts low on first launch; the player raises it in settings
  sfxVolume = 0.8

  stepMusicVolume(direction: number): void {
    this.musicVolume = clampVolume(this.musicVolume + direction * STEP)
    requestSave()
  }

  stepSfxVolume(direction: number): void {
    this.sfxVolume = clampVolume(this.sfxVolume + direction * STEP)
    requestSave()
  }

  // apply a persisted snapshot at startup; sets fields directly (no save request)
  hydrate(data: SaveData['audio']): void {
    this.track = data.track
    this.musicMuted = data.musicMuted
    this.sfxMuted = data.sfxMuted
    this.musicVolume = data.musicVolume
    this.sfxVolume = data.sfxVolume
  }
}

export const audioSettings = new AudioSettings()
