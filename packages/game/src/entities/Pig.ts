import Phaser from 'phaser'

import { PatrolBehavior } from '@/behaviors/PatrolBehavior'
import { StateMachine } from '@/behaviors/StateMachine'
import { BOMB, PIG } from '@/constants/GameConstants'
import { Enemy } from '@/entities/Enemy'
import type { AmmoKind, ArmedSet, AttackBehavior, EnemyState, PigAnims, PigBody, PigConfig } from '@/types/enemy'
import type { Loot } from '@/types/level'

const completeEvent = (animKey: string): string =>
  `${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${animKey}`

const HURT_TINT = 0xff6b6b
const STUN_TINT = 0xffe066

interface AmmoSlot {
  readonly armed: ArmedSet
  readonly attack: AttackBehavior
}

export class Pig extends Enemy {
  private readonly stateMachine = new StateMachine<EnemyState>()
  private readonly patrol: PatrolBehavior
  private readonly animKeys: PigAnims
  private readonly baseBody: PigBody
  private readonly seeksAmmo: boolean
  private readonly slots = new Map<AmmoKind, AmmoSlot>()
  private readonly ammoSources: Phaser.Physics.Arcade.Group[] = []
  private attack?: AttackBehavior
  private activeArmed?: ArmedSet
  private armed: boolean
  private carriedLoot: Loot = { kind: 'empty' }
  private health: number = PIG.MAX_HEALTH
  private isAttacking = false
  private isPicking = false
  private isHurt = false
  private isStunned = false
  private isDead = false
  private patrolResting = true
  private patrolPhaseUntil = 0

  constructor(scene: Phaser.Scene, x: number, y: number, patrolRange: number, config: PigConfig) {
    super(scene, x, y, config.textures.idle)

    this.animKeys = config.anims
    this.baseBody = config.body
    this.seeksAmmo = !!config.ammo && config.ammo.length > 0

    config.ammo?.forEach((option) => {
      this.slots.set(option.kind, { armed: option.armed, attack: option.createAttack() })
    })
    if (config.createAttack) {
      this.attack = config.createAttack()
    }
    this.armed = !this.seeksAmmo

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setDragX(PIG.KNOCKBACK_DRAG)
    this.applyBody(this.baseBody)

    this.patrol = new PatrolBehavior(x - patrolRange, x + patrolRange, PIG.PATROL_SPEED)

    this.stateMachine
      .addState('idle', { onEnter: () => this.play(this.idleAnim(), true) })
      .addState('run', { onEnter: () => this.play(this.runAnim(), true) })
      .addState('attack', {})
      .addState('hurt', {})
      .addState('dead', {})

    this.stateMachine.setState('idle')
  }

  get isAlive(): boolean {
    return !this.isDead
  }

  // a thrower references every loose-ammo group it can hunt (bombs, boxes, ...)
  addAmmoSource(group: Phaser.Physics.Arcade.Group): void {
    this.ammoSources.push(group)
  }

