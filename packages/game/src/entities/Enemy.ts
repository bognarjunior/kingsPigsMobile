import Phaser from 'phaser'

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture, 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setCollideWorldBounds(true)
  }
}
