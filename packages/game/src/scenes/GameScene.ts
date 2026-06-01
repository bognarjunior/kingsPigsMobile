import Phaser from 'phaser'

import { COLORS, COMBAT, KING_BODY, KING_SPRITE, PIG_BODY, PIG_SPRITE } from '@/constants/GameConstants'
import { ENTITY_EVENT, GAME_EVENT } from '@/constants/events'
import { LAYER, OBJECT_LAYER, SCENE_KEY, SPAWN, TEXTURE_KEY, TILEMAP_KEY } from '@/constants/keys'
import { TILE_SIZE, TILESET } from '@/constants/tiles'
import { Door } from '@/entities/Door'
import { Pig } from '@/entities/Pig'
import { Player } from '@/entities/Player'
import { LEVEL_DEFINITIONS, LEVEL_ENEMIES, nextLevelKey } from '@/levels'
import { CameraSystem } from '@/systems/CameraSystem'
import { CombatSystem } from '@/systems/CombatSystem'
import { InputSystem } from '@/systems/InputSystem'
import { LevelBuilder } from '@/systems/LevelBuilder'
import type { EnemySpawn } from '@/types/enemy'
import type { LevelInit, LevelPhase } from '@/types/level'
import { VirtualControls } from '@/ui/VirtualControls'
import { sendToApp } from '@/utils/bridge'

const DOOR_DEPTH = 5
const PLAYER_DEPTH = 10

export class GameScene extends Phaser.Scene {
  private player!: Player
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

    this.enemies = this.spawnEnemies(LEVEL_ENEMIES[this.levelKey] ?? [], solidLayer)
    new CombatSystem(this, this.player, this.enemies)
    this.events.once(ENTITY_EVENT.PLAYER_DIED, () => this.scene.restart({ levelKey: this.levelKey }))

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

  private spawnEnemies(spawns: readonly EnemySpawn[], solidLayer: Phaser.Tilemaps.TilemapLayer): Pig[] {
    return spawns.map((spawn) => {
      const x = spawn.col * TILE_SIZE
      const pig = new Pig(this, x, this.groundedYForEnemy(spawn.row * TILE_SIZE), spawn.patrol * TILE_SIZE)
      this.physics.add.collider(pig, solidLayer)
      this.physics.add.overlap(this.player, pig, () => this.tryStomp(pig), undefined, this)
      return pig
    })
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

  private groundedYForEnemy(floorY: number): number {
    return floorY - (PIG_BODY.OFFSET_Y + PIG_BODY.HEIGHT - PIG_SPRITE.FRAME_HEIGHT / 2)
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