  get wantsAmmo(): boolean {
    return this.seeksAmmo && !this.armed && !this.isPicking && !this.isDead && !this.isHurt && !this.isStunned
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
    this.setFlipX(knockbackDir < 0)
    this.setTint(HURT_TINT)
    this.stateMachine.setState('hurt')
    this.play(this.animKeys.hit, true)
    this.once(completeEvent(this.animKeys.hit), () => {
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
    this.play(this.animKeys.hit, true)
    this.scene.time.delayedCall(PIG.STUN_MS, () => {
      this.isStunned = false
      this.clearTint()
      this.stateMachine.setState('idle')
    })
  }

  // called by the scene when an unarmed thrower reaches a loose bomb or crate;
  // the kind picks the look + throw, and a crate's loot rides along to break open
  pickUp(kind: AmmoKind, loot: Loot = { kind: 'empty' }): void {
    const slot = this.slots.get(kind)
    if (!this.wantsAmmo || !slot) {
      return
    }

    this.attack = slot.attack
    this.activeArmed = slot.armed
    this.carriedLoot = loot
    this.isPicking = true
    this.setVelocityX(0)
    this.applyBody(slot.armed.body)
    this.play(slot.armed.pickAnim, true)
    this.once(completeEvent(slot.armed.pickAnim), () => {
      this.isPicking = false
      this.armed = true
      this.forceIdle()
    })
  }

  update(playerX: number, playerY: number): void {
    if (this.isDead || this.isAttacking || this.isStunned || this.isPicking) {
      this.setVelocityX(0)
      return
    }
    if (this.isHurt) {
      return // let the knockback slide; body drag decelerates it
    }

    if (this.seeksAmmo && !this.armed) {
      this.seekAmmo()
      return
    }

    const attack = this.attack
    if (!attack) {
      this.patrolStep()
      return
    }

    const onGround = (this.body as Phaser.Physics.Arcade.Body).blocked.down
    const canSee = this.canSeePlayer(playerX, playerY)
    const distance = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY)

    const sameLevel = Math.abs(playerY - this.y) <= PIG.ATTACK_VERTICAL
    if (canSee && sameLevel && distance <= attack.range) {
      this.setVelocityX(0)
      this.setFlipX(playerX > this.x)
      if (onGround && attack.ready(this.scene.time.now)) {
        this.enterAttack(attack, playerX, playerY)
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

  // walk toward the closest loose ammo of any kind; the scene's overlap arms the pig
  private seekAmmo(): void {
    const targetX = this.nearestAmmoX()
    if (targetX === null) {
      this.patrolStep()
      return
    }

    const dx = targetX - this.x
    if (Math.abs(dx) <= BOMB.PICK_REACH) {
      this.setVelocityX(0)
      this.stateMachine.setState('idle')
      return
    }

    const velocityX = Math.sign(dx) * PIG.CHASE_SPEED
    this.setVelocityX(velocityX)
    this.handleMoveAnimation(velocityX)
  }

  private nearestAmmoX(): number | null {
    let bestX: number | null = null
    let bestDistance = Number.POSITIVE_INFINITY
    this.ammoSources.forEach((group) => {
      group.getChildren().forEach((child) => {
        const item = child as Phaser.GameObjects.Sprite
        if (!item.active) {
          return
        }
        const distance = Math.abs(item.x - this.x)
        if (distance < bestDistance) {
          bestDistance = distance
          bestX = item.x
        }
      })
    })
    return bestX
  }

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

  // front-facing vision cone: only sees the player ahead, within range and level
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

  private enterAttack(attack: AttackBehavior, playerX: number, playerY: number): void {
    this.isAttacking = true
    attack.trigger(this.scene.time.now)
    this.setVelocityX(0)
    this.stateMachine.setState('attack')
    this.play(attack.anim, true)
    this.scheduleFire(attack, playerX, playerY)
    this.once(completeEvent(attack.anim), () => {
      this.isAttacking = false
      this.off(Phaser.Animations.Events.ANIMATION_UPDATE)
      if (this.seeksAmmo) {
        this.applyBody(this.baseBody)
      }
      this.forceIdle()
    })
  }

  // release the strike/projectile on the animation frame where it leaves the hand,
  // so the held bomb/crate disappears in sync with the thing appearing in the air
  private scheduleFire(attack: AttackBehavior, playerX: number, playerY: number): void {
    const fire = (): void => {
      attack.fire(this.scene, this.x, this.y, playerX, playerY, this.carriedLoot)
      if (this.seeksAmmo) {
        this.armed = false
      }
    }

    if (attack.releaseFrame <= 1) {
      fire()
      return
    }

    const onFrame = (_anim: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame): void => {
      if (frame.index >= attack.releaseFrame) {
        this.off(Phaser.Animations.Events.ANIMATION_UPDATE, onFrame)
        fire()
      }
    }
    this.on(Phaser.Animations.Events.ANIMATION_UPDATE, onFrame)
  }

  private cancelAttack(): void {
    this.isAttacking = false
    if (this.attack) {
      this.off(completeEvent(this.attack.anim))
    }
    this.off(Phaser.Animations.Events.ANIMATION_UPDATE)
    if (this.seeksAmmo && this.armed) {
      this.armed = false
      this.applyBody(this.baseBody)
    }
  }

  private die(): void {
    this.isDead = true
    this.clearTint()
    const body = this.body as Phaser.Physics.Arcade.Body
    body.stop()
    body.enable = false
    this.stateMachine.setState('dead')
    this.play(this.animKeys.dead, true)
    this.scene.time.delayedCall(PIG.DEAD_LINGER_MS, () => this.destroy())
  }

  private applyBody(spec: PigBody): void {
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(spec.width, spec.height, false)
    body.setOffset(spec.offsetX, spec.offsetY)
  }

  private idleAnim(): string {
    return this.armed && this.activeArmed ? this.activeArmed.idleAnim : this.animKeys.idle
  }

  private runAnim(): string {
    return this.armed && this.activeArmed ? this.activeArmed.runAnim : this.animKeys.run
  }

  // re-enter idle and play its animation even if already idling (armed look changed)
  private forceIdle(): void {
    this.stateMachine.setState('idle')
    this.play(this.idleAnim(), true)
  }
}
