import Phaser from 'phaser'

import { MeleeAttackBehavior } from '@/behaviors/MeleeAttackBehavior'
import { PatrolBehavior } from '@/behaviors/PatrolBehavior'
import { StateMachine } from '@/behaviors/StateMachine'
import { PIG, PIG_BODY } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'
import { Enemy } from '@/entities/Enemy'
import type { AttackBehavior, EnemyState } from '@/types/enemy'

const completeEvent = (animKey: string): string =>
  `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animKey}`

const HURT_TINT = 0xff6b6b
const STUN_TINT = 0xffe066

export class Pig extends Enemy {
  private readonly stateMachine = new StateMachine<EnemyState>()
  private readonly patrol: PatrolBehavior
  private readonly attack: AttackBehavior = new MeleeAttackBehavior(PIG.ATTACK_RANGE, PIG.ATTACK_COOLDOWN_MS)
  private health: number = PIG.MAX_HEALTH
  private isAttacking = false
  private isHurt = false
  private isStunned = false
  private isDead = false
  private patrolResting = true
  private patrolPhaseUntil = 0

  constructor(scene: Phaser.Scene, x: number, y: number, patrolRange: number) {
    super(scene, x, y, TEXTURE_KEY.PIG_IDLE)

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(PIG_BODY.WIDTH, PIG_BODY.HEIGHT, false)
    body.setOffset(PIG_BODY.OFFSET_X, PIG_BODY.OFFSET_Y)
    body.setDragX(PIG.KNOCKBACK_DRAG) // only decelerates the hurt knockback; movement overrides it each frame

    this.patrol = new PatrolBehavior(x - patrolRange, x + patrolRange, PIG.PATROL_SPEED)

    this.stateMachine
      .addState('idle', { onEnter: () => this.play(ANIM_KEY.PIG_IDLE, true) })
      .addState('run', { onEnter: () => this.play(ANIM_KEY.PIG_RUN, true) })
      .addState('attack', {})
      .addState('hurt', {})
      .addState('dead', {})

    this.stateMachine.setState('idle')
  }

  get isAlive(): boolean {
    return !this.isDead
  }

  takeDamage(amount: number, knockbackDir: number): void {
    if (this.isDead) {
      return
    }

    this.cancelAttack()
    this.health = Math.max(0, this.health - amount)
    if (this.health === 0) {
      this.die()
      return
    }

    this.isHurt = true
    this.setVelocityX(knockbackDir * PIG.KNOCKBACK_SPEED)
    this.setFlipX(knockbackDir < 0) // face back toward the hit (pig art faces left by default)
    this.setTint(HURT_TINT)
    this.stateMachine.setState('hurt')
    this.play(ANIM_KEY.PIG_HIT, true)
    this.once(completeEvent(ANIM_KEY.PIG_HIT), () => {
      this.isHurt = false
      this.clearTint()
    })
  }

  // jumped on from above: a hit plus a 1s stun (immobilised)
  stomp(): void {
    if (this.isDead || this.isStunned) {
      return
    }

    this.cancelAttack()
    this.health = Math.max(0, this.health - PIG.STOMP_DAMAGE)
    if (this.health === 0) {
      this.die()
      return
    }

    this.isHurt = false
    this.isStunned = true
    this.setVelocity(0, 0)
    this.setTint(STUN_TINT)
    this.stateMachine.setState('hurt')
    this.play(ANIM_KEY.PIG_HIT, true)
    this.scene.time.delayedCall(PIG.STUN_MS, () => {
      this.isStunned = false
      this.clearTint()
      this.stateMachine.setState('idle')
    })
  }

  update(playerX: number, playerY: number): void {
    if (this.isDead || this.isAttacking || this.isStunned) {
      this.setVelocityX(0)
      return
    }
    if (this.isHurt) {
      return // let the knockback slide; body drag decelerates it
    }

    const onGround = (this.body as Phaser.Physics.Arcade.Body).blocked.down
    const canSee = this.canSeePlayer(playerX, playerY)
    const distance = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY)

    const sameLevel = Math.abs(playerY - this.y) <= PIG.ATTACK_VERTICAL
    if (canSee && sameLevel && distance <= this.attack.range) {
      this.setVelocityX(0)
      this.setFlipX(playerX > this.x)
      if (onGround && this.attack.ready(this.scene.time.now)) {
        this.enterAttack(playerX)
      } else {
        this.stateMachine.setState('idle')
      }
      return
    }

    if (canSee) {
      const velocityX = Math.sign(playerX - this.x) * PIG.CHASE_SPEED
      this.setVelocityX(velocityX)
      this.handleMoveAnimation(velocityX)
      return
    }

    this.patrolStep()
  }

  // walks for a while, then pauses (idle) for a few seconds, like a guard's round
  private patrolStep(): void {
    const now = this.scene.time.now
    if (now >= this.patrolPhaseUntil) {
      this.patrolResting = !this.patrolResting
      const [min, max] = this.patrolResting
        ? [PIG.PATROL_PAUSE_MIN_MS, PIG.PATROL_PAUSE_MAX_MS]
        : [PIG.PATROL_WALK_MIN_MS, PIG.PATROL_WALK_MAX_MS]
      this.patrolPhaseUntil = now + Phaser.Math.Between(min, max)
    }

    if (this.patrolResting) {
      this.setVelocityX(0)
      this.stateMachine.setState('idle')
      return
    }

    const body = this.body as Phaser.Physics.Arcade.Body
    const velocityX = this.patrol.velocityFor(this.x, body.blocked.left, body.blocked.right)
    this.setVelocityX(velocityX)
    this.handleMoveAnimation(velocityX)
  }

  // front-facing vision cone: only sees the player ahead, within range and roughly level
  private canSeePlayer(playerX: number, playerY: number): boolean {
    const dx = playerX - this.x
    const facingRight = this.flipX
    const ahead = facingRight ? dx > 0 : dx < 0
    return (
      ahead &&
      Math.abs(dx) <= PIG.DETECTION_RANGE &&
      Math.abs(playerY - this.y) <= PIG.VISION_HEIGHT
    )
  }

  private handleMoveAnimation(velocityX: number): void {
    if (velocityX === 0) {
      this.stateMachine.setState('idle')
      return
    }

    // The pig artwork faces left by default, so flip when moving right.
    this.setFlipX(velocityX > 0)
    this.stateMachine.setState('run')
  }

  private enterAttack(playerX: number): void {
    this.isAttacking = true
    this.attack.trigger(this.scene.time.now)
    this.setVelocityX(0)
    this.stateMachine.setState('attack')
    this.play(ANIM_KEY.PIG_ATTACK, true)
    this.scene.events.emit(ENTITY_EVENT.ENEMY_ATTACK, {
      x: this.x,
      y: this.y,
      facingLeft: playerX < this.x,
    })
    this.once(completeEvent(ANIM_KEY.PIG_ATTACK), () => {
      this.isAttacking = false
      this.stateMachine.setState('idle')
    })
  }

  private cancelAttack(): void {
    this.isAttacking = false
    this.off(completeEvent(ANIM_KEY.PIG_ATTACK))
  }

  private die(): void {
    this.isDead = true
    this.cancelAttack()
    this.clearTint()
    const body = this.body as Phaser.Physics.Arcade.Body
    body.stop()
    body.enable = false // leave all collisions/overlaps immediately — no invisible block
    this.stateMachine.setState('dead')
    this.play(ANIM_KEY.PIG_DEAD, true)
    this.scene.time.delayedCall(PIG.DEAD_LINGER_MS, () => this.destroy())
  }
}
