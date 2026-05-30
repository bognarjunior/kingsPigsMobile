import Phaser from 'phaser'

import { PatrolBehavior } from '@/behaviors/PatrolBehavior'
import { PIG, PIG_BODY } from '@/constants/GameConstants'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'
import { Enemy } from '@/entities/Enemy'

export class Pig extends Enemy {
  private readonly patrol: PatrolBehavior

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEY.PIG_IDLE)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(PIG_BODY.WIDTH, PIG_BODY.HEIGHT, false)
    body.setOffset(PIG_BODY.OFFSET_X, PIG_BODY.OFFSET_Y)

    const halfRange = PIG.PATROL_DISTANCE / 2
    this.patrol = new PatrolBehavior(x - halfRange, x + halfRange, PIG.PATROL_SPEED)
    this.play(ANIM_KEY.PIG_IDLE, true)
  }

  update(playerX: number, playerY: number): void {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY)
    const velocityX =
      distance <= PIG.DETECTION_RANGE
        ? Math.sign(playerX - this.x) * PIG.CHASE_SPEED
        : this.patrol.velocityFor(this.x)

    this.setVelocityX(velocityX)
    this.handleAnimation(velocityX)
  }

  private handleAnimation(velocityX: number): void {
    if (velocityX === 0) {
      this.play(ANIM_KEY.PIG_IDLE, true)
      return
    }

    // The pig artwork faces left by default (opposite of the king), so flip when moving right.
    this.setFlipX(velocityX > 0)
    this.play(ANIM_KEY.PIG_RUN, true)
  }
}
