import Phaser from 'phaser'

import { BOMB_BODY, BOMB_SPRITE, COLORS, COMBAT, KING_BODY, KING_SPRITE, PICKUP } from '@/constants/GameConstants'
import { ENTITY_EVENT, GAME_EVENT } from '@/constants/events'
import { ANIM_KEY, LAYER, OBJECT_LAYER, SCENE_KEY, SPAWN, TEXTURE_KEY, TILEMAP_KEY } from '@/constants/keys'
import { TILE_SIZE, TILESET } from '@/constants/tiles'
import { Bomb } from '@/entities/Bomb'
import { BombItem } from '@/entities/BombItem'
import { Door } from '@/entities/Door'
import { Pickup } from '@/entities/Pickup'
import { Pig } from '@/entities/Pig'
import { PIG_CONFIGS } from '@/entities/pigConfigs'
import { Player } from '@/entities/Player'
import { LEVEL_BOMB_SUPPLY, LEVEL_DEFINITIONS, LEVEL_ENEMIES, LEVEL_PICKUPS, nextLevelKey } from '@/levels'
import { CameraSystem } from '@/systems/CameraSystem'
import { CombatSystem } from '@/systems/CombatSystem'
import { InputSystem } from '@/systems/InputSystem'
import { LevelBuilder } from '@/systems/LevelBuilder'
import type { EnemySpawn, PigBody, ThrowBombEvent } from '@/types/enemy'
import type { LevelInit, LevelPhase, PickupSpawn, SpawnTile } from '@/types/level'
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
    this.physics.add.overlap(this.player, this.exitDoor, this.handleExitReached, undefined, this)

    const bombSupply = this.spawnBombSupply(LEVEL_BOMB_SUPPLY[this.levelKey] ?? [])
    this.enemies = this.spawnEnemies(LEVEL_ENEMIES[this.levelKey] ?? [], solidLayer, bombSupply)
    new CombatSystem(this, this.player, this.enemies)
    new HealthBar(this, this.player.maxHearts, this.player.currentHearts)
    new DiamondCounter(this, this.player.currentDiamonds)
    this.spawnPickups(LEVEL_PICKUPS[this.levelKey] ?? [])
    this.events.once(ENTITY_EVENT.PLAYER_DIED, () => this.scene.restart({ levelKey: this.levelKey }))
    this.events.on(ENTITY_EVENT.ENEMY_THROW_BOMB, this.throwBomb, this)

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
    this.player.update(this.inputSystem.getState())

    if (this.phase !== 'play') {
      return
    }
    this.enemies.forEach((enemy) => {
      if (enemy.active) {
        enemy.update(this.player.x, this.player.y)
      }
    })
  }

  private spawnEnemies(
    spawns: readonly EnemySpawn[],
    solidLayer: Phaser.Tilemaps.TilemapLayer,
    bombSupply: Phaser.Physics.Arcade.Group,
  ): Pig[] {
    return spawns.map((spawn) => {
      const config = PIG_CONFIGS[spawn.type]
      const x = spawn.col * TILE_SIZE
      const y = this.groundedFor(spawn.row * TILE_SIZE, config.body)
      const pig = new Pig(this, x, y, spawn.patrol * TILE_SIZE, config)
      this.physics.add.collider(pig, solidLayer)
      this.physics.add.overlap(this.player, pig, () => this.tryStomp(pig), undefined, this)
      if (config.seeksAmmo) {
        pig.setAmmoSource(bombSupply)
        this.physics.add.overlap(pig, bombSupply, (_, item) => this.tryArm(pig, item as BombItem))
      }
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

  // an unarmed thrower walked onto a loose bomb: consume it and let the pig re-arm
  private tryArm(pig: Pig, item: BombItem): void {
    if (!pig.wantsAmmo || !item.active) {
      return
    }
    item.consume()
    pig.pickUp()
  }

  private throwBomb(event: ThrowBombEvent): void {
    const direction = Math.sign(event.targetX - event.x) || 1
    const bomb = new Bomb(this, event.x, event.y, direction)
    this.physics.add.collider(bomb, this.solidLayer)
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

  private spawnPickups(spawns: readonly PickupSpawn[]): void {
    spawns.forEach((spawn) => {
      const x = spawn.col * TILE_SIZE
      const y = spawn.row * TILE_SIZE - PICKUP.FLOAT_ABOVE_FLOOR
      if (spawn.kind === 'heart') {
        const heart = new Pickup(this, x, y, TEXTURE_KEY.BIG_HEART, ANIM_KEY.BIG_HEART_IDLE)
        this.physics.add.overlap(this.player, heart, () => this.collectPickup(heart, () => this.player.collectHeart()))
      } else {
        const diamond = new Pickup(this, x, y, TEXTURE_KEY.BIG_DIAMOND, ANIM_KEY.DIAMOND_IDLE)
        this.physics.add.overlap(this.player, diamond, () => this.collectPickup(diamond, () => this.player.collectDiamond()))
      }
    })
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
        this.entryDoor.close()
        this.phase = 'play'
      })
    })
  }

  private handleExitReached(): void {
    if (this.phase !== 'play') {
      return
    }

    this.phase = 'outro'
    this.player.setPosition(this.exitDoor.x, this.player.y)

    this.exitDoor.open(() => {
      this.player.exitIntoDoor(() => {
        this.exitDoor.close(() => {
          sendToApp(GAME_EVENT.LEVEL_COMPLETE)
          this.scene.restart({ levelKey: nextLevelKey(this.levelKey) })
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
