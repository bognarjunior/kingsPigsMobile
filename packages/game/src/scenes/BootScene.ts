import Phaser from 'phaser'

import { DISPLAY, KING } from '@/constants/GameConstants'
import { SCENE_KEY, TEXTURE_KEY } from '@/constants/keys'
import kingIdleUrl from '@/assets/king/idle.png'

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEY.BOOT)
  }

  preload(): void {
    this.add
      .text(DISPLAY.WIDTH / 2, DISPLAY.HEIGHT / 2, 'Loading...', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.load.spritesheet(TEXTURE_KEY.KING, kingIdleUrl, {
      frameWidth: KING.FRAME_WIDTH,
      frameHeight: KING.FRAME_HEIGHT,
    })
  }

  create(): void {
    this.scene.start(SCENE_KEY.MENU)
  }
}
