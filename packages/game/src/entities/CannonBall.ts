import Phaser from 'phaser'

import { CANNON, CANNON_BALL_BODY, CANNON_SPRITE, PHYSICS } from '@/constants/GameConstants'
import { TEXTURE_KEY } from '@/constants/keys'

const DEPTH = 6
const LIFETIME_MS = 3000

// A ballistic shot: it arcs under a gentle gravity. On a direct hit it damages
// the King; when it lands the scene turns it into a lit Bomb that then explodes.
// A lifetime failsafe cleans up any stray that never touches a solid.
export class CannonBall extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, directionX: number) {
    super(scene, x, y, TEXTURE_KEY.CANNON_BALL, 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setDepth(DEPTH)
    // origin on the ball art so it spawns exactly at the muzzle point
    this.setOrigin(
      (CANNON_BALL_BODY.OFFSET_X + CANNON_BALL_BODY.WIDTH / 2) / CANNON_SPRITE.FRAME_WIDTH,
      (CANNON_BALL_BODY.OFFSET_Y + CANNON_BALL_BODY.HEIGHT / 2) / CANNON_SPRITE.FRAME_HEIGHT,
    )

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(CANNON_BALL_BODY.WIDTH, CANNON_BALL_BODY.HEIGHT, false)
    body.setOffset(CANNON_BALL_BODY.OFFSET_X, CANNON_BALL_BODY.OFFSET_Y)
    // ballistic: forward + slight lift, light drag, gentle custom gravity
    body.setAllowGravity(true)
    body.setGravityY(CANNON.BALL_GRAVITY - PHYSICS.GRAVITY)
    body.setDragX(CANNON.BALL_DRAG_X)
    body.setVelocity(directionX * CANNON.BALL_SPEED, CANNON.BALL_LAUNCH_Y)

    scene.time.delayedCall(LIFETIME_MS, () => this.destroy())
  }
}
