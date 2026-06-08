import Phaser from 'phaser'

import { FONT_FAMILY, MENU_BUTTON } from '@/constants/GameConstants'
import {
  changeMusicVolume,
  changeSfxVolume,
  setMusicMuted,
  setMusicTrack,
  setSfxMuted,
} from '@/services/audio'
import { audioSettings, MUSIC_TRACKS } from '@/services/audioSettings'
import { createMenuButton } from '@/ui/menuButton'

const DEPTH = 200
const DIM_ALPHA = 0.82
const CARD_W = 432
const CARD_H = 204
const CARD_FILL = 0x2c2b46
const CARD_RADIUS = 12
const TITLE_DY = 22
const FIRST_ROW_DY = 60
const ROW_GAP = 40
const CLOSE_DY = 182
const BTN_H = 22
const STEP_W = 26
const ARROW_W = 26
const TOGGLE_W = 44
const CLOSE_W = 120
const CLOSE_H = 24
const VALUE_COLOR = '#9fe0ff'
const LABEL_COLOR = '#ffffff'
const VOLUME_SCALE = 100

// Audio settings veil styled like the menu: a rounded card with a title, a track
// selector (< NAME >), and one row each for music and effects (mute toggle + volume
// steppers), built from the shared beveled button. Re-reads audioSettings after every
// change so labels and the selection stay current.
export class SettingsOverlay {
  private readonly parts: Phaser.GameObjects.GameObject[] = []
  private trackName!: Phaser.GameObjects.Text
  private musicValue!: Phaser.GameObjects.Text
  private sfxValue!: Phaser.GameObjects.Text
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
    const cx = width / 2
    const cy = height / 2
    const left = cx - CARD_W / 2
    const top = cy - CARD_H / 2
    const labelX = left + 30

    this.track(
      this.scene.add.rectangle(cx, cy, width, height, 0x000000, DIM_ALPHA).setScrollFactor(0).setDepth(DEPTH).setInteractive(),
    )

    const card = this.scene.add.graphics().setScrollFactor(0).setDepth(DEPTH)
    card.fillStyle(CARD_FILL, 1).fillRoundedRect(left, top, CARD_W, CARD_H, CARD_RADIUS)
    card.lineStyle(2, MENU_BUTTON.HIGHLIGHT, 1).strokeRoundedRect(left, top, CARD_W, CARD_H, CARD_RADIUS)
    this.track(card)

    this.text(cx, top + TITLE_DY, 'AUDIO', 14, LABEL_COLOR).setOrigin(0.5, 0)

    this.buildTrackRow(cx, labelX, top + FIRST_ROW_DY)
    this.musicValue = this.buildAudioRow(cx, labelX, top + FIRST_ROW_DY + ROW_GAP, 'MUSIC', {
      isMuted: () => audioSettings.musicMuted,
      toggle: () => setMusicMuted(!audioSettings.musicMuted),
      step: (direction) => changeMusicVolume(direction),
      label: (text) => (this.musicToggle = text),
    })
    this.sfxValue = this.buildAudioRow(cx, labelX, top + FIRST_ROW_DY + ROW_GAP * 2, 'EFFECTS', {
      isMuted: () => audioSettings.sfxMuted,
      toggle: () => setSfxMuted(!audioSettings.sfxMuted),
      step: (direction) => changeSfxVolume(direction),
      label: (text) => (this.sfxToggle = text),
    })

    this.button(cx, top + CLOSE_DY, 'CLOSE', this.onClose, CLOSE_W, CLOSE_H, MENU_BUTTON.FONT_SIZE)

    this.refresh()
  }

  private buildTrackRow(cx: number, labelX: number, y: number): void {
    this.text(labelX, y, 'TRACK', 8, LABEL_COLOR).setOrigin(0, 0.5)
    this.button(cx + 2, y, '<', () => this.cycleTrack(-1), ARROW_W, BTN_H, 12)
    this.trackName = this.text(cx + 78, y, '', 9, VALUE_COLOR).setOrigin(0.5)
    this.button(cx + 154, y, '>', () => this.cycleTrack(1), ARROW_W, BTN_H, 12)
  }

  // "LABEL  [mute] [-] NN% [+]"; returns the volume value text so refresh() updates it
  private buildAudioRow(
    cx: number,
    labelX: number,
    y: number,
    label: string,
    channel: {
      isMuted: () => boolean
      toggle: () => void
      step: (direction: number) => void
      label: (text: Phaser.GameObjects.Text) => void
    },
  ): Phaser.GameObjects.Text {
    this.text(labelX, y, label, 8, LABEL_COLOR).setOrigin(0, 0.5)
    channel.label(
      this.button(
        cx + 2,
        y,
        '',
        () => {
          channel.toggle()
          this.refresh()
        },
        TOGGLE_W,
        BTN_H,
        9,
      ),
    )
    this.button(cx + 60, y, '-', () => this.stepVolume(channel.step, -1), STEP_W, BTN_H, 13)
    const value = this.text(cx + 104, y, '', 9, VALUE_COLOR).setOrigin(0.5)
    this.button(cx + 150, y, '+', () => this.stepVolume(channel.step, 1), STEP_W, BTN_H, 13)
    return value
  }

  private cycleTrack(direction: number): void {
    const ids = MUSIC_TRACKS.map((track) => track.id)
    const index = ids.indexOf(audioSettings.track)
    setMusicTrack(ids[(index + direction + ids.length) % ids.length])
    this.refresh()
  }

  private stepVolume(step: (direction: number) => void, direction: number): void {
    step(direction)
    this.refresh()
  }

  private refresh(): void {
    const current = MUSIC_TRACKS.find((track) => track.id === audioSettings.track)
    this.trackName.setText(current?.label ?? '')
    this.musicValue.setText(this.percent(audioSettings.musicVolume))
    this.sfxValue.setText(this.percent(audioSettings.sfxVolume))
    this.musicToggle.setText(audioSettings.musicMuted ? 'OFF' : 'ON')
    this.sfxToggle.setText(audioSettings.sfxMuted ? 'OFF' : 'ON')
  }

  private percent(volume: number): string {
    return `${Math.round(volume * VOLUME_SCALE)}%`
  }

  // a beveled button; returns its label so toggle/value rows can update the text
  private button(
    x: number,
    y: number,
    label: string,
    onTap: () => void,
    width: number,
    height: number,
    fontSize: number,
  ): Phaser.GameObjects.Text {
    const created = createMenuButton(this.scene, { x, y, label, onTap, depth: DEPTH + 1, width, height, fontSize })
    created.forEach((part) => this.track(part))
    return created[1] as Phaser.GameObjects.Text
  }

  private text(x: number, y: number, value: string, size: number, color: string): Phaser.GameObjects.Text {
    const text = this.scene.add
      .text(x, y, value, { fontFamily: FONT_FAMILY, fontSize: `${size}px`, color })
      .setScrollFactor(0)
      .setDepth(DEPTH + 1)
    this.track(text)
    return text
  }

  private track(part: Phaser.GameObjects.GameObject): void {
    this.parts.push(part)
  }
}
