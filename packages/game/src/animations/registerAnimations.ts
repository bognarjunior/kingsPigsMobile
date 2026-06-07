import Phaser from 'phaser'

import { PIG_SHEETS } from '@/animations/pigSheets'
import { KING_PIG_SHEETS } from '@/animations/kingPigSheets'
import {
  ANIM,
  BOMB,
  BOMB_FRAMES,
  BOX_PIG,
  BOX_PIG_FRAMES,
  CANNON,
  CANNON_FRAMES,
  COLLECTIBLE_FRAMES,
  DOOR_FRAMES,
  KING_FRAMES,
  MATCH_FRAMES,
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

  KING_PIG_SHEETS.forEach((sheet) => {
    PIG_TIERS.forEach((tier) => {
      const suffix = tier.name ? `-${tier.name}` : ''
      create(sheet.anim + suffix, sheet.texture + suffix, sheet.frames, sheet.fps, sheet.loop)
    })
  })

  create(ANIM_KEY.DOOR_OPENING, TEXTURE_KEY.DOOR_OPENING, DOOR_FRAMES.OPENING, ANIM.DOOR_FPS, false)
  create(ANIM_KEY.DOOR_CLOSING, TEXTURE_KEY.DOOR_CLOSING, DOOR_FRAMES.CLOSING, ANIM.DOOR_FPS, false)

  create(ANIM_KEY.BOMB_ON, TEXTURE_KEY.BOMB_ON, BOMB_FRAMES.ON, BOMB.FUSE_FPS, true)
  create(ANIM_KEY.BOMB_BOOM, TEXTURE_KEY.BOMB_BOOM, BOMB_FRAMES.BOOM, BOMB.BOOM_FPS, false)

  create(ANIM_KEY.BOX_PIG_LOOK, TEXTURE_KEY.BOX_PIG_LOOK, BOX_PIG_FRAMES.LOOK, BOX_PIG.LOOK_FPS, false)
  create(ANIM_KEY.BOX_PIG_ANTICIPATION, TEXTURE_KEY.BOX_PIG_ANTICIPATION, BOX_PIG_FRAMES.ANTICIPATION, BOX_PIG.ANTICIPATION_FPS, false)
  create(ANIM_KEY.BOX_PIG_JUMP, TEXTURE_KEY.BOX_PIG_JUMP, BOX_PIG_FRAMES.JUMP, BOX_PIG.JUMP_FPS, true)

  create(ANIM_KEY.CANNON_SHOOT, TEXTURE_KEY.CANNON_SHOOT, CANNON_FRAMES.SHOOT, CANNON.SHOOT_FPS, false)
  create(ANIM_KEY.MATCH_LIGHT, TEXTURE_KEY.MATCH_LIGHT, MATCH_FRAMES.LIGHT, ANIM.HIT_FPS, false)
  create(ANIM_KEY.MATCH_ON, TEXTURE_KEY.MATCH_ON, MATCH_FRAMES.ON, ANIM.IDLE_FPS, true)
  create(ANIM_KEY.MATCH_CANNON, TEXTURE_KEY.MATCH_CANNON, MATCH_FRAMES.CANNON, ANIM.ATTACK_FPS, false)

  create(ANIM_KEY.HEART_IDLE, TEXTURE_KEY.HEART, COLLECTIBLE_FRAMES.HEART, ANIM.IDLE_FPS, true)
  create(ANIM_KEY.BIG_HEART_IDLE, TEXTURE_KEY.BIG_HEART, COLLECTIBLE_FRAMES.HEART, ANIM.IDLE_FPS, true)
  create(ANIM_KEY.DIAMOND_IDLE, TEXTURE_KEY.BIG_DIAMOND, COLLECTIBLE_FRAMES.DIAMOND, ANIM.IDLE_FPS, true)
}
