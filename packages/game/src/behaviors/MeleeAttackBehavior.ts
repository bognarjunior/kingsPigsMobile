import type { AttackBehavior } from '@/types/enemy'

export class MeleeAttackBehavior implements AttackBehavior {
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
}
