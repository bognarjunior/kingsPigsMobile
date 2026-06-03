import Phaser from 'phaser'

import { PICKUP } from '@/constants/GameConstants'

// A floating collectible (heart, diamond, ...) that plays its idle animation.
// The scene wires the overlap and calls collect(); the pickup owns no game logic.
export class Pickup extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, idleAnim: string) {
    super(scene, x, y, texture, 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setDepth(PICKUP.DEPTH)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setImmovable(true)

    this.play(idleAnim, true)
  }

  collect(): void {
    this.destroy()
  }
}
