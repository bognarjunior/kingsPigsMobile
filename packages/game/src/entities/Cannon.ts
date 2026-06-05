import Phaser from 'phaser'

import { CANNON, CANNON_SPRITE } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'
import type { CannonFacing } from '@/types/level'

const completeEvent = (animKey: string): string =>
  `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animKey}`

// scenery: sits behind the pigs/King so a pig manning it is drawn in front
const DEPTH = 4

// Fixed scenery that aims one way (art points left; flipped to aim right). It is
// indestructible — its match pig is the kill target. fire() recoils and spits a
// ball from the muzzle on the flash frame; the scene owns the projectile.
export class Cannon extends Phaser.Physics.Arcade.Sprite {
  readonly directionX: number
  private firing = false
  private lastFireAt = Number.NEGATIVE_INFINITY

  constructor(scene: Phaser.Scene, x: number, y: number, facing: CannonFacing) {
    super(scene, x, y, TEXTURE_KEY.CANNON_IDLE, 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setOrigin(0.5, 1)
    this.setDepth(DEPTH)

    this.directionX = facing === 'right' ? 1 : -1
    this.setFlipX(this.directionX > 0)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setImmovable(true)
  }

  // the spot a pig stands on to man it (the back/breech, by the fuse)
  get operatingX(): number {
    return this.x - this.directionX * CANNON.BREECH_OFFSET_X
  }

  canFire(now: number): boolean {
    return !this.firing && now - this.lastFireAt >= CANNON.COOLDOWN_MS
  }

  // the King is in front of the muzzle, in range, at the barrel's height
  lineOfFire(playerX: number, playerY: number): boolean {
    const dx = playerX - this.x
    const aimed = this.directionX < 0 ? dx < 0 : dx > 0
    return aimed && Math.abs(dx) <= CANNON.FIRE_RANGE && Math.abs(playerY - this.y) <= CANNON.LINE_HEIGHT
  }

  fire(): void {
    if (this.firing) {
      return
    }
    this.firing = true
    this.lastFireAt = this.scene.time.now
    this.play(ANIM_KEY.CANNON_SHOOT, true)

    const onFrame = (_anim: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame): void => {
      if (frame.index >= CANNON.SHOOT_RELEASE_FRAME) {
        this.off(Phaser.Animations.Events.ANIMATION_UPDATE, onFrame)
        this.scene.events.emit(ENTITY_EVENT.CANNON_FIRE, {
          x: this.x + this.directionX * CANNON.MUZZLE_OFFSET_X,
          y: this.y - CANNON_SPRITE.FRAME_HEIGHT / 2 + CANNON.MUZZLE_OFFSET_Y,
          directionX: this.directionX,
        })
      }
    }
    this.on(Phaser.Animations.Events.ANIMATION_UPDATE, onFrame)
    this.once(completeEvent(ANIM_KEY.CANNON_SHOOT), () => {
      this.firing = false
      this.setTexture(TEXTURE_KEY.CANNON_IDLE, 0)
    })
  }
}
