import Phaser from 'phaser'

import { MeleeAttackBehavior } from '@/behaviors/MeleeAttackBehavior'
import { PatrolBehavior } from '@/behaviors/PatrolBehavior'
import { StateMachine } from '@/behaviors/StateMachine'
import { KING_PIG, KING_PIG_BODY, PIG_TIERS } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'
import { Enemy } from '@/entities/Enemy'
import type { AttackBehavior, EnemyState, PigTier } from '@/types/enemy'
import type { BossSummon } from '@/types/kingPig'

const completeEvent = (animKey: string): string =>
  `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animKey}`

const HURT_TINT = 0xff6b6b
const STUN_TINT = 0xffe066

export class KingPig extends Enemy {
  private readonly stateMachine = new StateMachine<EnemyState>()
  private readonly patrol: PatrolBehavior
  private readonly attack: AttackBehavior
  private readonly colorSuffix: string
  private readonly contactDamage: number
  private readonly summons: readonly BossSummon[]
  private readonly firedSummons = new Set<number>()
  private readonly maxHealth: number
  private health: number
  private isAttacking = false
  private isHurt = false
  private isStunned = false
  private isDead = false

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrolRange: number,
    tierIndex: number,
    summons: readonly BossSummon[] = [],
    contactDamage?: number,
  ) {
    const tier = PIG_TIERS[tierIndex] ?? PIG_TIERS[0]
    const colorSuffix = tier.name ? `-${tier.name}` : ''
    super(scene, x, y, TEXTURE_KEY.KING_PIG_IDLE + colorSuffix)

    this.colorSuffix = colorSuffix
    this.contactDamage = contactDamage ?? tier.heartDamage
    this.maxHealth = tier.health * KING_PIG.HEALTH_MULTIPLIER
    this.health = this.maxHealth
    this.summons = summons
    this.attack = new MeleeAttackBehavior(
      KING_PIG.ATTACK_RANGE,
      KING_PIG.ATTACK_COOLDOWN_MS,
      ANIM_KEY.KING_PIG_ATTACK,
      KING_PIG.ATTACK_RELEASE_FRAME,
    )

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setDragX(KING_PIG.KNOCKBACK_DRAG)
    body.setSize(KING_PIG_BODY.WIDTH, KING_PIG_BODY.HEIGHT, false)
    body.setOffset(KING_PIG_BODY.OFFSET_X, KING_PIG_BODY.OFFSET_Y)

    this.patrol = new PatrolBehavior(
      x - patrolRange,
      x + patrolRange,
      KING_PIG.PATROL_SPEED * tier.speedScale,
    )

    this.stateMachine
      .addState('idle', { onEnter: () => this.play(this.tierAnim(ANIM_KEY.KING_PIG_IDLE), true) })
      .addState('run', { onEnter: () => this.play(this.tierAnim(ANIM_KEY.KING_PIG_RUN), true) })
      .addState('attack', {})
      .addState('hurt', {})
      .addState('dead', {})

    this.stateMachine.setState('idle')
    this.emitHealth()
  }

  get isAlive(): boolean {
    return !this.isDead
  }

  get bossMaxHealth(): number {
    return this.maxHealth
  }

  takeDamage(amount: number, knockbackDir: number): void {
    if (this.isDead) {
      return
    }

    this.cancelAttack()
    this.health = Math.max(0, this.health - amount)
    this.emitHealth()
    this.checkSummons()

    if (this.health === 0) {
      this.die()
      return
    }

    this.isHurt = true
    this.setVelocityX(knockbackDir * KING_PIG.KNOCKBACK_SPEED)
    this.setFlipX(knockbackDir < 0)
    this.setTint(HURT_TINT)
    this.stateMachine.setState('hurt')
    this.play(this.tierAnim(ANIM_KEY.KING_PIG_HIT), true)
    this.once(completeEvent(this.tierAnim(ANIM_KEY.KING_PIG_HIT)), () => {
      this.isHurt = false
      this.clearTint()
      this.stateMachine.setState('idle')
    })
  }

  stomp(): void {
    if (this.isDead || this.isStunned) {
      return
    }

    this.cancelAttack()
    this.health = Math.max(0, this.health - KING_PIG.STOMP_DAMAGE)
    this.emitHealth()
    this.checkSummons()

    if (this.health === 0) {
      this.die()
      return
    }

    this.isHurt = false
    this.isStunned = true
    this.setVelocity(0, 0)
    this.setTint(STUN_TINT)
    this.stateMachine.setState('hurt')
    this.play(this.tierAnim(ANIM_KEY.KING_PIG_HIT), true)
    this.scene.time.delayedCall(KING_PIG.STUN_MS, () => {
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
      return
    }

    const body = this.body as Phaser.Physics.Arcade.Body
    const onGround = body.blocked.down
    const canSee = this.canSeePlayer(playerX, playerY)
    const distance = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY)
    const sameLevel = Math.abs(playerY - this.y) <= KING_PIG.ATTACK_VERTICAL
    const inRange = canSee && sameLevel && distance <= this.attack.range

    if (inRange) {
      this.setVelocityX(0)
      this.setFlipX(playerX > this.x)
      if (onGround && this.attack.ready(this.scene.time.now)) {
        this.enterAttack(playerX, playerY)
      } else {
        this.stateMachine.setState('idle')
      }
      return
    }

    if (canSee) {
      const tier = this.currentTier()
      const velocityX = Math.sign(playerX - this.x) * KING_PIG.CHASE_SPEED * tier.speedScale
      this.setVelocityX(velocityX)
      this.handleMoveAnimation(velocityX)
      return
    }

    const velocityX = this.patrol.velocityFor(this.x, body.blocked.left, body.blocked.right)
    this.setVelocityX(velocityX)
    this.handleMoveAnimation(velocityX)
  }

  private currentTier(): PigTier {
    const tierIndex = PIG_TIERS.findIndex((tier) => (tier.name ? `-${tier.name}` : '') === this.colorSuffix)
    return PIG_TIERS[tierIndex >= 0 ? tierIndex : 0]
  }

  private canSeePlayer(playerX: number, playerY: number): boolean {
    const dx = playerX - this.x
    const facingRight = this.flipX
    const ahead = facingRight ? dx > 0 : dx < 0
    return (
      ahead &&
      Math.abs(dx) <= KING_PIG.DETECTION_RANGE &&
      Math.abs(playerY - this.y) <= KING_PIG.VISION_HEIGHT
    )
  }

  private handleMoveAnimation(velocityX: number): void {
    if (velocityX === 0) {
      this.stateMachine.setState('idle')
      return
    }
    this.setFlipX(velocityX > 0)
    this.stateMachine.setState('run')
  }

  private enterAttack(playerX: number, playerY: number): void {
    this.isAttacking = true
    this.attack.trigger(this.scene.time.now)
    this.setVelocityX(0)
    this.stateMachine.setState('attack')
    const anim = this.tierAnim(this.attack.anim)
    this.play(anim, true)
    this.scheduleFire(playerX, playerY)
    this.once(completeEvent(anim), () => {
      this.isAttacking = false
      this.off(Phaser.Animations.Events.ANIMATION_UPDATE)
      this.stateMachine.setState('idle')
    })
  }

  private scheduleFire(playerX: number, playerY: number): void {
    const fire = (): void => {
      this.attack.fire(this.scene, this.x, this.y, playerX, playerY, { damage: this.contactDamage })
    }

    if (this.attack.releaseFrame <= 1) {
      fire()
      return
    }

    const onFrame = (_anim: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame): void => {
      if (frame.index >= this.attack.releaseFrame) {
        this.off(Phaser.Animations.Events.ANIMATION_UPDATE, onFrame)
        fire()
      }
    }
    this.on(Phaser.Animations.Events.ANIMATION_UPDATE, onFrame)
  }

  private cancelAttack(): void {
    this.isAttacking = false
    this.off(Phaser.Animations.Events.ANIMATION_UPDATE)
  }

  private checkSummons(): void {
    if (this.summons.length === 0) {
      return
    }
    const ratio = this.health / this.maxHealth
    this.summons.forEach((summon, index) => {
      if (this.firedSummons.has(index) || ratio > summon.atHealthBelow) {
        return
      }
      this.firedSummons.add(index)
      this.scene.events.emit(ENTITY_EVENT.KING_PIG_SUMMON, { minions: summon.minions })
    })
  }

  private emitHealth(): void {
    this.scene.events.emit(ENTITY_EVENT.KING_PIG_HEALTH, { current: this.health, max: this.maxHealth })
  }

  private die(): void {
    this.isDead = true
    this.clearTint()
    const body = this.body as Phaser.Physics.Arcade.Body
    body.stop()
    body.enable = false
    this.stateMachine.setState('dead')
    this.play(this.tierAnim(ANIM_KEY.KING_PIG_DEAD), true)
    this.emitHealth()
    this.scene.events.emit(ENTITY_EVENT.KING_PIG_DEFEATED)
    this.scene.time.delayedCall(KING_PIG.DEAD_LINGER_MS, () => this.destroy())
  }

  private tierAnim(base: string): string {
    return base + this.colorSuffix
  }
}
