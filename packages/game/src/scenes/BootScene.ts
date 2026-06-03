import Phaser from 'phaser'

import { registerAnimations } from '@/animations/registerAnimations'
import {
  BOMB_SPRITE,
  DOOR_SPRITE,
  HEART_SPRITE,
  KING_SPRITE,
  NUMBER_SPRITE,
  PIG_BOMB_SPRITE,
  PIG_SPRITE,
} from '@/constants/GameConstants'
import { SCENE_KEY, TEXTURE_KEY, TILEMAP_KEY } from '@/constants/keys'

import kingIdleUrl from '@/assets/king/idle.png'
import kingRunUrl from '@/assets/king/run.png'
import kingJumpUrl from '@/assets/king/jump.png'
import kingFallUrl from '@/assets/king/fall.png'
import kingAttackUrl from '@/assets/king/attack.png'
import kingHitUrl from '@/assets/king/hit.png'
import kingDeadUrl from '@/assets/king/dead.png'
import kingDoorInUrl from '@/assets/king/door-in.png'
import kingDoorOutUrl from '@/assets/king/door-out.png'
import pigIdleUrl from '@/assets/pig/idle.png'
import pigRunUrl from '@/assets/pig/run.png'
import pigAttackUrl from '@/assets/pig/attack.png'
import pigHitUrl from '@/assets/pig/hit.png'
import pigDeadUrl from '@/assets/pig/dead.png'
import pigBombIdleUrl from '@/assets/pig-bomb/idle.png'
import pigBombRunUrl from '@/assets/pig-bomb/run.png'
import pigBombThrowUrl from '@/assets/pig-bomb/throw.png'
import pigBombPickUrl from '@/assets/pig-bomb/pick.png'
import bombOffUrl from '@/assets/bomb/off.png'
import bombOnUrl from '@/assets/bomb/on.png'
import bombBoomUrl from '@/assets/bomb/boom.png'
import doorIdleUrl from '@/assets/door/idle.png'
import doorOpeningUrl from '@/assets/door/opening.png'
import doorClosingUrl from '@/assets/door/closing.png'
import terrainUrl from '@/assets/tiles/terrain.png'
import decorationsUrl from '@/assets/tiles/decorations.png'
import barLeftUrl from '@/assets/hud/bar-left.png'
import barMidUrl from '@/assets/hud/bar-mid.png'
import barRightUrl from '@/assets/hud/bar-right.png'
import heartUrl from '@/assets/hud/heart.png'
import diamondUrl from '@/assets/hud/diamond.png'
import numbersUrl from '@/assets/hud/numbers.png'
import bigHeartUrl from '@/assets/pickups/heart.png'
import bigDiamondUrl from '@/assets/pickups/diamond.png'
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
    this.load.spritesheet(TEXTURE_KEY.KING_DOOR_IN, kingDoorInUrl, king)
    this.load.spritesheet(TEXTURE_KEY.KING_DOOR_OUT, kingDoorOutUrl, king)

    const pig = { frameWidth: PIG_SPRITE.FRAME_WIDTH, frameHeight: PIG_SPRITE.FRAME_HEIGHT }
    this.load.spritesheet(TEXTURE_KEY.PIG_IDLE, pigIdleUrl, pig)
    this.load.spritesheet(TEXTURE_KEY.PIG_RUN, pigRunUrl, pig)
    this.load.spritesheet(TEXTURE_KEY.PIG_ATTACK, pigAttackUrl, pig)
    this.load.spritesheet(TEXTURE_KEY.PIG_HIT, pigHitUrl, pig)
    this.load.spritesheet(TEXTURE_KEY.PIG_DEAD, pigDeadUrl, pig)

    const pigBomb = { frameWidth: PIG_BOMB_SPRITE.FRAME_WIDTH, frameHeight: PIG_BOMB_SPRITE.FRAME_HEIGHT }
    this.load.spritesheet(TEXTURE_KEY.PIG_BOMB_IDLE, pigBombIdleUrl, pigBomb)
    this.load.spritesheet(TEXTURE_KEY.PIG_BOMB_RUN, pigBombRunUrl, pigBomb)
    this.load.spritesheet(TEXTURE_KEY.PIG_BOMB_THROW, pigBombThrowUrl, pigBomb)
    this.load.spritesheet(TEXTURE_KEY.PIG_BOMB_PICK, pigBombPickUrl, pigBomb)

    const bomb = { frameWidth: BOMB_SPRITE.FRAME_WIDTH, frameHeight: BOMB_SPRITE.FRAME_HEIGHT }
    this.load.image(TEXTURE_KEY.BOMB_OFF, bombOffUrl)
    this.load.spritesheet(TEXTURE_KEY.BOMB_ON, bombOnUrl, bomb)
    this.load.spritesheet(TEXTURE_KEY.BOMB_BOOM, bombBoomUrl, bomb)

    const door = { frameWidth: DOOR_SPRITE.FRAME_WIDTH, frameHeight: DOOR_SPRITE.FRAME_HEIGHT }
    this.load.spritesheet(TEXTURE_KEY.DOOR_IDLE, doorIdleUrl, door)
    this.load.spritesheet(TEXTURE_KEY.DOOR_OPENING, doorOpeningUrl, door)
    this.load.spritesheet(TEXTURE_KEY.DOOR_CLOSING, doorClosingUrl, door)

    this.load.image(TEXTURE_KEY.TERRAIN, terrainUrl)
    this.load.image(TEXTURE_KEY.DECORATIONS, decorationsUrl)
    this.load.image(TEXTURE_KEY.BAR_LEFT, barLeftUrl)
    this.load.image(TEXTURE_KEY.BAR_MID, barMidUrl)
    this.load.image(TEXTURE_KEY.BAR_RIGHT, barRightUrl)
    this.load.spritesheet(TEXTURE_KEY.HEART, heartUrl, {
      frameWidth: HEART_SPRITE.FRAME_WIDTH,
      frameHeight: HEART_SPRITE.FRAME_HEIGHT,
    })
    this.load.spritesheet(TEXTURE_KEY.BIG_HEART, bigHeartUrl, {
      frameWidth: HEART_SPRITE.FRAME_WIDTH,
      frameHeight: HEART_SPRITE.FRAME_HEIGHT,
    })
    const diamond = { frameWidth: HEART_SPRITE.FRAME_WIDTH, frameHeight: HEART_SPRITE.FRAME_HEIGHT }
    this.load.spritesheet(TEXTURE_KEY.DIAMOND, diamondUrl, diamond)
    this.load.spritesheet(TEXTURE_KEY.BIG_DIAMOND, bigDiamondUrl, diamond)
    this.load.spritesheet(TEXTURE_KEY.NUMBERS, numbersUrl, {
      frameWidth: NUMBER_SPRITE.FRAME_WIDTH,
      frameHeight: NUMBER_SPRITE.FRAME_HEIGHT,
    })
    this.load.tilemapTiledJSON(TILEMAP_KEY.LEVEL1, level1)
  }

  create(): void {
    registerAnimations(this)
    this.scene.start(SCENE_KEY.MENU)
  }
}
