import Phaser from 'phaser'

import { FONT_FAMILY, MENU_BUTTON } from '@/constants/GameConstants'
import { createMenuButton } from '@/ui/menuButton'

const DEPTH = 200
const DIM_ALPHA = 0.85

export interface PauseActions {
  readonly onResume: () => void
  readonly onShop: () => void
  readonly onSettings: () => void
}

// The in-game pause veil: a single hub with RESUME / SHOP / SETTINGS, so the play
// screen needs only one button instead of loose shop and audio buttons.
export class PauseOverlay {
  private readonly parts: Phaser.GameObjects.GameObject[] = []

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly actions: PauseActions,
  ) {
    this.build()
  }

  destroy(): void {
    this.parts.forEach((part) => part.destroy())
  }

  private build(): void {
    const { width, height } = this.scene.cameras.main
    const cx = width / 2
    const cy = height / 2

    this.track(
      this.scene.add
        .rectangle(cx, cy, width, height, 0x000000, DIM_ALPHA)
        .setScrollFactor(0)
        .setDepth(DEPTH)
        .setInteractive(),
    )

    this.track(
      this.scene.add
        .text(cx, cy - MENU_BUTTON.GAP * 2, 'PAUSED', { fontFamily: FONT_FAMILY, fontSize: '16px', color: '#ffffff' })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(DEPTH + 1),
    )

    this.button(cx, cy - MENU_BUTTON.GAP, 'RESUME', this.actions.onResume)
    this.button(cx, cy, 'SHOP', this.actions.onShop)
    this.button(cx, cy + MENU_BUTTON.GAP, 'SETTINGS', this.actions.onSettings)
  }

  private button(x: number, y: number, label: string, onTap: () => void): void {
    createMenuButton(this.scene, { x, y, label, onTap, depth: DEPTH + 1 }).forEach((part) => this.track(part))
  }

  private track(part: Phaser.GameObjects.GameObject): void {
    this.parts.push(part)
  }
}
