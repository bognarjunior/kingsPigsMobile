import Phaser from 'phaser'

import { PIG } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { ANIM_KEY } from '@/constants/keys'
import type { AttackBehavior } from '@/types/enemy'

export class MeleeAttackBehavior implements AttackBehavior {
  readonly anim = ANIM_KEY.PIG_ATTACK
  readonly releaseFrame = PIG.ATTACK_RELEASE_FRAME
  private lastAttackAt = Number.NEGATIVE_INFINITY

  constructor(
    readonly range: number,
    private readonly cooldownMs: number,
  ) {}

  ready(now: number): boolean {
    return now - this.lastAttackAt >= this.cooldownMs
  }

  trigger(now: number): void {
    this.lastAttackAt = now
  }

  fire(scene: Phaser.Scene, x: number, y: number, targetX: number): void {
    scene.events.emit(ENTITY_EVENT.ENEMY_ATTACK, { x, y, facingLeft: targetX < x })
  }
}
