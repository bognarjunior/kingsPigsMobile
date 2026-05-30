import Phaser from 'phaser'

import { COLORS, DISPLAY, PIG, PLAYER, WORLD } from '@/constants/GameConstants'
import { GAME_EVENT } from '@/constants/events'
import { SCENE_KEY } from '@/constants/keys'
import { Pig } from '@/entities/Pig'
import { Player } from '@/entities/Player'
import { InputSystem } from '@/systems/InputSystem'
import { VirtualControls } from '@/ui/VirtualControls'
import { sendToApp } from '@/utils/bridge'

export class GameScene extends Phaser.Scene {
  private player!: Player
  private pig!: Pig
  private inputSystem!: InputSystem
  private virtualControls!: VirtualControls

  constructor() {
    super(SCENE_KEY.GAME)
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND)

    const ground = this.createGround()

    this.player = new Player(this, PLAYER.SPAWN_X, PLAYER.SPAWN_Y)
    this.pig = new Pig(this, PIG.SPAWN_X, PIG.SPAWN_Y)
    this.physics.add.collider(this.player, ground)
    this.physics.add.collider(this.pig, ground)

    this.inputSystem = new InputSystem(this)
    this.virtualControls = new VirtualControls()

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)

    sendToApp(GAME_EVENT.READY)
  }

  update(): void {
    this.player.update(this.inputSystem.getState())
    this.pig.update(this.player.x, this.player.y)
  }

  private createGround(): Phaser.GameObjects.Rectangle {
    const ground = this.add.rectangle(
      DISPLAY.WIDTH / 2,
      DISPLAY.HEIGHT - WORLD.GROUND_HEIGHT / 2,
      DISPLAY.WIDTH,
      WORLD.GROUND_HEIGHT,
      COLORS.GROUND,
    )
    this.physics.add.existing(ground, true)
    return ground
  }

  private handleShutdown(): void {
    this.virtualControls.destroy()
  }
}
