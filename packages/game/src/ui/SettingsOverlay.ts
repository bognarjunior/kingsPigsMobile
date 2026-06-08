import Phaser from 'phaser'

import { FONT_FAMILY } from '@/constants/GameConstants'
import {
  changeMusicVolume,
  changeSfxVolume,
  setMusicMuted,
  setMusicTrack,
  setSfxMuted,
} from '@/services/audio'
import { audioSettings, MUSIC_TRACKS } from '@/services/audioSettings'

const DEPTH = 200
const DIM_ALPHA = 0.88
const TRACK_SPACING = 18
const TRACK_X = 0.28 // fraction of width for the track list column
const CONTROL_X = 0.66 // fraction of width for the volume/mute column
const CONTROL_SPACING = 30
const STEP_GAP = 26 // distance from the value to each -/+ button
const TOGGLE_GAP = 64 // half-width of a toggle row, so the ON/OFF clears the label
const SELECTED_COLOR = '#9fe0ff'
const IDLE_COLOR = '#ffffff'
const VOLUME_SCALE = 100

// Full-screen audio settings veil (pixel font): pick one of the music tracks on
// the left, toggle mute / step volume for music and SFX on the right. The veil
// itself is interactive so taps outside the controls are absorbed (modal). Reads
// audioSettings after every change so labels and the selection stay current.
export class SettingsOverlay {
  private readonly parts: Phaser.GameObjects.GameObject[] = []
  private readonly trackRows: { id: string; label: Phaser.GameObjects.Text }[] = []
  private musicVolumeValue!: Phaser.GameObjects.Text
  private sfxVolumeValue!: Phaser.GameObjects.Text
  private musicToggle!: Phaser.GameObjects.Text
  private sfxToggle!: Phaser.GameObjects.Text

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly onClose: () => void,
  ) {
    this.build()
  }

  destroy(): void {
    this.parts.forEach((part) => part.destroy())
  }

  private build(): void {
    const { width, height } = this.scene.cameras.main

    const veil = this.scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, DIM_ALPHA)
      .setScrollFactor(0)
      .setDepth(DEPTH)
      .setInteractive()
    this.track(veil)

    this.label(width / 2, 16, 'AUDIO', 14, IDLE_COLOR).setOrigin(0.5, 0)

    this.buildTrackList(width * TRACK_X, 44)
    this.buildControls(width * CONTROL_X, 52)

    const close = this.label(width / 2, height - 20, 'CLOSE', 9, '#cfcfcf').setOrigin(0.5)
    close.setInteractive({ useHandCursor: true })
    close.on(Phaser.Input.Events.POINTER_DOWN, this.onClose)

    this.refresh()
  }

  private buildTrackList(x: number, top: number): void {
    this.label(x, top, 'MUSIC', 9, IDLE_COLOR).setOrigin(0.5, 0)
    MUSIC_TRACKS.forEach((info, index) => {
      const y = top + 22 + index * TRACK_SPACING
      const row = this.label(x, y, info.label, 8, IDLE_COLOR).setOrigin(0.5)
      row.setInteractive({ useHandCursor: true })
      row.on(Phaser.Input.Events.POINTER_DOWN, () => {
        setMusicTrack(info.id)
        this.refresh()
      })
      this.trackRows.push({ id: info.id, label: row })
    })
  }

  private buildControls(x: number, top: number): void {
    this.musicVolumeValue = this.buildVolumeRow(x, top, 'MUSIC VOL', (direction) => {
      changeMusicVolume(direction)
      this.refresh()
    })
    this.sfxVolumeValue = this.buildVolumeRow(x, top + CONTROL_SPACING, 'EFFECTS VOL', (direction) => {
      changeSfxVolume(direction)
      this.refresh()
    })
    this.musicToggle = this.buildToggleRow(x, top + CONTROL_SPACING * 2, 'MUSIC', () => {
      setMusicMuted(!audioSettings.musicMuted)
      this.refresh()
    })
    this.sfxToggle = this.buildToggleRow(x, top + CONTROL_SPACING * 3, 'EFFECTS', () => {
      setSfxMuted(!audioSettings.sfxMuted)
      this.refresh()
    })
  }

  // a "LABEL  [-] 60% [+]" row; returns the value text so refresh() can update it
  private buildVolumeRow(x: number, y: number, text: string, onStep: (direction: number) => void): Phaser.GameObjects.Text {
    this.label(x, y - 9, text, 8, IDLE_COLOR).setOrigin(0.5, 0)
    const value = this.label(x, y + 6, '', 8, SELECTED_COLOR).setOrigin(0.5)
    this.stepButton(x - STEP_GAP, y + 6, '-', () => onStep(-1))
    this.stepButton(x + STEP_GAP, y + 6, '+', () => onStep(1))
    return value
  }

  // a "LABEL  ON/OFF" toggle row; returns the state text so refresh() can update it
  private buildToggleRow(x: number, y: number, text: string, onToggle: () => void): Phaser.GameObjects.Text {
    this.label(x - TOGGLE_GAP, y, text, 8, IDLE_COLOR).setOrigin(0, 0.5)
    const state = this.label(x + TOGGLE_GAP, y, '', 8, SELECTED_COLOR).setOrigin(1, 0.5)
    state.setInteractive({ useHandCursor: true })
    state.on(Phaser.Input.Events.POINTER_DOWN, onToggle)
    return state
  }

  private stepButton(x: number, y: number, glyph: string, onTap: () => void): Phaser.GameObjects.Text {
    const button = this.label(x, y, glyph, 10, IDLE_COLOR).setOrigin(0.5)
    button.setInteractive({ useHandCursor: true })
    button.on(Phaser.Input.Events.POINTER_DOWN, onTap)
    return button
  }

  private refresh(): void {
    this.trackRows.forEach(({ id, label }) => {
      const selected = id === audioSettings.track
      label.setColor(selected ? SELECTED_COLOR : IDLE_COLOR)
      label.setAlpha(selected ? 1 : 0.6)
    })
    this.musicVolumeValue.setText(this.percent(audioSettings.musicVolume))
    this.sfxVolumeValue.setText(this.percent(audioSettings.sfxVolume))
    this.musicToggle.setText(audioSettings.musicMuted ? 'OFF' : 'ON')
    this.sfxToggle.setText(audioSettings.sfxMuted ? 'OFF' : 'ON')
  }

  private percent(volume: number): string {
    return `${Math.round(volume * VOLUME_SCALE)}%`
  }

  private label(x: number, y: number, text: string, size: number, color: string): Phaser.GameObjects.Text {
    const label = this.scene.add
      .text(x, y, text, { fontFamily: FONT_FAMILY, fontSize: `${size}px`, color })
      .setScrollFactor(0)
      .setDepth(DEPTH + 1)
    this.track(label)
    return label
  }

  private track(part: Phaser.GameObjects.GameObject): void {
    this.parts.push(part)
  }
}
