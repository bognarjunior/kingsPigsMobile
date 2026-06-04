import Phaser from 'phaser'

import { BOX } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { ANIM_KEY } from '@/constants/keys'
import type { AttackBehavior, FireContext } from '@/types/enemy'
import type { Loot } from '@/types/level'

const EMPTY_LOOT: Loot = { kind: 'empty' }

// The box pig plays its throw animation and asks the scene to lob the crate it
// carries (with its loot) toward the player; the scene owns the projectile.
export class ThrowBoxBehavior implements AttackBehavior {
  readonly anim = ANIM_KEY.PIG_BOX_THROW
  readonly releaseFrame = BOX.RELEASE_FRAME
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

  fire(scene: Phaser.Scene, x: number, y: number, targetX: number, _targetY: number, ctx?: FireContext): void {
    scene.events.emit(ENTITY_EVENT.ENEMY_THROW_BOX, { x, y, targetX, loot: ctx?.loot ?? EMPTY_LOOT })
  }
}
