import Phaser from 'phaser'

import { FONT_FAMILY } from '@/constants/GameConstants'
import { SOUND_KEY, TEXTURE_KEY } from '@/constants/keys'
import { playSfx } from '@/services/audio'
import { runProfile } from '@/services/runProfile'

const DEPTH = 200
const DIM_ALPHA = 0.85
const ROW_SPACING = 22
const ROW_WIDTH = 220

// one buyable upgrade: a label, its diamond price, whether it can still be bought,
// and what to do on purchase (the scene spends + applies the effect).
export interface ShopItem {
  readonly label: string
  readonly price: number
  available(): boolean
  purchase(): void
}

// Full-screen shop veil (pixel font): a diamond balance, a tappable row per item
// (greyed when unaffordable or maxed), and a close action. Re-reads the profile
// after each buy so the balance and row states stay current.
export class ShopOverlay {
  private readonly parts: Phaser.GameObjects.GameObject[] = []
  private readonly rows: { item: ShopItem; label: Phaser.GameObjects.Text; price: Phaser.GameObjects.Text }[] = []
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
    const top = height / 2 - this.items.length * ROW_SPACING * 0.5 - 28

    this.track(
      this.scene.add.rectangle(cx, height / 2, width, height, 0x000000, DIM_ALPHA).setScrollFactor(0).setDepth(DEPTH),
    )
    this.track(this.label(cx, top, 'SHOP', 16, '#ffffff').setOrigin(0.5, 0))

    this.scene.add
      .image(cx - 18, top + 22, TEXTURE_KEY.DIAMOND)
      .setScrollFactor(0)
      .setDepth(DEPTH + 1)
      .setOrigin(0.5)
    this.parts.push(this.scene.children.getChildren()[this.scene.children.length - 1])
    this.balance = this.label(cx - 6, top + 18, '', 10, '#9fe0ff').setOrigin(0, 0)
    this.track(this.balance)

    this.items.forEach((item, index) => {
      const y = top + 48 + index * ROW_SPACING
      const label = this.label(cx - ROW_WIDTH / 2, y, item.label, 8, '#ffffff').setOrigin(0, 0.5)
      const price = this.label(cx + ROW_WIDTH / 2, y, String(item.price), 8, '#9fe0ff').setOrigin(1, 0.5)
      this.track(label)
      this.track(price)
      const hit = this.scene.add
        .rectangle(cx, y, ROW_WIDTH, ROW_SPACING, 0xffffff, 0.001)
        .setScrollFactor(0)
        .setDepth(DEPTH + 1)
        .setInteractive({ useHandCursor: true })
      hit.on(Phaser.Input.Events.POINTER_DOWN, () => this.tryBuy(item))
      this.track(hit)
      this.rows.push({ item, label, price })
    })

    const close = this.label(cx, top + 56 + this.items.length * ROW_SPACING, 'CLOSE', 8, '#cfcfcf').setOrigin(0.5)
    close.setInteractive({ useHandCursor: true })
    close.on(Phaser.Input.Events.POINTER_DOWN, this.onClose)
    this.track(close)

    this.refresh()
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
    this.rows.forEach(({ item, label, price }) => {
      const enabled = item.available() && runProfile.diamonds >= item.price
      const alpha = enabled ? 1 : 0.4
      label.setAlpha(alpha)
      price.setAlpha(alpha)
    })
  }

  private label(x: number, y: number, text: string, size: number, color: string): Phaser.GameObjects.Text {
    return this.scene.add
      .text(x, y, text, { fontFamily: FONT_FAMILY, fontSize: `${size}px`, color })
      .setScrollFactor(0)
      .setDepth(DEPTH + 1)
  }

  private track(part: Phaser.GameObjects.GameObject): void {
    this.parts.push(part)
  }
}
