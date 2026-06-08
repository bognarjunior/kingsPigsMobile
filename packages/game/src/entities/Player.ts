import Phaser from 'phaser'

import { StateMachine } from '@/behaviors/StateMachine'
import { KING_BODY, PLAYER } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { ANIM_KEY, SOUND_KEY, TEXTURE_KEY } from '@/constants/keys'
import { playSfx } from '@/services/audio'
import { runProfile } from '@/services/runProfile'
import type { InputState } from '@/types/input'
import type { PlayerState } from '@/types/player'

const completeEvent = (animKey: string): string =>
  `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animKey}`

const HURT_TINT = 0xff6b6b

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly stateMachine = new StateMachine<PlayerState>()
  private isAttacking = false
  private isHurt = false
  private isDead = false
  private inCutscene = false
  private maxHeartsCount: number = Math.min(
    PLAYER.MAX_HEARTS_CAP,
    PLAYER.MAX_HEARTS + runProfile.maxHeartBonusValue,
  )
  private hearts: number = this.maxHeartsCount
  private invulnerableUntil = 0

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

  get currentHearts(): number {
    return this.hearts
  }

  get maxHearts(): number {
    return this.maxHeartsCount
  }

  collectDiamond(amount = 1): void {
    runProfile.addDiamonds(amount)
    this.scene.events.emit(ENTITY_EVENT.PLAYER_DIAMONDS, runProfile.diamonds)
  }

  // a heart only refills lost health, up to the current max; raising the max is
  // a shop purchase (see docs/LEVEL_DESIGN.md), never automatic.
  collectHeart(): void {
    this.hearts = Math.min(this.maxHeartsCount, this.hearts + 1)
    this.scene.events.emit(ENTITY_EVENT.PLAYER_HEALTH, this.hearts)
  }

  // shop "+1 max heart": grow the cap and fill the new heart
  raiseMaxHearts(): void {
    if (this.maxHeartsCount >= PLAYER.MAX_HEARTS_CAP) {
      return
    }
    this.maxHeartsCount += 1
    this.hearts += 1
    this.scene.events.emit(ENTITY_EVENT.PLAYER_MAX_HEARTS, this.maxHeartsCount)
    this.scene.events.emit(ENTITY_EVENT.PLAYER_HEALTH, this.hearts)
  }

  get maxedHearts(): boolean {
    return this.maxHeartsCount >= PLAYER.MAX_HEARTS_CAP
  }

  // shop "invulnerability": a timed shield (reuses the hurt i-frame window) + blink
  grantInvulnerability(ms: number): void {
    this.invulnerableUntil = this.scene.time.now + ms
    this.scene.tweens.add({
      targets: this,
      alpha: 0.4,
      duration: 160,
      yoyo: true,
      repeat: Math.floor(ms / 320),
      onComplete: () => this.setAlpha(1),
    })
  }

  beginCutscene(): void {
    this.inCutscene = true
    this.setVelocity(0, 0)
  }

  enterFromDoor(onComplete: () => void, facingLeft = false): void {
    this.inCutscene = true
    this.setVelocity(0, 0)
    this.face(facingLeft)
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

  takeDamage(amount: number): void {
    if (
      this.isDead ||
      this.inCutscene ||
      this.isAttacking ||
      this.scene.time.now < this.invulnerableUntil
    ) {
      return
    }

    // cancel an in-progress attack so its (now interrupted) complete handler
    // can't leave the King stuck with isAttacking forever
    this.isAttacking = false
    this.off(completeEvent(ANIM_KEY.KING_ATTACK))

    this.hearts = Math.max(0, this.hearts - amount)
    this.scene.events.emit(ENTITY_EVENT.PLAYER_HEALTH, this.hearts)
    playSfx(SOUND_KEY.HURT)
    if (this.hearts === 0) {
      this.die()
      return
    }

    this.invulnerableUntil = this.scene.time.now + PLAYER.HURT_INVULN_MS
    this.isHurt = true
    this.setVelocityX(0)
    this.setTint(HURT_TINT)
    this.stateMachine.setState('hurt')
    this.once(completeEvent(ANIM_KEY.KING_HIT), () => {
      this.isHurt = false
    })
    this.scene.time.delayedCall(PLAYER.HURT_INVULN_MS, () => this.clearTint())
  }

  bounce(): void {
    if (this.isDead) {
      return
    }
    this.setVelocityY(-PLAYER.STOMP_BOUNCE)
  }

  update(input: InputState): void {
    if (this.inCutscene || this.isDead) {
      return
    }

    this.handleInput(input)
    this.resolveState()
  }

  private handleInput(input: InputState): void {
    const body = this.body as Phaser.Physics.Arcade.Body

    if (this.isHurt) {
      return
    }

    if (input.left) {
      this.setVelocityX(-PLAYER.SPEED)
      this.face(true)
    } else if (input.right) {
      this.setVelocityX(PLAYER.SPEED)
      this.face(false)
    } else {
      this.setVelocityX(0)
    }

    if (input.jump && body.blocked.down) {
      this.setVelocityY(PLAYER.JUMP_VELOCITY)
      playSfx(SOUND_KEY.JUMP)
    }

    if (input.attack && !this.isAttacking && body.blocked.down) {
      this.stateMachine.setState('attack')
    }
  }

  private face(facingLeft: boolean): void {
    this.setFlipX(facingLeft)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setOffset(facingLeft ? KING_BODY.OFFSET_X_FLIPPED : KING_BODY.OFFSET_X, KING_BODY.OFFSET_Y)
  }

  private resolveState(): void {
    if (this.isAttacking || this.isHurt) {
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
    playSfx(SOUND_KEY.ATTACK)
    this.scene.events.emit(ENTITY_EVENT.PLAYER_ATTACK, {
      x: this.x,
      y: this.y,
      facingLeft: this.flipX,
    })
    this.once(completeEvent(ANIM_KEY.KING_ATTACK), () => {
      this.isAttacking = false
    })
  }

  private die(): void {
    this.isDead = true
    this.setVelocity(0, 0)
    this.clearTint()
    this.stateMachine.setState('dead')
    this.once(completeEvent(ANIM_KEY.KING_DEAD), () => {
      this.scene.events.emit(ENTITY_EVENT.PLAYER_DIED)
    })
  }
}
