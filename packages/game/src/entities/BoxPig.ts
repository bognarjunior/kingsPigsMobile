import Phaser from 'phaser'

import { BOX_PIG, BOX_PIG_BODY } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'
import { BoxDebris } from '@/entities/BoxDebris'
import { Enemy } from '@/entities/Enemy'
import type { BoxPigHatch } from '@/types/enemy'

const completeEvent = (animKey: string): string =>
  `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animKey}`

// hidden: a closed crate among the loot · peek: eyes out · wind: jump anticipation
// · air: a single lunge toward the King · settle: sits, then bursts into a pig
type Phase = 'hidden' | 'peek' | 'wind' | 'air' | 'settle'

// A pig disguised as a crate. Camouflaged among the loot boxes, it peeks when the
// King is near, lunges once, settles for a moment, then bursts open and releases a
// real pig (boxpig:reveal). A hammer hit or stomp shatters it before it can hatch.
export class BoxPig extends Enemy {
  private phase: Phase = 'hidden'
  private dead = false
  private hatched = false

  constructor(scene: Phaser.Scene, x: number, y: number, private readonly hatchConfig: BoxPigHatch) {
    super(scene, x, y, TEXTURE_KEY.BOX_PIG_LOOK)
    this.setFrame(0) // closed crate — indistinguishable from a loot box

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(BOX_PIG_BODY.WIDTH, BOX_PIG_BODY.HEIGHT, false)
    body.setOffset(BOX_PIG_BODY.OFFSET_X, BOX_PIG_BODY.OFFSET_Y)
  }

  get isAlive(): boolean {
    return !this.dead
  }

  // only the airborne lunge hurts the King on contact
  get isLunging(): boolean {
    return this.phase === 'air'
  }

  // fragile crate: a hammer hit or stomp shatters it before it can hatch
  takeDamage(): void {
    this.shatter()
  }

  stomp(): void {
    this.shatter()
  }

  update(playerX: number, _playerY: number): void {
    if (this.dead) {
      return
    }

    if (this.phase === 'hidden') {
      if (Phaser.Math.Distance.Between(this.x, this.y, playerX, this.y) <= BOX_PIG.DETECT_RANGE) {
        this.startPeek(playerX)
      }
      return
    }

    if (this.phase === 'air') {
      const body = this.body as Phaser.Physics.Arcade.Body
      if (body.velocity.y < 0) {
        this.play(ANIM_KEY.BOX_PIG_JUMP, true)
      } else if (body.blocked.down) {
        this.land() // only once it is coming back down (avoids the launch-frame lag)
      } else {
        this.anims.stop()
        this.setTexture(TEXTURE_KEY.BOX_PIG_FALL)
      }
    }
    // peek / wind / settle are driven by animation-complete and timers
  }

  private startPeek(playerX: number): void {
    this.phase = 'peek'
    this.play(ANIM_KEY.BOX_PIG_LOOK, true)
    this.once(completeEvent(ANIM_KEY.BOX_PIG_LOOK), () => this.startWind(playerX))
  }

  private startWind(playerX: number): void {
    if (this.dead) {
      return
    }
    this.phase = 'wind'
    this.play(ANIM_KEY.BOX_PIG_ANTICIPATION, true)
    this.once(completeEvent(ANIM_KEY.BOX_PIG_ANTICIPATION), () => this.lunge(playerX))
  }

  private lunge(playerX: number): void {
    if (this.dead) {
      return
    }
    this.phase = 'air'
    const direction = Math.sign(playerX - this.x) || 1
    this.setVelocity(direction * BOX_PIG.HOP_SPEED, -BOX_PIG.HOP_VELOCITY_Y)
    this.play(ANIM_KEY.BOX_PIG_JUMP, true)
  }

  private land(): void {
    this.phase = 'settle'
    this.setVelocityX(0)
    this.anims.stop()
    // brief landing squash, then pop back to a whole closed crate while it waits
    this.setTexture(TEXTURE_KEY.BOX_PIG_GROUND)
    this.scene.time.delayedCall(BOX_PIG.LAND_FRAME_MS, () => {
      if (!this.dead) {
        this.setTexture(TEXTURE_KEY.BOX_PIG_LOOK, 0)
      }
    })
    this.scene.time.delayedCall(BOX_PIG.SETTLE_MS, () => this.releasePig())
  }

  // survived the settle: burst open and hand a real pig to the scene
  private releasePig(): void {
    if (this.dead || this.hatched) {
      return
    }
    this.hatched = true
    const floorY = (this.body as Phaser.Physics.Arcade.Body).bottom
    this.scene.events.emit(ENTITY_EVENT.BOXPIG_REVEAL, {
      x: this.x,
      floorY,
      type: this.hatchConfig.type,
      tier: this.hatchConfig.tier ?? 0,
      patrol: this.hatchConfig.patrol,
      source: this,
    })
    this.shatter()
  }

  // killed (or hatched): break the crate into debris and vanish
  private shatter(): void {
    if (this.dead) {
      return
    }
    this.dead = true
    const body = this.body as Phaser.Physics.Arcade.Body
    body.stop()
    body.enable = false
    BoxDebris.burst(this.scene, this.x, this.y)
    this.destroy()
  }
}
