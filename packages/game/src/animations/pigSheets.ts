import {
  ANIM,
  PIG_BOMB_FRAMES,
  PIG_BOMB_SPRITE,
  PIG_BOX_FRAMES,
  PIG_BOX_SPRITE,
  PIG_FRAMES,
  PIG_SPRITE,
} from '@/constants/GameConstants'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'

// Every pig spritesheet that carries the recolourable skin (basic + bomb/box
// carrying poses). Shared by the recolour step and the animation registration so
// both iterate the same set across all tiers.
export interface PigSheet {
  readonly texture: string
  readonly anim: string
  readonly frames: number
  readonly fps: number
  readonly loop: boolean
  readonly width: number
  readonly height: number
}

const PIG = { width: PIG_SPRITE.FRAME_WIDTH, height: PIG_SPRITE.FRAME_HEIGHT }
const BOMB = { width: PIG_BOMB_SPRITE.FRAME_WIDTH, height: PIG_BOMB_SPRITE.FRAME_HEIGHT }
const BOX = { width: PIG_BOX_SPRITE.FRAME_WIDTH, height: PIG_BOX_SPRITE.FRAME_HEIGHT }

export const PIG_SHEETS: readonly PigSheet[] = [
  { texture: TEXTURE_KEY.PIG_IDLE, anim: ANIM_KEY.PIG_IDLE, frames: PIG_FRAMES.IDLE, fps: ANIM.IDLE_FPS, loop: true, ...PIG },
  { texture: TEXTURE_KEY.PIG_RUN, anim: ANIM_KEY.PIG_RUN, frames: PIG_FRAMES.RUN, fps: ANIM.RUN_FPS, loop: true, ...PIG },
  { texture: TEXTURE_KEY.PIG_ATTACK, anim: ANIM_KEY.PIG_ATTACK, frames: PIG_FRAMES.ATTACK, fps: ANIM.ATTACK_FPS, loop: false, ...PIG },
  { texture: TEXTURE_KEY.PIG_HIT, anim: ANIM_KEY.PIG_HIT, frames: PIG_FRAMES.HIT, fps: ANIM.HIT_FPS, loop: false, ...PIG },
  { texture: TEXTURE_KEY.PIG_DEAD, anim: ANIM_KEY.PIG_DEAD, frames: PIG_FRAMES.DEAD, fps: ANIM.DEAD_FPS, loop: false, ...PIG },
  { texture: TEXTURE_KEY.PIG_BOMB_IDLE, anim: ANIM_KEY.PIG_BOMB_IDLE, frames: PIG_BOMB_FRAMES.IDLE, fps: ANIM.IDLE_FPS, loop: true, ...BOMB },
  { texture: TEXTURE_KEY.PIG_BOMB_RUN, anim: ANIM_KEY.PIG_BOMB_RUN, frames: PIG_BOMB_FRAMES.RUN, fps: ANIM.RUN_FPS, loop: true, ...BOMB },
  { texture: TEXTURE_KEY.PIG_BOMB_PICK, anim: ANIM_KEY.PIG_BOMB_PICK, frames: PIG_BOMB_FRAMES.PICK, fps: ANIM.ATTACK_FPS, loop: false, ...BOMB },
  { texture: TEXTURE_KEY.PIG_BOMB_THROW, anim: ANIM_KEY.PIG_BOMB_THROW, frames: PIG_BOMB_FRAMES.THROW, fps: ANIM.ATTACK_FPS, loop: false, ...BOMB },
  { texture: TEXTURE_KEY.PIG_BOX_IDLE, anim: ANIM_KEY.PIG_BOX_IDLE, frames: PIG_BOX_FRAMES.IDLE, fps: ANIM.IDLE_FPS, loop: true, ...BOX },
  { texture: TEXTURE_KEY.PIG_BOX_RUN, anim: ANIM_KEY.PIG_BOX_RUN, frames: PIG_BOX_FRAMES.RUN, fps: ANIM.RUN_FPS, loop: true, ...BOX },
  { texture: TEXTURE_KEY.PIG_BOX_PICK, anim: ANIM_KEY.PIG_BOX_PICK, frames: PIG_BOX_FRAMES.PICK, fps: ANIM.ATTACK_FPS, loop: false, ...BOX },
  { texture: TEXTURE_KEY.PIG_BOX_THROW, anim: ANIM_KEY.PIG_BOX_THROW, frames: PIG_BOX_FRAMES.THROW, fps: ANIM.ATTACK_FPS, loop: false, ...BOX },
]
