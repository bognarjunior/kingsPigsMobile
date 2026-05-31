import Phaser from 'phaser'

import { StateMachine } from '@/behaviors/StateMachine'
import { KING_BODY, PLAYER } from '@/constants/GameConstants'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'
import type { InputState } from '@/types/input'
import type { PlayerState } from '@/types/player'

const completeEvent = (animKey: string): string =>
  `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animKey}`

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly stateMachine = new StateMachine<PlayerState>()
  private isAttacking = false
  private inCutscene = false

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEY.KING_IDLE, 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setCollideWorldBounds(true)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(KING_BODY.WIDTH, KING_BODY.HEIGHT, false)
    body.setOffset(KING_BODY.OFFSET_X, KING_BODY.OFFSET_Y)

    this.stateMachine
      .addState('idle', { onEnter: () => this.play(ANIM_KEY.KING_IDLE, true) })
      .addState('run', { onEnter: () => this.play(ANIM_KEY.KING_RUN, true) })
      .addState('jump', { onEnter: () => this.play(ANIM_KEY.KING_JUMP, true) })
      .addState('fall', { onEnter: () => this.play(ANIM_KEY.KING_FALL, true) })
      .addState('attack', { onEnter: () => this.enterAttack() })
      .addState('hurt', { onEnter: () => this.play(ANIM_KEY.KING_HIT, true) })
      .addState('dead', { onEnter: () => this.play(ANIM_KEY.KING_DEAD, true) })
      .addState('doorOut', { onEnter: () => this.play(ANIM_KEY.KING_DOOR_OUT, true) })
      .addState('doorIn', { onEnter: () => this.play(ANIM_KEY.KING_DOOR_IN, true) })

    this.stateMachine.setState('idle')
  }

  get playerState(): PlayerState {
    return this.stateMachine.state ?? 'idle'
  }

  get isBusy(): boolean {
    return this.inCutscene
  }

  beginCutscene(): void {
    this.inCutscene = true
    this.setVelocity(0, 0)
  }

  enterFromDoor(onComplete: () => void): void {
    this.inCutscene = true
    this.setVelocity(0, 0)
    this.stateMachine.setState('doorOut')
    this.once(completeEvent(ANIM_KEY.KING_DOOR_OUT), () => {
      this.inCutscene = false
      this.stateMachine.setState('idle')
      onComplete()
    })
  }

  exitIntoDoor(onComplete: () => void): void {
    this.inCutscene = true
    this.setVelocity(0, 0)
    this.stateMachine.setState('doorIn')
    this.once(completeEvent(ANIM_KEY.KING_DOOR_IN), () => {
      this.setVisible(false)
      onComplete()
    })
  }

  update(input: InputState): void {
    if (this.inCutscene) {
      return
    }

    this.handleInput(input)
    this.resolveState()
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

    if (input.attack && !this.isAttacking && body.blocked.down) {
      this.stateMachine.setState('attack')
    }
  }

  private resolveState(): void {
    if (this.isAttacking) {
      return
    }

    const body = this.body as Phaser.Physics.Arcade.Body

    if (!body.blocked.down) {
      this.stateMachine.setState(body.velocity.y < 0 ? 'jump' : 'fall')
    } else if (body.velocity.x !== 0) {
      this.stateMachine.setState('run')
    } else {
      this.stateMachine.setState('idle')
    }
  }

  private enterAttack(): void {
    this.isAttacking = true
    this.play(ANIM_KEY.KING_ATTACK, true)
    this.once(`${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${ANIM_KEY.KING_ATTACK}`, () => {
      this.isAttacking = false
    })
  }
}
