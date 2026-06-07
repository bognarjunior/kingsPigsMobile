import {
  ANIM,
  KING_PIG_FRAMES,
  KING_PIG_SPRITE,
} from '@/constants/GameConstants'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'

import type { PigSheet } from '@/animations/pigSheets'

const KING_PIG = { width: KING_PIG_SPRITE.FRAME_WIDTH, height: KING_PIG_SPRITE.FRAME_HEIGHT }

export const KING_PIG_SHEETS: readonly PigSheet[] = [
  { texture: TEXTURE_KEY.KING_PIG_IDLE, anim: ANIM_KEY.KING_PIG_IDLE, frames: KING_PIG_FRAMES.IDLE, fps: ANIM.IDLE_FPS, loop: true, ...KING_PIG },
  { texture: TEXTURE_KEY.KING_PIG_RUN, anim: ANIM_KEY.KING_PIG_RUN, frames: KING_PIG_FRAMES.RUN, fps: ANIM.RUN_FPS, loop: true, ...KING_PIG },
  { texture: TEXTURE_KEY.KING_PIG_ATTACK, anim: ANIM_KEY.KING_PIG_ATTACK, frames: KING_PIG_FRAMES.ATTACK, fps: ANIM.ATTACK_FPS, loop: false, ...KING_PIG },
  { texture: TEXTURE_KEY.KING_PIG_HIT, anim: ANIM_KEY.KING_PIG_HIT, frames: KING_PIG_FRAMES.HIT, fps: ANIM.HIT_FPS, loop: false, ...KING_PIG },
  { texture: TEXTURE_KEY.KING_PIG_DEAD, anim: ANIM_KEY.KING_PIG_DEAD, frames: KING_PIG_FRAMES.DEAD, fps: ANIM.DEAD_FPS, loop: false, ...KING_PIG },
]
