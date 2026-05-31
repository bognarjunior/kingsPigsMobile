import Phaser from 'phaser'

import { registerAnimations } from '@/animations/registerAnimations'
import { KING_SPRITE, PIG_SPRITE } from '@/constants/GameConstants'
import { SCENE_KEY, TEXTURE_KEY, TILEMAP_KEY } from '@/constants/keys'

import kingIdleUrl from '@/assets/king/idle.png'
import kingRunUrl from '@/assets/king/run.png'
import kingJumpUrl from '@/assets/king/jump.png'
import kingFallUrl from '@/assets/king/fall.png'
import kingAttackUrl from '@/assets/king/attack.png'
import kingHitUrl from '@/assets/king/hit.png'
import kingDeadUrl from '@/assets/king/dead.png'
import pigIdleUrl from '@/assets/pig/idle.png'
import pigRunUrl from '@/assets/pig/run.png'
import terrainUrl from '@/assets/tiles/terrain.png'
import level1 from '@/assets/levels/level1.json'

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEY.BOOT)
  }

  preload(): void {
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'Loading...', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    const king = { frameWidth: KING_SPRITE.FRAME_WIDTH, frameHeight: KING_SPRITE.FRAME_HEIGHT }
    this.load.spritesheet(TEXTURE_KEY.KING_IDLE, kingIdleUrl, king)
    this.load.spritesheet(TEXTURE_KEY.KING_RUN, kingRunUrl, king)
    this.load.spritesheet(TEXTURE_KEY.KING_JUMP, kingJumpUrl, king)
    this.load.spritesheet(TEXTURE_KEY.KING_FALL, kingFallUrl, king)
    this.load.spritesheet(TEXTURE_KEY.KING_ATTACK, kingAttackUrl, king)
    this.load.spritesheet(TEXTURE_KEY.KING_HIT, kingHitUrl, king)
    this.load.spritesheet(TEXTURE_KEY.KING_DEAD, kingDeadUrl, king)

    const pig = { frameWidth: PIG_SPRITE.FRAME_WIDTH, frameHeight: PIG_SPRITE.FRAME_HEIGHT }
    this.load.spritesheet(TEXTURE_KEY.PIG_IDLE, pigIdleUrl, pig)
    this.load.spritesheet(TEXTURE_KEY.PIG_RUN, pigRunUrl, pig)

    this.load.image(TEXTURE_KEY.TERRAIN, terrainUrl)
    this.load.tilemapTiledJSON(TILEMAP_KEY.LEVEL1, level1)
  }

  create(): void {
    registerAnimations(this)
    this.scene.start(SCENE_KEY.MENU)
  }
}
