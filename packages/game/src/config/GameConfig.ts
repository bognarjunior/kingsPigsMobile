import Phaser from 'phaser'

import { COLORS, DISPLAY, PHYSICS } from '@/constants/GameConstants'
import { BootScene } from '@/scenes/BootScene'
import { GameScene } from '@/scenes/GameScene'
import { MenuScene } from '@/scenes/MenuScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: DISPLAY.WIDTH,
  height: DISPLAY.HEIGHT,
  pixelArt: true,
  backgroundColor: COLORS.BACKGROUND,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: PHYSICS.GRAVITY },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene],
}
