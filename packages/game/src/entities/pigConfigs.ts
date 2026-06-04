import { MeleeAttackBehavior } from '@/behaviors/MeleeAttackBehavior'
import { ThrowBombBehavior } from '@/behaviors/ThrowBombBehavior'
import { ThrowBoxBehavior } from '@/behaviors/ThrowBoxBehavior'
import {
  BOMB,
  BOX,
  PIG,
  PIG_BODY,
  PIG_BOMB_BODY,
  PIG_BOMB_SPRITE,
  PIG_BOX_BODY,
  PIG_BOX_SPRITE,
  PIG_SPRITE,
} from '@/constants/GameConstants'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'
import type { PigConfig, PigType } from '@/types/enemy'

// the empty-handed look shared by every pig (basic sprite + body)
const BASE = {
  textures: {
    idle: TEXTURE_KEY.PIG_IDLE,
    run: TEXTURE_KEY.PIG_RUN,
    hit: TEXTURE_KEY.PIG_HIT,
    dead: TEXTURE_KEY.PIG_DEAD,
  },
  anims: {
    idle: ANIM_KEY.PIG_IDLE,
    run: ANIM_KEY.PIG_RUN,
    hit: ANIM_KEY.PIG_HIT,
    dead: ANIM_KEY.PIG_DEAD,
  },
  body: {
    width: PIG_BODY.WIDTH,
    height: PIG_BODY.HEIGHT,
    offsetX: PIG_BODY.OFFSET_X,
    offsetY: PIG_BODY.OFFSET_Y,
    frameHeight: PIG_SPRITE.FRAME_HEIGHT,
  },
} as const

// Each pig type = the shared empty look + either a fixed melee attack or a set of
// ammo it can grab off the floor. A thrower picks up whichever bomb/crate is
// nearest, switches to that ammo's carrying sprite, throws it, then re-arms.
export const PIG_CONFIGS: Readonly<Record<PigType, PigConfig>> = {
  pig: {
    ...BASE,
    createAttack: () => new MeleeAttackBehavior(PIG.ATTACK_RANGE, PIG.ATTACK_COOLDOWN_MS),
  },
  thrower: {
    ...BASE,
    // fists when empty-handed: a thrower still fights once its ammo runs out
    createAttack: () => new MeleeAttackBehavior(PIG.ATTACK_RANGE, PIG.ATTACK_COOLDOWN_MS),
    ammo: [
      {
        kind: 'bomb',
        createAttack: () => new ThrowBombBehavior(BOMB.THROW_RANGE, BOMB.THROW_COOLDOWN_MS),
        armed: {
          idleAnim: ANIM_KEY.PIG_BOMB_IDLE,
          runAnim: ANIM_KEY.PIG_BOMB_RUN,
          pickAnim: ANIM_KEY.PIG_BOMB_PICK,
          body: {
            width: PIG_BOMB_BODY.WIDTH,
            height: PIG_BOMB_BODY.HEIGHT,
            offsetX: PIG_BOMB_BODY.OFFSET_X,
            offsetY: PIG_BOMB_BODY.OFFSET_Y,
            frameHeight: PIG_BOMB_SPRITE.FRAME_HEIGHT,
          },
        },
      },
      {
        kind: 'box',
        createAttack: () => new ThrowBoxBehavior(BOX.THROW_RANGE, BOX.THROW_COOLDOWN_MS),
        armed: {
          idleAnim: ANIM_KEY.PIG_BOX_IDLE,
          runAnim: ANIM_KEY.PIG_BOX_RUN,
          pickAnim: ANIM_KEY.PIG_BOX_PICK,
          body: {
            width: PIG_BOX_BODY.WIDTH,
            height: PIG_BOX_BODY.HEIGHT,
            offsetX: PIG_BOX_BODY.OFFSET_X,
            offsetY: PIG_BOX_BODY.OFFSET_Y,
            frameHeight: PIG_BOX_SPRITE.FRAME_HEIGHT,
          },
        },
      },
    ],
  },
}
