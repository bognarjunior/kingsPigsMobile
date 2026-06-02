import Phaser from 'phaser'

import { PICKUP } from '@/constants/GameConstants'
import { TEXTURE_KEY } from '@/constants/keys'

// A floating heart the King walks into to raise his maximum hearts. The scene
// wires the overlap and calls collect(); the pickup owns no game logic.
export class HeartPickup extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEY.BIG_HEART, 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setDepth(PICKUP.DEPTH)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setImmovable(true)
  }

  collect(): void {
    this.destroy()
  }
}
