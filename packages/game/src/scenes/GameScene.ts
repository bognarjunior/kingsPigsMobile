import Phaser from 'phaser'

import {
  BOMB,
  BOMB_BODY,
  BOMB_SPRITE,
  BOX,
  BOX_BODY,
  BOX_PIG,
  BOX_PIG_BODY,
  BOX_PIG_SPRITE,
  BOX_SPRITE,
  CANNON,
  COLORS,
  COMBAT,
  DOOR,
  FONT_FAMILY,
  HUD,
  KING_PIG_BODY,
  KING_PIG_SPRITE,
  KING_BODY,
  KING_SPRITE,
  PIG_TIERS,
  PLAYER,
  SETTINGS_BUTTON,
  SHOP,
} from '@/constants/GameConstants'
import { ENTITY_EVENT, GAME_EVENT } from '@/constants/events'
import { ANIM_KEY, LAYER, OBJECT_LAYER, SCENE_KEY, SOUND_KEY, SPAWN, TEXTURE_KEY, TILEMAP_KEY } from '@/constants/keys'
import { TILE_SIZE, TILESET } from '@/constants/tiles'
import { Bomb } from '@/entities/Bomb'
import { BombItem } from '@/entities/BombItem'
import { BoxPig } from '@/entities/BoxPig'
import { BreakableBox } from '@/entities/BreakableBox'
import { Cannon } from '@/entities/Cannon'
import { CannonBall } from '@/entities/CannonBall'
import { Door } from '@/entities/Door'
import type { Enemy } from '@/entities/Enemy'
import { KingPig } from '@/entities/KingPig'
import { Pickup } from '@/entities/Pickup'
import { Pig } from '@/entities/Pig'
import { PIG_CONFIGS } from '@/entities/pigConfigs'
import { Player } from '@/entities/Player'
import { ThrownBox } from '@/entities/ThrownBox'
import { LEVEL_DEFINITIONS, levelContent, nextLevelKey, previousLevelKey } from '@/levels'
import { initAudio, playSfx } from '@/services/audio'
import { runProfile } from '@/services/runProfile'
import { CameraSystem } from '@/systems/CameraSystem'
import { CombatSystem } from '@/systems/CombatSystem'
import { InputSystem } from '@/systems/InputSystem'
import { LevelBuilder } from '@/systems/LevelBuilder'
import type {
  AmmoKind,
  BoxPigRevealEvent,
  CannonFireEvent,
  EnemySpawn,
  PigBody,
  PigConfig,
  PigTier,
  ThrowBombEvent,
  ThrowBoxEvent,
} from '@/types/enemy'
import type { KingPigSpawn, KingPigSummonEvent } from '@/types/kingPig'
import type { InputState } from '@/types/input'
import type {
  BoxBrokenEvent,
  BoxPlacement,
  CannonPlacement,
  DoorWave,
  LevelEntrance,
  LevelInit,
  LevelPhase,
  SpawnTile,
} from '@/types/level'
import { BossHealthBar } from '@/ui/BossHealthBar'
import { DiamondCounter } from '@/ui/DiamondCounter'
import { GameOverOverlay } from '@/ui/GameOverOverlay'
import { HealthBar } from '@/ui/HealthBar'
import { LivesCounter } from '@/ui/LivesCounter'
import { SettingsOverlay } from '@/ui/SettingsOverlay'
import { ShopOverlay, type ShopItem } from '@/ui/ShopOverlay'
import { VirtualControls } from '@/ui/VirtualControls'
import { sendToApp } from '@/utils/bridge'

const DOOR_DEPTH = 5
const ENEMY_DEPTH = 8
const PLAYER_DEPTH = 10

export class GameScene extends Phaser.Scene {
  private player!: Player
  private solidLayer!: Phaser.Tilemaps.TilemapLayer
  private entryDoor!: Door
  private exitDoor!: Door
  private enemies: Enemy[] = []
  private cannons: Cannon[] = []
  private bombSupply!: Phaser.Physics.Arcade.Group
  private boxSupply!: Phaser.Physics.Arcade.Group
  private doorSpawners: { door: Door; wave: DoorWave; triggered: boolean }[] = []
  private inputSystem!: InputSystem
  private virtualControls!: VirtualControls
  private phase: LevelPhase = 'intro'
  private levelKey: string = TILEMAP_KEY.LEVEL1
  private entrance: LevelEntrance = 'entry'
  private introDoor!: Door
  private prevAttack = false
  private shopOpen = false
  private shopOverlay?: ShopOverlay
  private settingsOpen = false
  private settingsOverlay?: SettingsOverlay

