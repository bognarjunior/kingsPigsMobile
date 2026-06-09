import Phaser from 'phaser'

import { COLORS, DISPLAY, INPUT, PHYSICS } from '@/constants/GameConstants'
import { BootScene } from '@/scenes/BootScene'
import { GameScene } from '@/scenes/GameScene'
import { MenuScene } from '@/scenes/MenuScene'

// Keep a fixed pixel-art height and derive the width from the device's landscape
// aspect ratio, so Scale.FIT fills the whole screen with no letterbox bars.
function computeGameWidth(): number {
  if (typeof window === 'undefined' || !window.screen) {
    return DISPLAY.WIDTH
  }
  const { width, height } = window.screen
  const aspect = Math.max(width, height) / Math.min(width, height)
  return Math.round(DISPLAY.HEIGHT * aspect)
}

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: computeGameWidth(),
  height: DISPLAY.HEIGHT,
  pixelArt: true,
  backgroundColor: COLORS.BACKGROUND,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: INPUT.ACTIVE_POINTERS,
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
