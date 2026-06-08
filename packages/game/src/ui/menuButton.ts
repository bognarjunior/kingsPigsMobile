import Phaser from 'phaser'

import { FONT_FAMILY, MENU_BUTTON } from '@/constants/GameConstants'

export interface MenuButtonConfig {
  readonly x: number
  readonly y: number
  readonly label: string
  readonly onTap: () => void
  readonly depth: number
}

// A labeled box button (pixel font) shared by the title menu and the pause overlay.
// Returns the box + label so an overlay can track and destroy them; a scene that
// owns its buttons for its whole lifetime can ignore the return value.
export function createMenuButton(scene: Phaser.Scene, config: MenuButtonConfig): Phaser.GameObjects.GameObject[] {
  const box = scene.add
    .rectangle(config.x, config.y, MENU_BUTTON.WIDTH, MENU_BUTTON.HEIGHT, 0x000000, 0.5)
    .setScrollFactor(0)
    .setDepth(config.depth)
    .setStrokeStyle(1, 0xffffff, 0.7)
    .setInteractive({ useHandCursor: true })
  box.on(Phaser.Input.Events.POINTER_DOWN, config.onTap)

  const label = scene.add
    .text(config.x, config.y, config.label, {
      fontFamily: FONT_FAMILY,
      fontSize: `${MENU_BUTTON.FONT_SIZE}px`,
      color: '#ffffff',
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(config.depth + 1)

  return [box, label]
}
