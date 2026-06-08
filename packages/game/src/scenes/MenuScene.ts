import Phaser from 'phaser'

import { FONT_FAMILY, MENU, MENU_BUTTON, PLAYER, SHOP } from '@/constants/GameConstants'
import { SCENE_KEY } from '@/constants/keys'
import { runProfile } from '@/services/runProfile'
import { createMenuButton } from '@/ui/menuButton'
import { SettingsOverlay } from '@/ui/SettingsOverlay'
import { ShopOverlay, type ShopItem } from '@/ui/ShopOverlay'

export class MenuScene extends Phaser.Scene {
  private shopOverlay?: ShopOverlay
  private settingsOverlay?: SettingsOverlay

  constructor() {
    super(SCENE_KEY.MENU)
  }

  create(): void {
    const cx = this.cameras.main.width / 2

    this.add
      .text(cx, MENU.TITLE_Y, 'KINGS AND PIGS', { fontFamily: FONT_FAMILY, fontSize: '24px', color: '#ffffff' })
      .setOrigin(0.5)

    createMenuButton(this, { x: cx, y: MENU.FIRST_BUTTON_Y, label: 'PLAY', onTap: () => this.startGame(), depth: 0 })
    createMenuButton(this, {
      x: cx,
      y: MENU.FIRST_BUTTON_Y + MENU_BUTTON.GAP,
      label: 'SHOP',
      onTap: () => this.openShop(),
      depth: 0,
    })
    createMenuButton(this, {
      x: cx,
      y: MENU.FIRST_BUTTON_Y + MENU_BUTTON.GAP * 2,
      label: 'SETTINGS',
      onTap: () => this.openSettings(),
      depth: 0,
    })
  }

  private startGame(): void {
    if (this.shopOverlay || this.settingsOverlay) {
      return
    }
    this.scene.start(SCENE_KEY.GAME)
  }

  // shop from the title screen spends banked diamonds on the permanent upgrades only
  // (the temporary in-run shield lives in the game's shop); the next run reads these
  // from the run profile. No live player here, so nothing is applied directly.
  private openShop(): void {
    if (this.shopOverlay || this.settingsOverlay) {
      return
    }
    const items: ShopItem[] = [
      {
        label: '+1 MAX HEART',
        price: SHOP.PRICE_MAX_HEART,
        available: () => PLAYER.MAX_HEARTS + runProfile.maxHeartBonusValue < PLAYER.MAX_HEARTS_CAP,
        purchase: () => this.buyPermanent(SHOP.PRICE_MAX_HEART, () => runProfile.raiseMaxHeartBonus()),
      },
      {
        label: '+DAMAGE',
        price: SHOP.PRICE_DAMAGE,
        available: () => true,
        purchase: () => this.buyPermanent(SHOP.PRICE_DAMAGE, () => runProfile.raiseDamageBonus(SHOP.DAMAGE_STEP)),
      },
      {
        label: '+1 LIFE',
        price: SHOP.PRICE_LIFE,
        available: () => true,
        purchase: () => this.buyPermanent(SHOP.PRICE_LIFE, () => runProfile.addLife()),
      },
    ]
    this.shopOverlay = new ShopOverlay(this, items, () => this.closeShop())
  }

  private buyPermanent(price: number, apply: () => void): void {
    if (runProfile.spend(price)) {
      apply()
    }
  }

  private closeShop(): void {
    this.shopOverlay?.destroy()
    this.shopOverlay = undefined
  }

  private openSettings(): void {
    if (this.shopOverlay || this.settingsOverlay) {
      return
    }
    this.settingsOverlay = new SettingsOverlay(this, () => this.closeSettings())
  }

  private closeSettings(): void {
    this.settingsOverlay?.destroy()
    this.settingsOverlay = undefined
  }
}
