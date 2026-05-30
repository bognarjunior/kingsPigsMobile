import Phaser from 'phaser'

import { PLAYER } from '@/constants/GameConstants'
import { TEXTURE_KEY } from '@/constants/keys'
import type { InputState } from '@/types/input'
import type { PlayerState } from '@/types/player'

export class Player extends Phaser.Physics.Arcade.Sprite {
  private currentState: PlayerState = 'idle'

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEY.KING, 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.setCollideWorldBounds(true)
  }

  get playerState(): PlayerState {
    return this.currentState
  }

  update(input: InputState): void {
    this.handleInput(input)
    this.handlePhysics()
  }

  private handleInput(input: InputState): void {
    const body = this.body as Phaser.Physics.Arcade.Body

    if (input.left) {
      this.setVelocityX(-PLAYER.SPEED)
      this.setFlipX(true)
    } else if (input.right) {
      this.setVelocityX(PLAYER.SPEED)
      this.setFlipX(false)
    } else {
      this.setVelocityX(0)
    }

    if (input.jump && body.blocked.down) {
      this.setVelocityY(PLAYER.JUMP_VELOCITY)
    }
  }

  private handlePhysics(): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    const onGround = body.blocked.down

    if (!onGround) {
      this.currentState = body.velocity.y < 0 ? 'jump' : 'fall'
    } else if (body.velocity.x !== 0) {
      this.currentState = 'run'
    } else {
      this.currentState = 'idle'
    }
  }
}
