import Phaser from 'phaser'

import { FONT_FAMILY, MENU_BUTTON } from '@/constants/GameConstants'

export interface MenuButtonConfig {
  readonly x: number
  readonly y: number
  readonly label: string
  readonly onTap: () => void
  readonly depth: number
}

const INSET = 4 // how far the bevel highlight/shadow lines sit from the top/bottom edges

// A rounded, beveled pixel button shared by the title menu and the pause overlay:
// a rounded fill with a top highlight and bottom shadow (a raised look) under a
// shadowed label, with a transparent interactive box on top. Returns every object
// so an overlay can track and destroy them.
export function createMenuButton(scene: Phaser.Scene, config: MenuButtonConfig): Phaser.GameObjects.GameObject[] {
  const { x, y } = config
  const w = MENU_BUTTON.WIDTH
  const h = MENU_BUTTON.HEIGHT
  const r = MENU_BUTTON.RADIUS
  const left = x - w / 2
  const top = y - h / 2

  const face = scene.add.graphics().setScrollFactor(0).setDepth(config.depth)
  face.fillStyle(MENU_BUTTON.FILL, 1).fillRoundedRect(left, top, w, h, r)
  face.fillStyle(MENU_BUTTON.FILL_TOP, 1).fillRoundedRect(left + 2, top + 2, w - 4, h / 2 - 2, r - 1)
  face.lineStyle(2, MENU_BUTTON.HIGHLIGHT, 1).lineBetween(left + r, top + INSET, left + w - r, top + INSET)
  face.lineStyle(2, MENU_BUTTON.SHADOW, 1).lineBetween(left + r, top + h - INSET, left + w - r, top + h - INSET)
  face.lineStyle(2, MENU_BUTTON.BORDER, 1).strokeRoundedRect(left, top, w, h, r)

  const label = scene.add
    .text(x, y, config.label, { fontFamily: FONT_FAMILY, fontSize: `${MENU_BUTTON.FONT_SIZE}px`, color: '#ffffff' })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(config.depth + 1)
  label.setShadow(0, 2, '#1a1a2e', 0, false, true)

  const hit = scene.add
    .rectangle(x, y, w, h, 0x000000, 0)
    .setScrollFactor(0)
    .setDepth(config.depth + 1)
    .setInteractive({ useHandCursor: true })
  hit.on(Phaser.Input.Events.POINTER_DOWN, config.onTap)

  return [face, label, hit]
}
