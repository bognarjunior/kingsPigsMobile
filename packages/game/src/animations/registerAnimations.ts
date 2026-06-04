import Phaser from 'phaser'

import { PIG_SHEETS } from '@/animations/pigSheets'
import {
  ANIM,
  BOMB,
  BOMB_FRAMES,
  COLLECTIBLE_FRAMES,
  DOOR_FRAMES,
  KING_FRAMES,
  PIG_TIERS,
} from '@/constants/GameConstants'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'

export function registerAnimations(scene: Phaser.Scene): void {
  const create = (
    key: string,
    texture: string,
    frameCount: number,
    frameRate: number,
    loop: boolean,
  ): void => {
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(texture, { start: 0, end: frameCount - 1 }),
      frameRate,
      repeat: loop ? -1 : 0,
    })
  }

  create(ANIM_KEY.KING_IDLE, TEXTURE_KEY.KING_IDLE, KING_FRAMES.IDLE, ANIM.IDLE_FPS, true)
  create(ANIM_KEY.KING_RUN, TEXTURE_KEY.KING_RUN, KING_FRAMES.RUN, ANIM.RUN_FPS, true)
  create(ANIM_KEY.KING_JUMP, TEXTURE_KEY.KING_JUMP, KING_FRAMES.JUMP, ANIM.IDLE_FPS, false)
  create(ANIM_KEY.KING_FALL, TEXTURE_KEY.KING_FALL, KING_FRAMES.FALL, ANIM.IDLE_FPS, false)
  create(ANIM_KEY.KING_ATTACK, TEXTURE_KEY.KING_ATTACK, KING_FRAMES.ATTACK, ANIM.ATTACK_FPS, false)
  create(ANIM_KEY.KING_HIT, TEXTURE_KEY.KING_HIT, KING_FRAMES.HIT, ANIM.HIT_FPS, false)
  create(ANIM_KEY.KING_DEAD, TEXTURE_KEY.KING_DEAD, KING_FRAMES.DEAD, ANIM.DEAD_FPS, false)
  create(ANIM_KEY.KING_DOOR_IN, TEXTURE_KEY.KING_DOOR_IN, KING_FRAMES.DOOR_IN, ANIM.KING_DOOR_FPS, false)
  create(ANIM_KEY.KING_DOOR_OUT, TEXTURE_KEY.KING_DOOR_OUT, KING_FRAMES.DOOR_OUT, ANIM.KING_DOOR_FPS, false)

  // every pig sheet, once per difficulty tier (green base + recoloured variants)
  PIG_SHEETS.forEach((sheet) => {
    PIG_TIERS.forEach((tier) => {
      const suffix = tier.name ? `-${tier.name}` : ''
      create(sheet.anim + suffix, sheet.texture + suffix, sheet.frames, sheet.fps, sheet.loop)
    })
  })

  create(ANIM_KEY.DOOR_OPENING, TEXTURE_KEY.DOOR_OPENING, DOOR_FRAMES.OPENING, ANIM.DOOR_FPS, false)
  create(ANIM_KEY.DOOR_CLOSING, TEXTURE_KEY.DOOR_CLOSING, DOOR_FRAMES.CLOSING, ANIM.DOOR_FPS, false)

  create(ANIM_KEY.BOMB_ON, TEXTURE_KEY.BOMB_ON, BOMB_FRAMES.ON, BOMB.FUSE_FPS, true)
  create(ANIM_KEY.BOMB_BOOM, TEXTURE_KEY.BOMB_BOOM, BOMB_FRAMES.BOOM, BOMB.BOOM_FPS, false)

  create(ANIM_KEY.HEART_IDLE, TEXTURE_KEY.HEART, COLLECTIBLE_FRAMES.HEART, ANIM.IDLE_FPS, true)
  create(ANIM_KEY.BIG_HEART_IDLE, TEXTURE_KEY.BIG_HEART, COLLECTIBLE_FRAMES.HEART, ANIM.IDLE_FPS, true)
  create(ANIM_KEY.DIAMOND_IDLE, TEXTURE_KEY.BIG_DIAMOND, COLLECTIBLE_FRAMES.DIAMOND, ANIM.IDLE_FPS, true)
}
