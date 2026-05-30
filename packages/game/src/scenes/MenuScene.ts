import Phaser from 'phaser'

import { MENU } from '@/constants/GameConstants'
import { SCENE_KEY } from '@/constants/keys'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEY.MENU)
  }

  create(): void {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2 - MENU.TITLE_GAP, 'KINGS AND PIGS', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.add
      .text(this.scale.width / 2, this.scale.height / 2 + MENU.TITLE_GAP, 'tap / press any key to play', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#c0c0c0',
      })
      .setOrigin(0.5)

    this.input.once(Phaser.Input.Events.POINTER_DOWN, this.startGame, this)
    this.input.keyboard?.once(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.startGame, this)
  }

  private startGame(): void {
    this.scene.start(SCENE_KEY.GAME)
  }
}
