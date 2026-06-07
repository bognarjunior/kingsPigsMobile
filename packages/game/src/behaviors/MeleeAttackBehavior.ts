import Phaser from 'phaser'

import { PIG } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { ANIM_KEY } from '@/constants/keys'
import type { AttackBehavior, FireContext } from '@/types/enemy'

export class MeleeAttackBehavior implements AttackBehavior {
  readonly anim: string
  readonly releaseFrame: number
  private lastAttackAt = Number.NEGATIVE_INFINITY

  constructor(
    readonly range: number,
    private readonly cooldownMs: number,
    attackAnim: string = ANIM_KEY.PIG_ATTACK,
    releaseFrame: number = PIG.ATTACK_RELEASE_FRAME,
  ) {
    this.anim = attackAnim
    this.releaseFrame = releaseFrame
  }

  ready(now: number): boolean {
    return now - this.lastAttackAt >= this.cooldownMs
  }

  trigger(now: number): void {
    this.lastAttackAt = now
  }

  fire(scene: Phaser.Scene, x: number, y: number, targetX: number, _targetY: number, ctx?: FireContext): void {
    scene.events.emit(ENTITY_EVENT.ENEMY_ATTACK, {
      x,
      y,
      facingLeft: targetX < x,
      damage: ctx?.damage ?? PIG.HEART_DAMAGE,
    })
  }
}
