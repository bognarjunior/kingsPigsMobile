import Phaser from 'phaser'

import { ANIM, KING_FRAMES, PIG_FRAMES } from '@/constants/GameConstants'
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

  create(ANIM_KEY.PIG_IDLE, TEXTURE_KEY.PIG_IDLE, PIG_FRAMES.IDLE, ANIM.IDLE_FPS, true)
  create(ANIM_KEY.PIG_RUN, TEXTURE_KEY.PIG_RUN, PIG_FRAMES.RUN, ANIM.RUN_FPS, true)
}
