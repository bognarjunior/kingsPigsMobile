import Phaser from 'phaser'

// Base for anything the King can fight: it is a physics sprite and exposes the
// combat contract the CombatSystem and stomp logic rely on (a Pig, a cannon's
// operator, …). The scene drives it each frame with the player's position.
export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture, 0)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.setCollideWorldBounds(true)
  }

  abstract get isAlive(): boolean
  abstract takeDamage(amount: number, knockbackDir: number): void
  abstract stomp(): void
  abstract update(playerX: number, playerY: number): void
}
