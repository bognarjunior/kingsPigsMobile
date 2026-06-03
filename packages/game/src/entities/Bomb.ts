import Phaser from 'phaser'

import { BOMB, BOMB_BODY } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'

const completeEvent = (animKey: string): string =>
  `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animKey}`

const DEPTH = 9

// A thrown bomb: arcs (gravity), bounces, burns its fuse, then explodes and
// emits bomb:explode for the CombatSystem to resolve area damage.
export class Bomb extends Phaser.Physics.Arcade.Sprite {
  private exploded = false

  constructor(scene: Phaser.Scene, x: number, y: number, directionX: number) {
    super(scene, x, y, TEXTURE_KEY.BOMB_ON, 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setDepth(DEPTH)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(BOMB_BODY.WIDTH, BOMB_BODY.HEIGHT, false)
    body.setOffset(BOMB_BODY.OFFSET_X, BOMB_BODY.OFFSET_Y)
    body.setVelocity(directionX * BOMB.THROW_SPEED_X, BOMB.THROW_SPEED_Y)

    this.play(ANIM_KEY.BOMB_ON, true)
    scene.time.delayedCall(BOMB.FUSE_MS, () => this.explode())
  }

  // stop the horizontal slide the moment it lands (keeps the arc, kills the skid)
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)
    const body = this.body as Phaser.Physics.Arcade.Body
    if (!this.exploded && body.blocked.down) {
      body.setVelocityX(0)
    }
  }

  private explode(): void {
    if (this.exploded || !this.active) {
      return
    }
    this.exploded = true

    const body = this.body as Phaser.Physics.Arcade.Body
    body.stop()
    body.enable = false

    this.scene.events.emit(ENTITY_EVENT.BOMB_EXPLODE, { x: this.x, y: this.y })
    this.play(ANIM_KEY.BOMB_BOOM, true)
    this.once(completeEvent(ANIM_KEY.BOMB_BOOM), () => this.destroy())
  }
}
