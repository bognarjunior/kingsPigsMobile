import Phaser from 'phaser'

import { StateMachine } from '@/behaviors/StateMachine'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'
import type { DoorState } from '@/types/door'

const CLOSED_FRAME = 0
const completeEvent = (animKey: string): string =>
  `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animKey}`

export class Door extends Phaser.Physics.Arcade.Sprite {
  private readonly stateMachine = new StateMachine<DoorState>()
  private onOpened?: () => void
  private onClosed?: () => void

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TEXTURE_KEY.DOOR_IDLE, CLOSED_FRAME)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setOrigin(0.5, 1)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setImmovable(true)

    this.stateMachine
      .addState('closed', { onEnter: () => this.setTexture(TEXTURE_KEY.DOOR_IDLE, CLOSED_FRAME) })
      .addState('opening', { onEnter: () => this.playOpening() })
      .addState('open', {})
      .addState('closing', { onEnter: () => this.playClosing() })

    this.stateMachine.setState('closed')
  }

  open(onOpened?: () => void): void {
    this.onOpened = onOpened
    this.stateMachine.setState('opening')
  }

  close(onClosed?: () => void): void {
    this.onClosed = onClosed
    this.stateMachine.setState('closing')
  }

  private playOpening(): void {
    this.play(ANIM_KEY.DOOR_OPENING, true)
    this.once(completeEvent(ANIM_KEY.DOOR_OPENING), () => {
      this.stateMachine.setState('open')
      this.onOpened?.()
    })
  }

  private playClosing(): void {
    this.play(ANIM_KEY.DOOR_CLOSING, true)
    this.once(completeEvent(ANIM_KEY.DOOR_CLOSING), () => {
      this.stateMachine.setState('closed')
      this.onClosed?.()
    })
  }
}
