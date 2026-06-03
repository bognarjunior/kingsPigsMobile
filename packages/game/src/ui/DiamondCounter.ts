import Phaser from 'phaser'

import { HUD } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { TEXTURE_KEY } from '@/constants/keys'

// On-screen diamond count: a small diamond icon plus the number rendered from
// the Numbers sprite font. Fixed to the camera; reacts to player:diamonds.
export class DiamondCounter {
  private digits: Phaser.GameObjects.Image[] = []

  constructor(private readonly scene: Phaser.Scene, initial: number) {
    scene.add
      .image(HUD.DIAMOND_ICON_X, HUD.DIAMOND_ICON_Y, TEXTURE_KEY.DIAMOND, 0)
      .setScrollFactor(0)
      .setDepth(HUD.DEPTH)

    this.render(initial)
    scene.events.on(ENTITY_EVENT.PLAYER_DIAMONDS, this.render, this)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this)
  }

  private render(count: number): void {
    this.digits.forEach((digit) => digit.destroy())
    // the Numbers sprite is ordered 1,2,…,9,0 — so digit d is at frame (d+9)%10
    this.digits = String(count)
      .split('')
      .map((char, index) =>
        this.scene.add
          .image(HUD.DIGIT_X + index * HUD.DIGIT_SPACING, HUD.DIGIT_Y, TEXTURE_KEY.NUMBERS, (Number(char) + 9) % 10)
          .setOrigin(0, 0)
          .setScrollFactor(0)
          .setDepth(HUD.DEPTH + 1),
      )
  }

  private destroy(): void {
    this.scene.events.off(ENTITY_EVENT.PLAYER_DIAMONDS, this.render, this)
  }
}
