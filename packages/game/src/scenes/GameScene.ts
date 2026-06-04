import Phaser from 'phaser'

import {
  BOMB_BODY,
  BOMB_SPRITE,
  BOX,
  BOX_BODY,
  BOX_SPRITE,
  COLORS,
  COMBAT,
  DOOR,
  KING_BODY,
  KING_SPRITE,
  PLAYER,
} from '@/constants/GameConstants'
import { ENTITY_EVENT, GAME_EVENT } from '@/constants/events'
import { ANIM_KEY, LAYER, OBJECT_LAYER, SCENE_KEY, SPAWN, TEXTURE_KEY, TILEMAP_KEY } from '@/constants/keys'
import { TILE_SIZE, TILESET } from '@/constants/tiles'
import { Bomb } from '@/entities/Bomb'
import { BombItem } from '@/entities/BombItem'
import { BreakableBox } from '@/entities/BreakableBox'
import { Door } from '@/entities/Door'
import { Pickup } from '@/entities/Pickup'
import { Pig } from '@/entities/Pig'
import { PIG_CONFIGS } from '@/entities/pigConfigs'
import { Player } from '@/entities/Player'
import { ThrownBox } from '@/entities/ThrownBox'
import { LEVEL_DEFINITIONS, levelContent, nextLevelKey, previousLevelKey } from '@/levels'
import { CameraSystem } from '@/systems/CameraSystem'
import { CombatSystem } from '@/systems/CombatSystem'
import { InputSystem } from '@/systems/InputSystem'
import { LevelBuilder } from '@/systems/LevelBuilder'
import type { AmmoKind, EnemySpawn, PigBody, ThrowBombEvent, ThrowBoxEvent } from '@/types/enemy'
import type { InputState } from '@/types/input'
import type { BoxBrokenEvent, BoxPlacement, LevelInit, LevelPhase, SpawnTile } from '@/types/level'
import { DiamondCounter } from '@/ui/DiamondCounter'
import { HealthBar } from '@/ui/HealthBar'
import { VirtualControls } from '@/ui/VirtualControls'
import { sendToApp } from '@/utils/bridge'

const DOOR_DEPTH = 5
const PLAYER_DEPTH = 10

export class GameScene extends Phaser.Scene {
  private player!: Player
  private solidLayer!: Phaser.Tilemaps.TilemapLayer
  private entryDoor!: Door
  private exitDoor!: Door
  private enemies: Pig[] = []
  private inputSystem!: InputSystem
  private virtualControls!: VirtualControls
  private phase: LevelPhase = 'intro'
  private levelKey: string = TILEMAP_KEY.LEVEL1
  private prevAttack = false

  constructor() {
    super(SCENE_KEY.GAME)
  }

  init(data: Partial<LevelInit>): void {
    this.levelKey = data.levelKey ?? TILEMAP_KEY.LEVEL1
  }

  create(): void {
    this.phase = 'intro'
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND)

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

    this.player = new Player(this, playerSpawn.x, this.groundedY(playerSpawn.y))
    this.player.setDepth(PLAYER_DEPTH)
    this.physics.add.collider(this.player, solidLayer)

    const content = levelContent(this.levelKey)
    const bombSupply = this.spawnBombSupply(content.bombSupply)
    const boxes = this.spawnBoxes(content.boxes)
    const boxSupply = this.physics.add.group({ allowGravity: false, immovable: true })
    boxes.forEach((box) => boxSupply.add(box))
    this.enemies = this.spawnEnemies(content.enemies, solidLayer, bombSupply, boxSupply)
    new CombatSystem(this, this.player, this.enemies, boxes)
    new HealthBar(this, this.player.maxHearts, this.player.currentHearts)
    new DiamondCounter(this, this.player.currentDiamonds)
    this.events.once(ENTITY_EVENT.PLAYER_DIED, () => this.scene.restart({ levelKey: this.levelKey }))
    this.events.on(ENTITY_EVENT.ENEMY_THROW_BOMB, this.throwBomb, this)
    this.events.on(ENTITY_EVENT.ENEMY_THROW_BOX, this.throwBox, this)
    this.events.on(ENTITY_EVENT.BOX_BROKEN, this.dropLoot, this)

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

  private spawnEnemies(
    spawns: readonly EnemySpawn[],
    solidLayer: Phaser.Tilemaps.TilemapLayer,
    bombSupply: Phaser.Physics.Arcade.Group,
    boxSupply: Phaser.Physics.Arcade.Group,
  ): Pig[] {
    const ammoGroups: Record<AmmoKind, Phaser.Physics.Arcade.Group> = { bomb: bombSupply, box: boxSupply }
    return spawns.map((spawn) => {
      const config = PIG_CONFIGS[spawn.type]
      const x = spawn.col * TILE_SIZE
      const y = this.groundedFor(spawn.row * TILE_SIZE, config.body)
      const pig = new Pig(this, x, y, spawn.patrol * TILE_SIZE, config)
      this.physics.add.collider(pig, solidLayer)
      this.physics.add.overlap(this.player, pig, () => this.tryStomp(pig), undefined, this)
      config.ammo?.forEach((option) => {
        const group = ammoGroups[option.kind]
        pig.addAmmoSource(group)
        this.physics.add.overlap(pig, group, (_, item) => this.tryArm(pig, item as BombItem | BreakableBox))
      })
      return pig
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
    const bomb = new Bomb(this, event.x, event.y, direction)
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

  private tryStomp(pig: Pig): void {
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
      return new BreakableBox(this, x, y, placement.loot)
    })
  }

  // a smashed crate announced its loot: drop a collectible where it broke
  private dropLoot(event: BoxBrokenEvent): void {
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
    pickup.collect()
  }

  private startIntro(): void {
    this.player.setVisible(false)
    this.player.beginCutscene()

    this.entryDoor.open(() => {
      this.player.setVisible(true)
      this.player.enterFromDoor(() => {
        this.entryDoor.close(() => this.dismissEntryDoorIfFirstLevel())
        this.phase = 'play'
      })
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

    this.phase = 'outro'
    this.player.beginCutscene()
    this.player.setPosition(door.x, this.player.y)
    door.open(() => {
      this.player.exitIntoDoor(() => {
        door.close(() => {
          if (which === 'exit') {
            sendToApp(GAME_EVENT.LEVEL_COMPLETE)
          }
          this.scene.restart({ levelKey: destination })
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

  private handleShutdown(): void {
    this.virtualControls.destroy()
  }
}
