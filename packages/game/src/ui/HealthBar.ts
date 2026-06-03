import Phaser from 'phaser'

import { HUD } from '@/constants/GameConstants'
import { ENTITY_EVENT } from '@/constants/events'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'

// On-screen King health: the Live Bar assembled from sliced pieces (left end +
// one repeatable socket per heart + right end), so it grows with the King's
// capacity. Fixed to the camera; reacts to player:health (fill) and
// player:max-hearts (rebuild). Entities never reference it directly.
export class HealthBar {
  private pieces: Phaser.GameObjects.Image[] = []
  private hearts: Phaser.GameObjects.Sprite[] = []
  private currentHearts: number

  constructor(private readonly scene: Phaser.Scene, capacity: number, initialHearts: number) {
    this.currentHearts = initialHearts
    this.build(capacity)

    scene.events.on(ENTITY_EVENT.PLAYER_HEALTH, this.onHealth, this)
    scene.events.on(ENTITY_EVENT.PLAYER_MAX_HEARTS, this.build, this)
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this)
  }

  private build(capacity: number): void {
    this.pieces.forEach((piece) => piece.destroy())
    this.hearts.forEach((heart) => heart.destroy())

    const slots = Math.max(2, capacity)
    this.pieces = this.buildRibbon(slots)
    this.hearts = this.heartPositions(slots).map((x) =>
      this.scene.add
        .sprite(HUD.BAR_X + x, HUD.BAR_Y + HUD.HEART_Y, TEXTURE_KEY.HEART)
        .setScrollFactor(0)
        .setDepth(HUD.DEPTH + 1)
        .play(ANIM_KEY.HEART_IDLE),
    )
    this.refresh()
  }

  private buildRibbon(slots: number): Phaser.GameObjects.Image[] {
    const images: Phaser.GameObjects.Image[] = []
    const piece = (x: number, key: string): number => {
      const image = this.scene.add
        .image(x, HUD.BAR_Y, key)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(HUD.DEPTH)
      images.push(image)
      return x + image.width
    }

    let x = piece(HUD.BAR_X, TEXTURE_KEY.BAR_LEFT)
    for (let i = 0; i < slots - 2; i++) {
      x = piece(x, TEXTURE_KEY.BAR_MID)
    }
    piece(x, TEXTURE_KEY.BAR_RIGHT)
    return images
  }

  private heartPositions(slots: number): number[] {
    const positions: number[] = [HUD.LEFT_SOCKET_X]
    for (let i = 0; i <= slots - 2; i++) {
      positions.push(HUD.MID_FIRST_SOCKET_X + i * HUD.MID_WIDTH)
    }
    return positions
  }

  private onHealth(hearts: number): void {
    this.currentHearts = hearts
    this.refresh()
  }

  private refresh(): void {
    this.hearts.forEach((heart, index) => heart.setVisible(index < this.currentHearts))
  }

  private destroy(): void {
    this.scene.events.off(ENTITY_EVENT.PLAYER_HEALTH, this.onHealth, this)
    this.scene.events.off(ENTITY_EVENT.PLAYER_MAX_HEARTS, this.build, this)
  }
}
