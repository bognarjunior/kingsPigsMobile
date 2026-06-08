import Phaser from 'phaser'

import { FONT_FAMILY, MENU, SETTINGS_BUTTON } from '@/constants/GameConstants'
import { SCENE_KEY } from '@/constants/keys'
import { SettingsOverlay } from '@/ui/SettingsOverlay'

export class MenuScene extends Phaser.Scene {
  private settings?: SettingsOverlay

  constructor() {
    super(SCENE_KEY.MENU)
  }

  create(): void {
    const { width, height } = this.cameras.main

    this.add
      .text(width / 2, height / 2 - MENU.TITLE_GAP, 'KINGS AND PIGS', {
        fontFamily: FONT_FAMILY,
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + MENU.TITLE_GAP, 'TAP TO PLAY', {
        fontFamily: FONT_FAMILY,
        fontSize: '8px',
        color: '#c0c0c0',
      })
      .setOrigin(0.5)

    // a full-screen zone (below the settings button) turns any empty tap into
    // "play"; the button and the settings veil sit on top and absorb their taps
    const tapZone = this.add.zone(0, 0, width, height).setOrigin(0).setInteractive()
    tapZone.on(Phaser.Input.Events.POINTER_DOWN, this.startGame, this)

    this.createSettingsButton()
    this.input.keyboard?.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.startGame, this)
  }

  private createSettingsButton(): void {
    const button = this.add
      .rectangle(SETTINGS_BUTTON.X, SETTINGS_BUTTON.Y, SETTINGS_BUTTON.WIDTH, SETTINGS_BUTTON.HEIGHT, 0x000000, 0.45)
      .setStrokeStyle(1, 0xffffff, 0.6)
      .setInteractive({ useHandCursor: true })
    this.add
      .text(SETTINGS_BUTTON.X, SETTINGS_BUTTON.Y, 'AUDIO', {
        fontFamily: FONT_FAMILY,
        fontSize: `${SETTINGS_BUTTON.FONT_SIZE}px`,
        color: '#ffffff',
      })
      .setOrigin(0.5)
    button.on(Phaser.Input.Events.POINTER_DOWN, () => this.openSettings())
  }

  private openSettings(): void {
    if (this.settings) {
      return
    }
    this.settings = new SettingsOverlay(this, () => this.closeSettings())
  }

  private closeSettings(): void {
    this.settings?.destroy()
    this.settings = undefined
  }

  private startGame(): void {
    if (this.settings) {
      return // ignore the tap-to-play while the settings panel is open
    }
    this.scene.start(SCENE_KEY.GAME)
  }
}
