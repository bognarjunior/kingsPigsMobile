import Phaser from 'phaser'

import { ENTITY_EVENT } from '@/constants/events'
import { ANIM_KEY } from '@/constants/keys'
import type { AttackBehavior } from '@/types/enemy'

// The bomb pig plays its throw animation and, at the strike moment, asks the
// scene to spawn a bomb arcing toward the player (the scene owns the physics).
export class ThrowBombBehavior implements AttackBehavior {
  readonly anim = ANIM_KEY.PIG_BOMB_THROW
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
    scene.events.emit(ENTITY_EVENT.ENEMY_THROW_BOMB, { x, y, targetX })
  }
}
