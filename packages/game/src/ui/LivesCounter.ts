import Phaser from 'phaser'

import { HUD } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { TEXTURE_KEY } from '@/constants/keys'

// Remaining lives (continues): a King-head icon plus the count from the Numbers
// sprite font, anchored top-right. Re-renders on player:lives (a shop purchase).
export class LivesCounter {
  private digits: Phaser.GameObjects.Image[] = []

  constructor(
    private readonly scene: Phaser.Scene,
    initial: number,
  ) {
    scene.add
      .image(HUD.LIVES_ICON_X, HUD.LIVES_ICON_Y, TEXTURE_KEY.KING_HEAD)
      .setScrollFactor(0)
      .setDepth(HUD.DEPTH)

    this.render(initial)
    scene.events.on(ENTITY_EVENT.PLAYER_LIVES, this.render, this)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this)
  }

  private render(lives: number): void {
    this.digits.forEach((digit) => digit.destroy())
    // the Numbers sprite is ordered 1,2,…,9,0 — so digit d is at frame (d+9)%10
    this.digits = String(lives)
      .split('')
      .map((char, index) =>
        this.scene.add
          .image(HUD.LIVES_DIGIT_X + index * HUD.DIGIT_SPACING, HUD.LIVES_DIGIT_Y, TEXTURE_KEY.NUMBERS, (Number(char) + 9) % 10)
          .setOrigin(0, 0)
          .setScrollFactor(0)
          .setDepth(HUD.DEPTH + 1),
      )
  }

  private destroy(): void {
    this.scene.events.off(ENTITY_EVENT.PLAYER_LIVES, this.render, this)
  }
}
