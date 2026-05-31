import Phaser from 'phaser'

import { COLORS, PLAYER } from '@/constants/GameConstants'
import { GAME_EVENT } from '@/constants/events'
import { LAYER, SCENE_KEY, TEXTURE_KEY, TILEMAP_KEY, TILESET_NAME } from '@/constants/keys'
import { Player } from '@/entities/Player'
import { CameraSystem } from '@/systems/CameraSystem'
import { InputSystem } from '@/systems/InputSystem'
import { VirtualControls } from '@/ui/VirtualControls'
import { sendToApp } from '@/utils/bridge'

export class GameScene extends Phaser.Scene {
  private player!: Player
  private inputSystem!: InputSystem
  private virtualControls!: VirtualControls

  constructor() {
    super(SCENE_KEY.GAME)
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND)

    const solidLayer = this.createLevel()

    this.player = new Player(this, PLAYER.SPAWN_X, PLAYER.SPAWN_Y)
    this.physics.add.collider(this.player, solidLayer)

    const { widthInPixels, heightInPixels } = solidLayer.tilemap
    this.physics.world.setBounds(0, 0, widthInPixels, heightInPixels)
    new CameraSystem(this, this.player, widthInPixels, heightInPixels)

    this.virtualControls = new VirtualControls()
    this.inputSystem = new InputSystem(this, this.virtualControls)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)

    sendToApp(GAME_EVENT.READY)
  }

  update(): void {
    this.player.update(this.inputSystem.getState())
  }

  private createLevel(): Phaser.Tilemaps.TilemapLayer {
    const map = this.make.tilemap({ key: TILEMAP_KEY.LEVEL1 })
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
