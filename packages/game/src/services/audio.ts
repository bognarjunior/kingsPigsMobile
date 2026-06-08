import type Phaser from 'phaser'

import { audioSettings, MUSIC_KEY } from '@/services/audioSettings'
import type { MusicTrack } from '@/types/audio'

// Single point for playback, so every scene shares one music stream and the
// settings (track / mute / volume) apply everywhere. The sound manager is global
// to the game, so the looping music survives scene restarts (level changes).
// the concrete sounds (Web/HTML audio) expose setVolume/setMute; BaseSound's type doesn't
type ControllableSound = Phaser.Sound.BaseSound & {
  setVolume(value: number): Phaser.Sound.BaseSound
  setMute(value: boolean): Phaser.Sound.BaseSound
}

let manager: Phaser.Sound.BaseSoundManager | undefined
let music: ControllableSound | undefined

export function initAudio(scene: Phaser.Scene): void {
  manager = scene.sound
  ensureMusic()
}

export function playSfx(key: string): void {
  if (!manager || audioSettings.sfxMuted) {
    return
  }
  manager.play(key, { volume: audioSettings.sfxVolume })
}

// start (or keep) the selected track looping, applying mute + volume
function ensureMusic(): void {
  if (!manager) {
    return
  }
  const key = MUSIC_KEY[audioSettings.track]
  if (music && music.key === key) {
    music.setVolume(audioSettings.musicVolume)
    music.setMute(audioSettings.musicMuted)
    return
  }
  music?.stop()
  music?.destroy()
  music = manager.add(key, { loop: true, volume: audioSettings.musicVolume }) as ControllableSound
  music.setMute(audioSettings.musicMuted)
  music.play()
}

export function setMusicTrack(track: MusicTrack): void {
  audioSettings.track = track
  ensureMusic()
}

export function setMusicMuted(muted: boolean): void {
  audioSettings.musicMuted = muted
  music?.setMute(muted)
}

export function setSfxMuted(muted: boolean): void {
  audioSettings.sfxMuted = muted
}

export function changeMusicVolume(direction: number): void {
  audioSettings.stepMusicVolume(direction)
  music?.setVolume(audioSettings.musicVolume)
}

export function changeSfxVolume(direction: number): void {
  audioSettings.stepSfxVolume(direction)
}
