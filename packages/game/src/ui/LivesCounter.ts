import Phaser from 'phaser'

import { HUD } from '@/constants/GameConstants'
import { TEXTURE_KEY } from '@/constants/keys'

// Remaining lives (continues): a King-head icon plus the count from the Numbers
// sprite font, anchored top-right. Lives only change on death (which restarts the
// scene), so this just renders the value it is built with.
export class LivesCounter {
  constructor(scene: Phaser.Scene, lives: number) {
    scene.add
      .image(HUD.LIVES_ICON_X, HUD.LIVES_ICON_Y, TEXTURE_KEY.KING_HEAD)
      .setScrollFactor(0)
      .setDepth(HUD.DEPTH)

    // the Numbers sprite is ordered 1,2,…,9,0 — so digit d is at frame (d+9)%10
    String(lives)
      .split('')
      .forEach((char, index) => {
        scene.add
          .image(HUD.LIVES_DIGIT_X + index * HUD.DIGIT_SPACING, HUD.LIVES_DIGIT_Y, TEXTURE_KEY.NUMBERS, (Number(char) + 9) % 10)
          .setOrigin(0, 0)
          .setScrollFactor(0)
          .setDepth(HUD.DEPTH + 1)
      })
  }
}
