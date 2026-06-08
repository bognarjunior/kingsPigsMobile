import Phaser from 'phaser'

import { FONT_FAMILY, MENU_BUTTON } from '@/constants/GameConstants'
import { SOUND_KEY, TEXTURE_KEY } from '@/constants/keys'
import { playSfx } from '@/services/audio'
import { runProfile } from '@/services/runProfile'
import { createMenuButton } from '@/ui/menuButton'

const DEPTH = 200
const DIM_ALPHA = 0.82
const CARD_W = 440
const CARD_FILL = 0x2c2b46
const CARD_RADIUS = 12
const TITLE_DY = 22
const BALANCE_DY = 48
const FIRST_ROW_DY = 86
const ROW_GAP = 34
const CLOSE_EXTRA = 32
const BTN_H = 22
const BUY_W = 66
const CLOSE_W = 120
const CLOSE_H = 24
const PRICE_COLOR = '#9fe0ff'
const LABEL_COLOR = '#ffffff'
const DISABLED_ALPHA = 0.4

// one buyable upgrade: a label, its diamond price, whether it can still be bought,
// and what to do on purchase (the scene spends + applies the effect).
export interface ShopItem {
  readonly label: string
  readonly price: number
  available(): boolean
  purchase(): void
}

// Shop veil styled like the menu/settings: a rounded card with a title, a diamond
// balance, one row per item (label · price · BUY button, greyed when unaffordable or
// maxed), and a close button. Re-reads the profile after each buy so the balance and
// row states stay current.
export class ShopOverlay {
  private readonly parts: Phaser.GameObjects.GameObject[] = []
  private readonly rows: { item: ShopItem; parts: Phaser.GameObjects.GameObject[] }[] = []
  private balance!: Phaser.GameObjects.Text

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly items: readonly ShopItem[],
    private readonly onClose: () => void,
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
    const closeDY = FIRST_ROW_DY + (this.items.length - 1) * ROW_GAP + CLOSE_EXTRA
    const cardH = closeDY + 30
    const top = cy - cardH / 2
    const left = cx - CARD_W / 2

    this.track(
      this.scene.add.rectangle(cx, cy, width, height, 0x000000, DIM_ALPHA).setScrollFactor(0).setDepth(DEPTH).setInteractive(),
    )

    const card = this.scene.add.graphics().setScrollFactor(0).setDepth(DEPTH)
    card.fillStyle(CARD_FILL, 1).fillRoundedRect(left, top, CARD_W, cardH, CARD_RADIUS)
    card.lineStyle(2, MENU_BUTTON.HIGHLIGHT, 1).strokeRoundedRect(left, top, CARD_W, cardH, CARD_RADIUS)
    this.track(card)

    this.text(cx, top + TITLE_DY, 'SHOP', 14, LABEL_COLOR).setOrigin(0.5, 0)
    this.track(this.scene.add.image(cx - 16, top + BALANCE_DY, TEXTURE_KEY.DIAMOND).setScrollFactor(0).setDepth(DEPTH + 1))
    this.balance = this.text(cx - 2, top + BALANCE_DY, '', 10, PRICE_COLOR).setOrigin(0, 0.5)

    this.items.forEach((item, index) => this.buildRow(cx, left, top + FIRST_ROW_DY + index * ROW_GAP, item))

    this.button(cx, top + closeDY, 'CLOSE', this.onClose, CLOSE_W, CLOSE_H, MENU_BUTTON.FONT_SIZE)

    this.refresh()
  }

  private buildRow(cx: number, left: number, y: number, item: ShopItem): void {
    const label = this.text(left + 28, y, item.label, 8, LABEL_COLOR).setOrigin(0, 0.5)
    const diamond = this.scene.add.image(cx + 40, y, TEXTURE_KEY.DIAMOND).setScrollFactor(0).setDepth(DEPTH + 1)
    this.track(diamond)
    const price = this.text(cx + 54, y, String(item.price), 8, PRICE_COLOR).setOrigin(0, 0.5)
    const buy = this.buttonParts(cx + 158, y, 'BUY', () => this.tryBuy(item), BUY_W, BTN_H, MENU_BUTTON.FONT_SIZE)
    this.rows.push({ item, parts: [label, diamond, price, ...buy] })
  }

  private tryBuy(item: ShopItem): void {
    if (!item.available() || runProfile.diamonds < item.price) {
      return
    }
    item.purchase()
    playSfx(SOUND_KEY.BUY)
    this.refresh()
  }

  // grey out what can't be bought right now; keep the balance in sync
  private refresh(): void {
    this.balance.setText(String(runProfile.diamonds))
    this.rows.forEach(({ item, parts }) => {
      const enabled = item.available() && runProfile.diamonds >= item.price
      const alpha = enabled ? 1 : DISABLED_ALPHA
      parts.forEach((part) => {
        ;(part as unknown as Phaser.GameObjects.Components.Alpha).setAlpha(alpha)
      })
    })
  }

  private button(x: number, y: number, label: string, onTap: () => void, width: number, height: number, fontSize: number): void {
    this.buttonParts(x, y, label, onTap, width, height, fontSize)
  }

  private buttonParts(
    x: number,
    y: number,
    label: string,
    onTap: () => void,
    width: number,
    height: number,
    fontSize: number,
  ): Phaser.GameObjects.GameObject[] {
    const created = createMenuButton(this.scene, { x, y, label, onTap, depth: DEPTH + 1, width, height, fontSize })
    created.forEach((part) => this.track(part))
    return created
  }

  private text(x: number, y: number, value: string, size: number, color: string): Phaser.GameObjects.Text {
    const text = this.scene.add
      .text(x, y, value, { fontFamily: FONT_FAMILY, fontSize: `${size}px`, color })
      .setScrollFactor(0)
      .setDepth(DEPTH + 1)
    this.track(text)
    return text
  }

  private track(part: Phaser.GameObjects.GameObject): void {
    this.parts.push(part)
  }
}
