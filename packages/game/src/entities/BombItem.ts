import Phaser from 'phaser'

import { BOMB_BODY, PICKUP } from '@/constants/GameConstants'
import { TEXTURE_KEY } from '@/constants/keys'

// An unlit bomb resting on the ground, waiting for a thrower to pick it up.
// It falls and settles on the solid layer; the scene wires the pickup overlap.
export class BombItem extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEY.BOMB_OFF, 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setDepth(PICKUP.DEPTH)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(BOMB_BODY.WIDTH, BOMB_BODY.HEIGHT, false)
    body.setOffset(BOMB_BODY.OFFSET_X, BOMB_BODY.OFFSET_Y)
    body.setAllowGravity(false)
    body.setImmovable(true)
  }

  consume(): void {
    this.destroy()
  }
}
