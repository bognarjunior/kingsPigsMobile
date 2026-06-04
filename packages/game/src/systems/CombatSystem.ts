import Phaser from 'phaser'

import { BOMB, COMBAT, PIG, PLAYER } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import type { BreakableBox } from '@/entities/BreakableBox'
import type { Pig } from '@/entities/Pig'
import type { Player } from '@/entities/Player'
import type { AttackEvent, BombExplodeEvent } from '@/types/enemy'

export class CombatSystem {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly enemies: readonly Pig[],
    private readonly boxes: readonly BreakableBox[],
  ) {
    scene.events.on(ENTITY_EVENT.PLAYER_ATTACK, this.onPlayerAttack, this)
    scene.events.on(ENTITY_EVENT.ENEMY_ATTACK, this.onEnemyAttack, this)
    scene.events.on(ENTITY_EVENT.BOMB_EXPLODE, this.onBombExplode, this)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this)
  }

  private onBombExplode(event: BombExplodeEvent): void {
    const distance = Phaser.Math.Distance.Between(event.x, event.y, this.player.x, this.player.y)
    if (distance <= BOMB.RADIUS) {
      this.player.takeDamage(BOMB.DAMAGE)
    }
  }

  private onPlayerAttack(event: AttackEvent): void {
    const knockbackDir = event.facingLeft ? -1 : 1
    this.enemies.forEach((enemy) => {
      if (enemy.isAlive && this.inReach(event, enemy.x, enemy.y, PLAYER.ATTACK_RANGE)) {
        enemy.takeDamage(PLAYER.ATTACK_DAMAGE, knockbackDir)
      }
    })
    this.boxes.forEach((box) => {
      if (box.isIntact && this.inReach(event, box.x, box.y, PLAYER.ATTACK_RANGE)) {
        box.smash()
      }
    })
  }

  private onEnemyAttack(event: AttackEvent): void {
    if (this.inReach(event, this.player.x, this.player.y, PIG.ATTACK_RANGE)) {
      this.player.takeDamage(event.damage ?? PIG.HEART_DAMAGE)
    }
  }

  private inReach(event: AttackEvent, targetX: number, targetY: number, range: number): boolean {
    const dx = targetX - event.x
    const onFacingSide = event.facingLeft ? dx <= 0 : dx >= 0
    return onFacingSide && Math.abs(dx) <= range && Math.abs(targetY - event.y) <= COMBAT.VERTICAL_REACH
  }

  private destroy(): void {
    this.scene.events.off(ENTITY_EVENT.PLAYER_ATTACK, this.onPlayerAttack, this)
    this.scene.events.off(ENTITY_EVENT.ENEMY_ATTACK, this.onEnemyAttack, this)
    this.scene.events.off(ENTITY_EVENT.BOMB_EXPLODE, this.onBombExplode, this)
  }
}