  constructor() {
    super(SCENE_KEY.GAME)
  }

  init(data: Partial<LevelInit>): void {
    this.levelKey = data.levelKey ?? TILEMAP_KEY.LEVEL1
    this.entrance = data.entrance ?? 'entry'
  }

  create(): void {
    this.phase = 'intro'
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND)
    initAudio(this) // start/keep the music; first menu tap already unlocked audio

    const definition = LEVEL_DEFINITIONS[this.levelKey]
    if (definition) {
      LevelBuilder.ensure(this, this.levelKey, definition)
    }

    const map = this.make.tilemap({ key: this.levelKey })
    const solidLayer = this.buildLayers(map)
    this.solidLayer = solidLayer

    const entryDoorPoint = this.spawnPoint(map, SPAWN.ENTRY_DOOR)
    const exitDoorPoint = this.spawnPoint(map, SPAWN.EXIT_DOOR)
    const playerSpawn = this.spawnPoint(map, SPAWN.PLAYER)

    this.entryDoor = new Door(this, entryDoorPoint.x, entryDoorPoint.y)
    this.exitDoor = new Door(this, exitDoorPoint.x, exitDoorPoint.y)
    this.entryDoor.setDepth(DOOR_DEPTH)
    this.exitDoor.setDepth(DOOR_DEPTH)

    // arrive at the exit door when coming back from the next level, else the entry
    this.introDoor = this.entrance === 'exit' ? this.exitDoor : this.entryDoor
    const arriveAt = this.entrance === 'exit' ? exitDoorPoint : playerSpawn
    this.player = new Player(this, arriveAt.x, this.groundedY(arriveAt.y))
    this.player.setDepth(PLAYER_DEPTH)
    this.physics.add.collider(this.player, solidLayer)

    const content = levelContent(this.levelKey)
    this.bombSupply = this.spawnBombSupply(content.bombSupply)
    const boxes = this.spawnBoxes(content.boxes)
    this.boxSupply = this.physics.add.group({ allowGravity: false, immovable: true })
    boxes.forEach((box) => this.boxSupply.add(box))
    this.cannons = this.spawnCannons(content.cannons)
    const pigs = this.spawnEnemies(content.enemies)
    const boxPigs = this.spawnBoxPigs(content.boxPigs, solidLayer)
    this.enemies = [...pigs, ...boxPigs]
    const bosses = this.spawnBosses(content.bosses)
    this.enemies.push(...bosses)
    if (bosses.length === 1) {
      new BossHealthBar(this, bosses[0].bossMaxHealth)
    }
    this.doorSpawners = this.spawnDoorSpawners(content.doorWaves)
    new CombatSystem(this, this.player, this.enemies, boxes)
    new HealthBar(this, this.player.maxHearts, this.player.currentHearts)
    new DiamondCounter(this, runProfile.diamonds)
    new LivesCounter(this, runProfile.lives)
    this.createShopButton()
    this.createSettingsButton()
    this.events.once(ENTITY_EVENT.PLAYER_DIED, this.handlePlayerDied, this)
    this.events.on(ENTITY_EVENT.ENEMY_THROW_BOMB, this.throwBomb, this)
    this.events.on(ENTITY_EVENT.ENEMY_THROW_BOX, this.throwBox, this)
    this.events.on(ENTITY_EVENT.BOX_BROKEN, this.dropLoot, this)
    this.events.on(ENTITY_EVENT.BOXPIG_REVEAL, this.revealBoxPig, this)
    this.events.on(ENTITY_EVENT.KING_PIG_SUMMON, this.summonBossMinions, this)
    this.events.on(ENTITY_EVENT.CANNON_FIRE, this.fireCannonBall, this)

    const { widthInPixels, heightInPixels } = map
    this.physics.world.setBounds(0, 0, widthInPixels, heightInPixels)
    new CameraSystem(this, this.player, widthInPixels, heightInPixels)

