import Phaser from 'phaser'

import { BOX, BOX_BODY } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { TEXTURE_KEY } from '@/constants/keys'
import { BoxDebris } from '@/entities/BoxDebris'
import type { Loot } from '@/types/level'

// A crate lobbed by a box pig: it arcs, and breaks on landing or on a direct hit.
// Breaking bursts into debris and, if it held loot, drops it where it broke.
export class ThrownBox extends Phaser.Physics.Arcade.Sprite {
  private broken = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    directionX: number,
    private readonly loot: Loot,
  ) {
    super(scene, x, y, TEXTURE_KEY.BOX_IDLE, 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setDepth(BOX.DEPTH)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(BOX_BODY.WIDTH, BOX_BODY.HEIGHT, false)
    body.setOffset(BOX_BODY.OFFSET_X, BOX_BODY.OFFSET_Y)
    body.setVelocity(directionX * BOX.THROW_SPEED_X, BOX.THROW_SPEED_Y)
  }

  get isLive(): boolean {
    return !this.broken
  }

  // break on landing (keeps the loot drop; no extra slide)
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)
    if (!this.broken && (this.body as Phaser.Physics.Arcade.Body).blocked.down) {
      this.shatter()
    }
  }

  shatter(): void {
    if (this.broken) {
      return
    }
    this.broken = true

    const body = this.body as Phaser.Physics.Arcade.Body
    body.stop()
    body.enable = false

    BoxDebris.burst(this.scene, this.x, this.y)
    if (this.loot.kind !== 'empty') {
      this.scene.events.emit(ENTITY_EVENT.BOX_BROKEN, { x: this.x, y: this.y, loot: this.loot })
    }
    this.destroy()
  }
}
