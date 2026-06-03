import { MeleeAttackBehavior } from '@/behaviors/MeleeAttackBehavior'
import { ThrowBombBehavior } from '@/behaviors/ThrowBombBehavior'
import { BOMB, PIG, PIG_BODY, PIG_BOMB_BODY, PIG_BOMB_SPRITE, PIG_SPRITE } from '@/constants/GameConstants'
import { ANIM_KEY, TEXTURE_KEY } from '@/constants/keys'
import type { PigConfig, PigType } from '@/types/enemy'

// Each pig type = a sprite/body set + an attack behaviour. The bomb pig reuses
// the basic pig's hit/dead (its own sheet has none).
export const PIG_CONFIGS: Readonly<Record<PigType, PigConfig>> = {
  pig: {
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
    createAttack: () => new MeleeAttackBehavior(PIG.ATTACK_RANGE, PIG.ATTACK_COOLDOWN_MS),
    seeksAmmo: false,
  },
  // empty-handed it looks like a basic pig; once it grabs a grounded bomb it
  // switches to the bomb-carrying sheet, throws once, then hunts for another.
  bomb: {
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
    createAttack: () => new ThrowBombBehavior(BOMB.THROW_RANGE, BOMB.THROW_COOLDOWN_MS),
    seeksAmmo: true,
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
}