    this.virtualControls = new VirtualControls()
    this.inputSystem = new InputSystem(this, this.virtualControls)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)

    this.startIntro()
    sendToApp(GAME_EVENT.READY)
  }

  update(): void {
    if (this.shopOpen || this.settingsOpen) {
      return // shop and settings are hard pauses: nothing in the level updates
    }

    const input = this.inputSystem.getState()
    this.player.update(this.resolveDoorInteraction(input))

    if (this.phase !== 'play') {
      return
    }
    this.enemies.forEach((enemy) => {
      if (enemy.active) {
        enemy.update(this.player.x, this.player.y)
      }
    })
    this.updateDoorSpawners()
  }

  // a wave door materialises the first time the King comes near its spot
  private updateDoorSpawners(): void {
    this.doorSpawners.forEach((spawner) => {
      if (spawner.triggered) {
        return
      }
      if (Math.abs(this.player.x - spawner.door.x) <= DOOR.SPAWN_TRIGGER_RANGE) {
        spawner.triggered = true
        this.triggerWave(spawner.door, spawner.wave)
      }
    })
  }

  // fade the door in, open it, release the wave one pig at a time, then vanish
  private triggerWave(door: Door, wave: DoorWave): void {
    door.setVisible(true)
    door.setAlpha(0)
    this.tweens.add({
      targets: door,
      alpha: 1,
      duration: DOOR.WAVE_FADE_MS,
      onComplete: () => door.open(() => this.releaseWave(door, wave, wave.count)),
    })
  }

  private releaseWave(door: Door, wave: DoorWave, remaining: number): void {
    this.spawnWavePig(door.x, wave)
    if (remaining > 1) {
      this.time.delayedCall(DOOR.WAVE_INTERVAL_MS, () => this.releaseWave(door, wave, remaining - 1))
      return
    }
    door.close(() => {
      this.tweens.add({ targets: door, alpha: 0, duration: DOOR.WAVE_FADE_MS, onComplete: () => door.destroy() })
    })
  }

  private spawnWavePig(x: number, wave: DoorWave): void {
    const config = PIG_CONFIGS[wave.type]
    const tier = PIG_TIERS[wave.tier ?? 0] ?? PIG_TIERS[0]
    const y = this.groundedFor(wave.row * TILE_SIZE, config.body)
    this.enemies.push(this.addPig(config, tier, x, y, wave.patrol * TILE_SIZE))
  }

  // The attack press doubles as "open door". A nearby door consumes the press
  // (no hammer swing) unless a pig is in attack range — then combat wins.
  private resolveDoorInteraction(input: InputState): InputState {
    const attackEdge = input.attack && !this.prevAttack
    this.prevAttack = input.attack

    if (this.phase !== 'play' || !attackEdge) {
      return input
    }

    const which = this.doorInFront()
    if (!which || this.pigInAttackRange()) {
      return input
    }

    this.enterDoor(which)
    return { ...input, attack: false }
  }

  private doorInFront(): 'entry' | 'exit' | null {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    if (!body.blocked.down) {
      return null
    }
    if (this.isNearDoor(this.exitDoor)) {
      if (this.hasLiveBoss()) {
        return null
      }
      return 'exit'
    }
    if (this.entryDoor.active && this.isNearDoor(this.entryDoor)) {
      return 'entry'
    }
    return null
  }

  private isNearDoor(door: Door): boolean {
    return Math.abs(this.player.x - door.x) <= DOOR.INTERACT_RANGE
  }

  private pigInAttackRange(): boolean {
    return this.enemies.some(
      (pig) =>
        pig.isAlive &&
        Math.abs(pig.x - this.player.x) <= PLAYER.ATTACK_RANGE &&
        Math.abs(pig.y - this.player.y) <= COMBAT.VERTICAL_REACH,
    )
  }

  private spawnEnemies(spawns: readonly EnemySpawn[]): Pig[] {
    return spawns.map((spawn) => this.spawnEnemy(spawn))
  }

  private spawnEnemy(spawn: EnemySpawn): Pig {
    const config = PIG_CONFIGS[spawn.type]
    const tier = PIG_TIERS[spawn.tier ?? 0] ?? PIG_TIERS[0]
    const x = spawn.col * TILE_SIZE
    const y = this.groundedFor(spawn.row * TILE_SIZE, config.body)
    return this.addPig(config, tier, x, y, spawn.patrol * TILE_SIZE)
  }

  private spawnBoss(spawn: KingPigSpawn): KingPig {
    const body: PigBody = {
      width: KING_PIG_BODY.WIDTH,
      height: KING_PIG_BODY.HEIGHT,
      offsetX: KING_PIG_BODY.OFFSET_X,
      offsetY: KING_PIG_BODY.OFFSET_Y,
      frameHeight: KING_PIG_SPRITE.FRAME_HEIGHT,
    }
    const x = spawn.col * TILE_SIZE
    const y = this.groundedFor(spawn.row * TILE_SIZE, body)
    const boss = new KingPig(
      this,
      x,
      y,
      spawn.patrol * TILE_SIZE,
      spawn.tier ?? 0,
      spawn.summons ?? [],
      spawn.contactDamage,
    )
    boss.setDepth(ENEMY_DEPTH + 1)
    this.physics.add.collider(boss, this.solidLayer)
    this.physics.add.overlap(this.player, boss, () => this.tryStomp(boss), undefined, this)
    return boss
  }

  private spawnBosses(spawns: readonly KingPigSpawn[]): KingPig[] {
    return spawns.map((spawn) => this.spawnBoss(spawn))
  }

  private hasLiveBoss(): boolean {
    return this.enemies.some((enemy) => enemy instanceof KingPig && enemy.isAlive)
  }

  private summonBossMinions(event: KingPigSummonEvent): void {
    event.minions.forEach((spawn) => {
      this.enemies.push(this.spawnEnemy(spawn))
    })
  }

  // create a pig and wire it up (collider, stomp, cannons, ammo). Used by fixed
  // spawns, door spawners, box-pig hatches, and boss summons.
  private addPig(config: PigConfig, tier: PigTier, x: number, y: number, patrolRange: number): Pig {
    const ammoGroups: Record<AmmoKind, Phaser.Physics.Arcade.Group> = { bomb: this.bombSupply, box: this.boxSupply }
    const pig = new Pig(this, x, y, patrolRange, config, tier)
    pig.setDepth(ENEMY_DEPTH)
    pig.setCannons(this.cannons)
    this.physics.add.collider(pig, this.solidLayer)
    this.physics.add.overlap(this.player, pig, () => this.tryStomp(pig), undefined, this)
    config.ammo?.forEach((option) => {
      const group = ammoGroups[option.kind]
      pig.addAmmoSource(group)
      this.physics.add.overlap(pig, group, (_, item) => this.tryArm(pig, item as BombItem | BreakableBox))
    })
    return pig
  }

  // an invisible door per wave; it materialises when the King triggers it
  private spawnDoorSpawners(waves: readonly DoorWave[]): { door: Door; wave: DoorWave; triggered: boolean }[] {
    return waves.map((wave) => {
      const door = new Door(this, wave.col * TILE_SIZE, wave.row * TILE_SIZE)
      door.setDepth(DOOR_DEPTH)
      door.setVisible(false)
      return { door, wave, triggered: false }
    })
  }

  private spawnBombSupply(spawns: readonly SpawnTile[]): Phaser.Physics.Arcade.Group {
    const group = this.physics.add.group({ allowGravity: false, immovable: true })
    spawns.forEach((spawn) => {
      const x = spawn.col * TILE_SIZE
      const y = this.groundedFor(spawn.row * TILE_SIZE, {
        width: BOMB_BODY.WIDTH,
        height: BOMB_BODY.HEIGHT,
        offsetX: BOMB_BODY.OFFSET_X,
        offsetY: BOMB_BODY.OFFSET_Y,
        frameHeight: BOMB_SPRITE.FRAME_HEIGHT,
      })
      group.add(new BombItem(this, x, y))
    })
    return group
  }

  // an unarmed thrower reached its ammo: consume it and let the pig re-arm.
  // a grabbed crate hands over its loot so the pig can break it open when thrown.
  private tryArm(pig: Pig, item: BombItem | BreakableBox): void {
    if (!pig.wantsAmmo || !item.active) {
      return
    }
    if (item instanceof BreakableBox) {
      pig.pickUp('box', item.grab())
    } else {
      item.consume()
      pig.pickUp('bomb')
    }
  }

  private throwBomb(event: ThrowBombEvent): void {
    const direction = Math.sign(event.targetX - event.x) || 1
    const bomb = new Bomb(this, event.x, event.y, direction * BOMB.THROW_SPEED_X, BOMB.THROW_SPEED_Y)
    this.physics.add.collider(bomb, this.solidLayer)
  }

  private throwBox(event: ThrowBoxEvent): void {
    const direction = Math.sign(event.targetX - event.x) || 1
    const box = new ThrownBox(this, event.x, event.y, direction, event.loot)
    this.physics.add.collider(box, this.solidLayer)
    this.physics.add.overlap(this.player, box, () => this.hitByBox(box))
  }

  private hitByBox(box: ThrownBox): void {
    if (!box.isLive) {
      return
    }
    this.player.takeDamage(BOX.THROW_DAMAGE)
    box.shatter()
  }

  // cannons are fixed scenery; any roaming pig can walk up and man them
  private spawnCannons(placements: readonly CannonPlacement[]): Cannon[] {
    return placements.map((placement) => {
      const x = placement.col * TILE_SIZE
      const y = placement.row * TILE_SIZE
      return new Cannon(this, x, y, placement.facing)
    })
  }

  private fireCannonBall(event: CannonFireEvent): void {
    const ball = new CannonBall(this, event.x, event.y, event.directionX)
    this.physics.add.collider(ball, this.solidLayer, () => this.cannonBallLanded(ball))
    this.physics.add.overlap(this.player, ball, () => {
      if (!ball.active) {
        return
      }
      this.player.takeDamage(CANNON.BALL_DAMAGE)
      ball.destroy()
    })
  }

  // the ball reached a solid: it becomes a lit bomb that rests, fuses, then explodes
  private cannonBallLanded(ball: CannonBall): void {
    if (!ball.active) {
      return
    }
    const x = ball.x
    const y = ball.y
    ball.destroy()
    const bomb = new Bomb(this, x, y, 0, 0)
    this.physics.add.collider(bomb, this.solidLayer)
  }

  // crate-disguised pigs: blend with the loot boxes, hunted as combat targets
  private spawnBoxPigs(spawns: readonly EnemySpawn[], solidLayer: Phaser.Tilemaps.TilemapLayer): BoxPig[] {
    const floorBody = {
      width: BOX_PIG_BODY.WIDTH,
      height: BOX_PIG_BODY.HEIGHT,
      offsetX: BOX_PIG_BODY.OFFSET_X,
      offsetY: BOX_PIG_BODY.OFFSET_Y,
      frameHeight: BOX_PIG_SPRITE.FRAME_HEIGHT,
    }
    return spawns.map((spawn) => {
      const x = spawn.col * TILE_SIZE
      const y = this.groundedFor(spawn.row * TILE_SIZE, floorBody)
      const boxPig = new BoxPig(this, x, y, spawn)
      boxPig.setDepth(BOX.DEPTH) // same layer as the loot crates it hides among
      this.physics.add.collider(boxPig, solidLayer)
      this.physics.add.overlap(this.player, boxPig, () => this.handleBoxPigTouch(boxPig), undefined, this)
      return boxPig
    })
  }

  // stomp it from above, or take contact damage once it has woken and is hopping
  private handleBoxPigTouch(boxPig: BoxPig): void {
    if (!boxPig.isAlive) {
      return
    }
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    const pigBody = boxPig.body as Phaser.Physics.Arcade.Body
    const fallingOntoHead = playerBody.velocity.y > 0 && playerBody.bottom <= pigBody.top + COMBAT.STOMP_TOLERANCE
    if (fallingOntoHead) {
      boxPig.stomp()
      this.player.bounce()
      return
    }
    if (boxPig.isLunging) {
      this.player.takeDamage(BOX_PIG.CONTACT_DAMAGE)
    }
  }

  // a settled crate burst open: swap the ambush crate for one real pig at the same slot
  private revealBoxPig(event: BoxPigRevealEvent): void {
    const config = PIG_CONFIGS[event.type]
    const tier = PIG_TIERS[event.tier ?? 0] ?? PIG_TIERS[0]
    const y = this.groundedFor(event.floorY, config.body)
    const pig = this.addPig(config, tier, event.x, y, event.patrol * TILE_SIZE)
    const index = this.enemies.indexOf(event.source)
    if (index >= 0) {
      this.enemies[index] = pig
    } else {
      this.enemies.push(pig)
    }
  }

  private tryStomp(pig: Enemy): void {
    if (!pig.isAlive) {
      return
    }

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    const pigBody = pig.body as Phaser.Physics.Arcade.Body
    const fallingOntoHead = playerBody.velocity.y > 0 && playerBody.bottom <= pigBody.top + COMBAT.STOMP_TOLERANCE
    if (fallingOntoHead) {
      pig.stomp()
      this.player.bounce()
    }
  }

  private groundedFor(floorY: number, body: PigBody): number {
    return floorY - (body.offsetY + body.height - body.frameHeight / 2)
  }

  private spawnBoxes(placements: readonly BoxPlacement[]): BreakableBox[] {
    const floorBody = {
      width: BOX_BODY.WIDTH,
      height: BOX_BODY.HEIGHT,
      offsetX: BOX_BODY.OFFSET_X,
      offsetY: BOX_BODY.OFFSET_Y,
      frameHeight: BOX_SPRITE.FRAME_HEIGHT,
    }
    return placements.map((placement) => {
      const x = placement.col * TILE_SIZE
      const y = this.groundedFor(placement.row * TILE_SIZE, floorBody)
      const id = `${placement.col},${placement.row}`
      // anti-farm: a crate looted on a previous visit comes back empty
      const loot = runProfile.isLootTaken(this.levelKey, id) ? { kind: 'empty' as const } : placement.loot
      return new BreakableBox(this, x, y, loot, id)
    })
  }

  // a smashed crate announced its loot: bank it (so re-entry can't re-loot) and
  // drop the collectible where it broke. Thrown crates carry no id, so they aren't banked.
  private dropLoot(event: BoxBrokenEvent): void {
    if (event.id) {
      runProfile.markLootTaken(this.levelKey, event.id)
    }
    if (event.loot.kind === 'heart') {
      const heart = new Pickup(this, event.x, event.y, TEXTURE_KEY.BIG_HEART, ANIM_KEY.BIG_HEART_IDLE)
      this.physics.add.overlap(this.player, heart, () => this.collectPickup(heart, () => this.player.collectHeart()))
    } else if (event.loot.kind === 'diamonds') {
      const amount = event.loot.amount
      const diamond = new Pickup(this, event.x, event.y, TEXTURE_KEY.BIG_DIAMOND, ANIM_KEY.DIAMOND_IDLE)
      this.physics.add.overlap(this.player, diamond, () => this.collectPickup(diamond, () => this.player.collectDiamond(amount)))
    }
  }

  private collectPickup(pickup: Pickup, onCollect: () => void): void {
    if (!pickup.active) {
      return
    }
    onCollect()
    playSfx(SOUND_KEY.PICKUP)
    pickup.collect()
  }

  private startIntro(): void {
    this.player.setVisible(false)
    this.player.beginCutscene()

    this.introDoor.open(() => {
      this.player.setVisible(true)
      this.player.enterFromDoor(() => {
        this.introDoor.close(() => this.dismissEntryDoorIfFirstLevel())
        this.phase = 'play'
      }, this.entrance === 'exit')
    })
  }

  // first level has no way back: once the intro door shuts, let it linger then vanish
  private dismissEntryDoorIfFirstLevel(): void {
    if (previousLevelKey(this.levelKey) !== null) {
      return
    }
    this.time.delayedCall(DOOR.VANISH_DELAY_MS, () => this.entryDoor.destroy())
  }

  private enterDoor(which: 'entry' | 'exit'): void {
    if (this.phase !== 'play') {
      return
    }

    const door = which === 'exit' ? this.exitDoor : this.entryDoor
    const destination = which === 'exit' ? nextLevelKey(this.levelKey) : previousLevelKey(this.levelKey)
    if (destination === null) {
      return // no level behind the entry door (shouldn't happen: it vanished on level 1)
    }

    // continuous world: leaving forward lands on the next level's entry door, going
    // back lands on the previous level's exit door (where the King originally left it)
    const destinationEntrance: LevelEntrance = which === 'exit' ? 'entry' : 'exit'

    this.phase = 'outro'
    this.player.beginCutscene()
    this.player.setPosition(door.x, this.player.y)
    door.open(() => {
      this.player.exitIntoDoor(() => {
        door.close(() => {
          if (which === 'exit') {
            sendToApp(GAME_EVENT.LEVEL_COMPLETE)
          }
          this.scene.restart({ levelKey: destination, entrance: destinationEntrance })
        })
      })
    })
  }

  private groundedY(floorY: number): number {
    return floorY - (KING_BODY.OFFSET_Y + KING_BODY.HEIGHT - KING_SPRITE.FRAME_HEIGHT / 2)
  }

  private spawnPoint(map: Phaser.Tilemaps.Tilemap, name: string): Phaser.Math.Vector2 {
    const object = map.findObject(OBJECT_LAYER.SPAWNS, (candidate) => candidate.name === name)
    if (!object || object.x === undefined || object.y === undefined) {
      throw new Error(`spawn point "${name}" is missing from the tilemap`)
    }

    return new Phaser.Math.Vector2(object.x, object.y)
  }

  private buildLayers(map: Phaser.Tilemaps.Tilemap): Phaser.Tilemaps.TilemapLayer {
    const tilesets = this.addTilesets(map)

    if (map.getLayerIndexByName(LAYER.BACKGROUND) !== null) {
      map.createLayer(LAYER.BACKGROUND, tilesets, 0, 0)
    }
    if (map.getLayerIndexByName(LAYER.DECORATIONS) !== null) {
      map.createLayer(LAYER.DECORATIONS, tilesets, 0, 0)
    }

    const solidLayer = map.createLayer(LAYER.SOLID, tilesets, 0, 0)
    if (!solidLayer) {
      throw new Error('solid layer could not be created from the tilemap')
    }

    solidLayer.setCollisionByExclusion([-1])
    return solidLayer
  }

  private addTilesets(map: Phaser.Tilemaps.Tilemap): Phaser.Tilemaps.Tileset[] {
    const sources: Record<string, string> = {
      [TILESET.TERRAIN.name]: TEXTURE_KEY.TERRAIN,
      [TILESET.DECORATIONS.name]: TEXTURE_KEY.DECORATIONS,
    }

    const tilesets: Phaser.Tilemaps.Tileset[] = []
    map.tilesets.forEach((declared) => {
      const textureKey = sources[declared.name]
      if (!textureKey) {
        return
      }
      const tileset = map.addTilesetImage(declared.name, textureKey)
      if (tileset) {
        tilesets.push(tileset)
      }
    })

    if (tilesets.length === 0) {
      throw new Error(`no known tileset found for level "${this.levelKey}"`)
    }
    return tilesets
  }

  // out of hearts: spend a life and retry this level, or game over at zero lives
  private handlePlayerDied(): void {
    runProfile.loseLife()
    if (runProfile.lives > 0) {
      this.scene.restart({ levelKey: this.levelKey, entrance: this.entrance })
      return
    }
    this.handleGameOver()
  }

  private handleGameOver(): void {
    this.phase = 'outro'
    sendToApp(GAME_EVENT.OVER)
    new GameOverOverlay(this, () => {
      runProfile.resetRun()
      this.scene.restart({ levelKey: TILEMAP_KEY.LEVEL1, entrance: 'entry' })
    })
  }

  // a HUD button (top-centre) opens the shop at any time during play
  private createShopButton(): void {
    const cx = this.cameras.main.width / 2
    const button = this.add
      .rectangle(cx, 12, 52, 18, 0x000000, 0.45)
      .setScrollFactor(0)
      .setDepth(HUD.DEPTH)
      .setStrokeStyle(1, 0xffffff, 0.6)
      .setInteractive({ useHandCursor: true })
    this.add
      .text(cx, 12, 'SHOP', { fontFamily: FONT_FAMILY, fontSize: '8px', color: '#ffffff' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(HUD.DEPTH + 1)
    button.on(Phaser.Input.Events.POINTER_DOWN, () => this.openShop())
  }

  // the shop is a hard pause: freeze physics, show the overlay
  private openShop(): void {
    if (this.shopOpen || this.phase !== 'play') {
      return
    }
    this.shopOpen = true
    this.physics.pause()
    ;(this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
    const items: ShopItem[] = [
      { label: '+1 MAX HEART', price: SHOP.PRICE_MAX_HEART, available: () => !this.player.maxedHearts, purchase: () => this.buyMaxHeart() },
      { label: '+DAMAGE', price: SHOP.PRICE_DAMAGE, available: () => true, purchase: () => this.buyDamage() },
      { label: '+1 LIFE', price: SHOP.PRICE_LIFE, available: () => true, purchase: () => this.buyLife() },
      { label: 'SHIELD', price: SHOP.PRICE_INVULN, available: () => true, purchase: () => this.buyInvuln() },
    ]
    this.shopOverlay = new ShopOverlay(this, items, () => this.closeShop())
  }

  private closeShop(): void {
    if (!this.shopOpen) {
      return
    }
    this.shopOpen = false
    this.physics.resume()
    this.shopOverlay?.destroy()
    this.shopOverlay = undefined
  }

  // a HUD button (top-left) opens the audio settings; separate from the shop
  private createSettingsButton(): void {
    const button = this.add
      .rectangle(SETTINGS_BUTTON.X, SETTINGS_BUTTON.Y, SETTINGS_BUTTON.WIDTH, SETTINGS_BUTTON.HEIGHT, 0x000000, 0.45)
      .setScrollFactor(0)
      .setDepth(HUD.DEPTH)
      .setStrokeStyle(1, 0xffffff, 0.6)
      .setInteractive({ useHandCursor: true })
    this.add
      .text(SETTINGS_BUTTON.X, SETTINGS_BUTTON.Y, 'AUDIO', {
        fontFamily: FONT_FAMILY,
        fontSize: `${SETTINGS_BUTTON.FONT_SIZE}px`,
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(HUD.DEPTH + 1)
    button.on(Phaser.Input.Events.POINTER_DOWN, () => this.openSettings())
  }

  // settings is a hard pause, like the shop: freeze physics, show the overlay
  private openSettings(): void {
    if (this.settingsOpen || this.shopOpen || this.phase !== 'play') {
      return
    }
    this.settingsOpen = true
    this.physics.pause()
    ;(this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0)
    this.settingsOverlay = new SettingsOverlay(this, () => this.closeSettings())
  }

  private closeSettings(): void {
    if (!this.settingsOpen) {
      return
    }
    this.settingsOpen = false
    this.physics.resume()
    this.settingsOverlay?.destroy()
    this.settingsOverlay = undefined
  }

  private buyMaxHeart(): void {
    if (!runProfile.spend(SHOP.PRICE_MAX_HEART)) {
      return
    }
    runProfile.raiseMaxHeartBonus()
    this.player.raiseMaxHearts()
    this.events.emit(ENTITY_EVENT.PLAYER_DIAMONDS, runProfile.diamonds)
  }

  private buyDamage(): void {
    if (!runProfile.spend(SHOP.PRICE_DAMAGE)) {
      return
    }
    runProfile.raiseDamageBonus(SHOP.DAMAGE_STEP)
    this.events.emit(ENTITY_EVENT.PLAYER_DIAMONDS, runProfile.diamonds)
  }

  private buyLife(): void {
    if (!runProfile.spend(SHOP.PRICE_LIFE)) {
      return
    }
    runProfile.addLife()
    this.events.emit(ENTITY_EVENT.PLAYER_LIVES, runProfile.lives)
    this.events.emit(ENTITY_EVENT.PLAYER_DIAMONDS, runProfile.diamonds)
  }

  private buyInvuln(): void {
    if (!runProfile.spend(SHOP.PRICE_INVULN)) {
      return
    }
    this.player.grantInvulnerability(SHOP.INVULN_MS)
    this.events.emit(ENTITY_EVENT.PLAYER_DIAMONDS, runProfile.diamonds)
    this.closeShop() // close so the shield is spent in play, not in the menu
  }

  private handleShutdown(): void {
    this.events.off(ENTITY_EVENT.KING_PIG_SUMMON, this.summonBossMinions, this)
    this.virtualControls.destroy()
  }
}
