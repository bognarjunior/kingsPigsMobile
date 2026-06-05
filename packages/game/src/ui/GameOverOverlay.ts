import Phaser from 'phaser'

const DEPTH = 200
const DIM_ALPHA = 0.92

// A full-screen game-over veil sized to the actual camera viewport (which is
// wider than the base resolution on tall screens), dismissed by a tap or any key.
// The scene decides what "continue" does (restart the run).
export class GameOverOverlay {
  constructor(scene: Phaser.Scene, onContinue: () => void) {
    const { width, height } = scene.cameras.main
    const cx = width / 2
    const cy = height / 2

    scene.add
      .rectangle(cx, cy, width, height, 0x000000, DIM_ALPHA)
      .setScrollFactor(0)
      .setDepth(DEPTH)

    scene.add
      .text(cx, cy - 14, 'GAME OVER', { fontFamily: 'monospace', fontSize: '24px', color: '#ffffff' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH + 1)

    scene.add
      .text(cx, cy + 16, 'tap to retry', { fontFamily: 'monospace', fontSize: '12px', color: '#cfcfcf' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH + 1)

    scene.input.once(Phaser.Input.Events.POINTER_DOWN, onContinue)
    scene.input.keyboard?.once('keydown', onContinue)
  }
}
