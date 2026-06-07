import Phaser from 'phaser'

import { BOSS_HUD, FONT_FAMILY } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import type { KingPigHealthEvent } from '@/types/kingPig'

export class BossHealthBar {
  private readonly frame: Phaser.GameObjects.Graphics
  private readonly fill: Phaser.GameObjects.Graphics
  private readonly label: Phaser.GameObjects.Text
  private maxHealth: number

  constructor(private readonly scene: Phaser.Scene, maxHealth: number) {
    this.maxHealth = maxHealth
    this.frame = scene.add.graphics().setScrollFactor(0).setDepth(BOSS_HUD.DEPTH)
    this.fill = scene.add.graphics().setScrollFactor(0).setDepth(BOSS_HUD.DEPTH + 1)
    this.label = scene.add
      .text(BOSS_HUD.BAR_X + BOSS_HUD.BAR_WIDTH / 2, BOSS_HUD.BAR_Y - 10, 'KING PIG', {
        fontFamily: FONT_FAMILY,
        fontSize: '8px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(BOSS_HUD.DEPTH + 2)

    scene.events.on(ENTITY_EVENT.KING_PIG_HEALTH, this.onHealth, this)
    scene.events.once(ENTITY_EVENT.KING_PIG_DEFEATED, this.hide, this)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this)

    this.drawFrame()
    this.refresh(maxHealth)
  }

  private onHealth(event: KingPigHealthEvent): void {
    this.maxHealth = event.max
    this.refresh(event.current)
  }

  private refresh(current: number): void {
    this.fill.clear()
    const ratio = Phaser.Math.Clamp(current / this.maxHealth, 0, 1)
    const width = Math.max(0, BOSS_HUD.BAR_WIDTH * ratio)
    this.fill.fillStyle(BOSS_HUD.FILL_COLOR, 1)
    this.fill.fillRect(BOSS_HUD.BAR_X, BOSS_HUD.BAR_Y, width, BOSS_HUD.BAR_HEIGHT)
  }

  private drawFrame(): void {
    this.frame.clear()
    this.frame.lineStyle(1, BOSS_HUD.BORDER_COLOR, 1)
    this.frame.fillStyle(BOSS_HUD.BACK_COLOR, 1)
    this.frame.fillRect(BOSS_HUD.BAR_X, BOSS_HUD.BAR_Y, BOSS_HUD.BAR_WIDTH, BOSS_HUD.BAR_HEIGHT)
    this.frame.strokeRect(BOSS_HUD.BAR_X, BOSS_HUD.BAR_Y, BOSS_HUD.BAR_WIDTH, BOSS_HUD.BAR_HEIGHT)
  }

  private hide(): void {
    this.frame.setVisible(false)
    this.fill.setVisible(false)
    this.label.setVisible(false)
  }

  private destroy(): void {
    this.scene.events.off(ENTITY_EVENT.KING_PIG_HEALTH, this.onHealth, this)
    this.frame.destroy()
    this.fill.destroy()
    this.label.destroy()
  }
}
