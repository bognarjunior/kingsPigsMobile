import Phaser from 'phaser'

import { registerAnimations } from '@/animations/registerAnimations'
import { PIG_SHEETS } from '@/animations/pigSheets'
import { KING_PIG_SHEETS } from '@/animations/kingPigSheets'
import { PIG_TIERS } from '@/constants/GameConstants'
import { recolorSpriteSheet } from '@/systems/recolorTexture'
import {
  BOMB_SPRITE,
  BOX_PIECE_SPRITE,
  BOX_PIG_SPRITE,
  CANNON_SPRITE,
  DOOR_SPRITE,
  FONT_FAMILY,
  MATCH_SPRITE,
  HEART_SPRITE,
  KING_PIG_SPRITE,
  KING_SPRITE,
  NUMBER_SPRITE,
  PIG_BOMB_SPRITE,
  PIG_BOX_SPRITE,
  PIG_SPRITE,
} from '@/constants/GameConstants'
import { SCENE_KEY, SOUND_KEY, TEXTURE_KEY, TILEMAP_KEY } from '@/constants/keys'
import { MUSIC_TRACKS } from '@/services/audioSettings'

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
import kingPigIdleUrl from '@/assets/king-pig/idle.png'
import kingPigRunUrl from '@/assets/king-pig/run.png'
import kingPigAttackUrl from '@/assets/king-pig/attack.png'
import kingPigHitUrl from '@/assets/king-pig/hit.png'
import kingPigDeadUrl from '@/assets/king-pig/dead.png'
import pigBombIdleUrl from '@/assets/pig-bomb/idle.png'
import pigBombRunUrl from '@/assets/pig-bomb/run.png'
import pigBombThrowUrl from '@/assets/pig-bomb/throw.png'
import pigBombPickUrl from '@/assets/pig-bomb/pick.png'
import pigBoxIdleUrl from '@/assets/pig-box/idle.png'
import pigBoxRunUrl from '@/assets/pig-box/run.png'
import pigBoxThrowUrl from '@/assets/pig-box/throw.png'
import pigBoxPickUrl from '@/assets/pig-box/pick.png'
import bombOffUrl from '@/assets/bomb/off.png'
import bombOnUrl from '@/assets/bomb/on.png'
import bombBoomUrl from '@/assets/bomb/boom.png'
import boxIdleUrl from '@/assets/box/idle.png'
import boxPiecesUrl from '@/assets/box/pieces.png'
import boxPigLookUrl from '@/assets/box-pig/look.png'
import boxPigAnticipationUrl from '@/assets/box-pig/anticipation.png'
import boxPigJumpUrl from '@/assets/box-pig/jump.png'
import boxPigFallUrl from '@/assets/box-pig/fall.png'
import boxPigGroundUrl from '@/assets/box-pig/ground.png'
import cannonIdleUrl from '@/assets/cannon/idle.png'
import cannonShootUrl from '@/assets/cannon/shoot.png'
import cannonBallUrl from '@/assets/cannon/ball.png'
import matchLightUrl from '@/assets/match/light.png'
import matchOnUrl from '@/assets/match/on.png'
import matchCannonUrl from '@/assets/match/cannon.png'
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
import kingHeadUrl from '@/assets/hud/king-head.png'
import titleUrl from '@/assets/ui/title.png'
import bigHeartUrl from '@/assets/pickups/heart.png'
import bigDiamondUrl from '@/assets/pickups/diamond.png'
import pressStart2pUrl from '@/assets/fonts/PressStart2P.ttf'
import jumpSfx from '@/assets/audio/jump.wav'
import attackSfx from '@/assets/audio/attack.wav'
import hurtSfx from '@/assets/audio/hurt.wav'
import enemyDieSfx from '@/assets/audio/enemy-die.wav'
import boxBreakSfx from '@/assets/audio/box-break.wav'
import explosionSfx from '@/assets/audio/explosion.wav'
import pickupSfx from '@/assets/audio/pickup.wav'
import buySfx from '@/assets/audio/buy.wav'
import stompSfx from '@/assets/audio/stomp.wav'
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

    const kingPig = { frameWidth: KING_PIG_SPRITE.FRAME_WIDTH, frameHeight: KING_PIG_SPRITE.FRAME_HEIGHT }
    this.load.spritesheet(TEXTURE_KEY.KING_PIG_IDLE, kingPigIdleUrl, kingPig)
    this.load.spritesheet(TEXTURE_KEY.KING_PIG_RUN, kingPigRunUrl, kingPig)
    this.load.spritesheet(TEXTURE_KEY.KING_PIG_ATTACK, kingPigAttackUrl, kingPig)
    this.load.spritesheet(TEXTURE_KEY.KING_PIG_HIT, kingPigHitUrl, kingPig)
    this.load.spritesheet(TEXTURE_KEY.KING_PIG_DEAD, kingPigDeadUrl, kingPig)

    const pigBomb = { frameWidth: PIG_BOMB_SPRITE.FRAME_WIDTH, frameHeight: PIG_BOMB_SPRITE.FRAME_HEIGHT }
    this.load.spritesheet(TEXTURE_KEY.PIG_BOMB_IDLE, pigBombIdleUrl, pigBomb)
    this.load.spritesheet(TEXTURE_KEY.PIG_BOMB_RUN, pigBombRunUrl, pigBomb)
    this.load.spritesheet(TEXTURE_KEY.PIG_BOMB_THROW, pigBombThrowUrl, pigBomb)
    this.load.spritesheet(TEXTURE_KEY.PIG_BOMB_PICK, pigBombPickUrl, pigBomb)

    const pigBox = { frameWidth: PIG_BOX_SPRITE.FRAME_WIDTH, frameHeight: PIG_BOX_SPRITE.FRAME_HEIGHT }
    this.load.spritesheet(TEXTURE_KEY.PIG_BOX_IDLE, pigBoxIdleUrl, pigBox)
    this.load.spritesheet(TEXTURE_KEY.PIG_BOX_RUN, pigBoxRunUrl, pigBox)
    this.load.spritesheet(TEXTURE_KEY.PIG_BOX_THROW, pigBoxThrowUrl, pigBox)
    this.load.spritesheet(TEXTURE_KEY.PIG_BOX_PICK, pigBoxPickUrl, pigBox)

    const bomb = { frameWidth: BOMB_SPRITE.FRAME_WIDTH, frameHeight: BOMB_SPRITE.FRAME_HEIGHT }
    this.load.image(TEXTURE_KEY.BOMB_OFF, bombOffUrl)
    this.load.spritesheet(TEXTURE_KEY.BOMB_ON, bombOnUrl, bomb)
    this.load.spritesheet(TEXTURE_KEY.BOMB_BOOM, bombBoomUrl, bomb)

    this.load.image(TEXTURE_KEY.BOX_IDLE, boxIdleUrl)
    this.load.spritesheet(TEXTURE_KEY.BOX_PIECES, boxPiecesUrl, {
      frameWidth: BOX_PIECE_SPRITE.FRAME_WIDTH,
      frameHeight: BOX_PIECE_SPRITE.FRAME_HEIGHT,
    })

    const boxPig = { frameWidth: BOX_PIG_SPRITE.FRAME_WIDTH, frameHeight: BOX_PIG_SPRITE.FRAME_HEIGHT }
    this.load.spritesheet(TEXTURE_KEY.BOX_PIG_LOOK, boxPigLookUrl, boxPig)
    this.load.spritesheet(TEXTURE_KEY.BOX_PIG_ANTICIPATION, boxPigAnticipationUrl, boxPig)
    this.load.spritesheet(TEXTURE_KEY.BOX_PIG_JUMP, boxPigJumpUrl, boxPig)
    this.load.image(TEXTURE_KEY.BOX_PIG_FALL, boxPigFallUrl)
    this.load.image(TEXTURE_KEY.BOX_PIG_GROUND, boxPigGroundUrl)

    const cannon = { frameWidth: CANNON_SPRITE.FRAME_WIDTH, frameHeight: CANNON_SPRITE.FRAME_HEIGHT }
    this.load.image(TEXTURE_KEY.CANNON_IDLE, cannonIdleUrl)
    this.load.image(TEXTURE_KEY.CANNON_BALL, cannonBallUrl)
    this.load.spritesheet(TEXTURE_KEY.CANNON_SHOOT, cannonShootUrl, cannon)
    const match = { frameWidth: MATCH_SPRITE.FRAME_WIDTH, frameHeight: MATCH_SPRITE.FRAME_HEIGHT }
    this.load.spritesheet(TEXTURE_KEY.MATCH_LIGHT, matchLightUrl, match)
    this.load.spritesheet(TEXTURE_KEY.MATCH_ON, matchOnUrl, match)
    this.load.spritesheet(TEXTURE_KEY.MATCH_CANNON, matchCannonUrl, match)

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
    this.load.image(TEXTURE_KEY.KING_HEAD, kingHeadUrl)
    this.load.image(TEXTURE_KEY.TITLE, titleUrl)

    this.load.audio(SOUND_KEY.JUMP, jumpSfx)
    this.load.audio(SOUND_KEY.ATTACK, attackSfx)
    this.load.audio(SOUND_KEY.HURT, hurtSfx)
    this.load.audio(SOUND_KEY.ENEMY_DIE, enemyDieSfx)
    this.load.audio(SOUND_KEY.BOX_BREAK, boxBreakSfx)
    this.load.audio(SOUND_KEY.EXPLOSION, explosionSfx)
    this.load.audio(SOUND_KEY.PICKUP, pickupSfx)
    this.load.audio(SOUND_KEY.BUY, buySfx)
    this.load.audio(SOUND_KEY.STOMP, stompSfx)
    // music is NOT inlined — it lives next to index.html (in public/audio) and is
    // served as separate files; the app writes the build to disk and loads it via
    // a file:// URL so these relative paths resolve. (see GameScreen / ARCHITECTURE)
    MUSIC_TRACKS.forEach((track) => this.load.audio(track.key, track.file))

    this.load.tilemapTiledJSON(TILEMAP_KEY.LEVEL1, level1)
  }

  create(): void {
    this.buildTierTextures()
    registerAnimations(this)
    this.startWhenFontReady()
  }

  // the pixel font must be ready before any scene draws text, so gate on it
  private startWhenFontReady(): void {
    const font = new FontFace(FONT_FAMILY, `url(${pressStart2pUrl})`)
    font
      .load()
      .then((loaded) => {
        document.fonts.add(loaded)
      })
      .catch(() => undefined)
      .finally(() => this.scene.start(SCENE_KEY.MENU))
  }

  // palette-swap each pig sheet into its coloured tiers before animations register
  private buildTierTextures(): void {
    PIG_TIERS.forEach((tier) => {
      if (!tier.skin) {
        return // green is the source art
      }
      PIG_SHEETS.forEach((sheet) => {
        recolorSpriteSheet(this, sheet.texture, `${sheet.texture}-${tier.name}`, sheet.width, sheet.height, tier.skin!)
      })
      KING_PIG_SHEETS.forEach((sheet) => {
        recolorSpriteSheet(this, sheet.texture, `${sheet.texture}-${tier.name}`, sheet.width, sheet.height, tier.skin!)
      })
    })
  }
}
