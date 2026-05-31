import Phaser from 'phaser'

import { COLORS, KING_BODY, KING_SPRITE } from '@/constants/GameConstants'
import { GAME_EVENT } from '@/constants/events'
import { LAYER, OBJECT_LAYER, SCENE_KEY, SPAWN, TEXTURE_KEY, TILEMAP_KEY, TILESET_NAME } from '@/constants/keys'
import { Door } from '@/entities/Door'
import { Player } from '@/entities/Player'
import { CameraSystem } from '@/systems/CameraSystem'
import { InputSystem } from '@/systems/InputSystem'
import type { LevelPhase } from '@/types/level'
import { VirtualControls } from '@/ui/VirtualControls'
import { sendToApp } from '@/utils/bridge'

const DOOR_DEPTH = 5
const PLAYER_DEPTH = 10

export class GameScene extends Phaser.Scene {
  private player!: Player
  private entryDoor!: Door
  private exitDoor!: Door
  private inputSystem!: InputSystem
  private virtualControls!: VirtualControls
  private phase: LevelPhase = 'intro'

  constructor() {
    super(SCENE_KEY.GAME)
  }

  create(): void {
    this.phase = 'intro'
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND)

    const map = this.make.tilemap({ key: TILEMAP_KEY.LEVEL1 })
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
          this.scene.restart()
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
    const tileset = map.addTilesetImage(TILESET_NAME, TEXTURE_KEY.TERRAIN)
    if (!tileset) {
      throw new Error('terrain tileset could not be added to the tilemap')
    }

    map.createLayer(LAYER.BACKGROUND, tileset, 0, 0)
    const solidLayer = map.createLayer(LAYER.SOLID, tileset, 0, 0)
    if (!solidLayer) {
      throw new Error('solid layer could not be created from the tilemap')
    }

    solidLayer.setCollisionByExclusion([-1])
    return solidLayer
  }

  private handleShutdown(): void {
    this.virtualControls.destroy()
  }
}
