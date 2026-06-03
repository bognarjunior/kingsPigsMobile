import Phaser from 'phaser'

import { BOX, BOX_BODY } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { TEXTURE_KEY } from '@/constants/keys'
import { BoxDebris } from '@/entities/BoxDebris'
import type { Loot } from '@/types/level'

// A crate resting on the ground. The King's hammer (or a thrown crate, later)
// smashes it: it bursts into debris and announces its loot for the scene to drop.
export class BreakableBox extends Phaser.Physics.Arcade.Sprite {
  private broken = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly loot: Loot,
  ) {
    super(scene, x, y, TEXTURE_KEY.BOX_IDLE, 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setDepth(BOX.DEPTH)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(BOX_BODY.WIDTH, BOX_BODY.HEIGHT, false)
    body.setOffset(BOX_BODY.OFFSET_X, BOX_BODY.OFFSET_Y)
    body.setAllowGravity(false)
    body.setImmovable(true)
  }

  get isIntact(): boolean {
    return !this.broken
  }

  smash(): void {
    if (this.broken) {
      return
    }
    this.broken = true

    BoxDebris.burst(this.scene, this.x, this.y)
    this.scene.events.emit(ENTITY_EVENT.BOX_BROKEN, { x: this.x, y: this.y, loot: this.loot })
    this.destroy()
  }
}
