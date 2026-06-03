import Phaser from 'phaser'

import { BOX } from '@/constants/GameConstants'
import { TEXTURE_KEY } from '@/constants/keys'

// A shard of a smashed crate: pops outward, arcs under gravity, fades, then
// removes itself. Purely cosmetic — it carries no game logic.
export class BoxDebris extends Phaser.Physics.Arcade.Sprite {
  static burst(scene: Phaser.Scene, x: number, y: number): void {
    for (let i = 0; i < BOX.PIECE_COUNT; i++) {
      new BoxDebris(scene, x, y, i)
    }
  }

  private constructor(scene: Phaser.Scene, x: number, y: number, frame: number) {
    super(scene, x, y, TEXTURE_KEY.BOX_PIECES, frame)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setDepth(BOX.DEPTH)

    const direction = frame % 2 === 0 ? -1 : 1
    const speedX = Phaser.Math.Between(BOX.PIECE_SPEED_MIN, BOX.PIECE_SPEED_MAX) * direction
    const speedY = -Phaser.Math.Between(BOX.PIECE_UP_MIN, BOX.PIECE_UP_MAX)
    ;(this.body as Phaser.Physics.Arcade.Body).setVelocity(speedX, speedY)

    scene.tweens.add({ targets: this, alpha: 0, duration: BOX.PIECE_LIFETIME_MS })
    scene.time.delayedCall(BOX.PIECE_LIFETIME_MS, () => this.destroy())
  }
}
