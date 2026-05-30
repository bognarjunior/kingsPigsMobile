import Phaser from 'phaser'

import type { InputState, TouchInputSource } from '@/types/input'

export class InputSystem {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private readonly keyLeft: Phaser.Input.Keyboard.Key
  private readonly keyRight: Phaser.Input.Keyboard.Key
  private readonly keyJump: Phaser.Input.Keyboard.Key
  private readonly keyAttack: Phaser.Input.Keyboard.Key
  private readonly touchSource?: TouchInputSource
  private readonly state = { left: false, right: false, jump: false, attack: false }

  constructor(scene: Phaser.Scene, touchSource?: TouchInputSource) {
    const keyboard = scene.input.keyboard
    if (!keyboard) {
      throw new Error('InputSystem requires a keyboard plugin enabled on the scene')
    }

    const { A, D, SPACE, X } = Phaser.Input.Keyboard.KeyCodes
    this.cursors = keyboard.createCursorKeys()
    this.keyLeft = keyboard.addKey(A)
    this.keyRight = keyboard.addKey(D)
    this.keyJump = keyboard.addKey(SPACE)
    this.keyAttack = keyboard.addKey(X)
    this.touchSource = touchSource
  }

  getState(): InputState {
    const touch = this.touchSource?.getState()
    this.state.left = this.cursors.left.isDown || this.keyLeft.isDown || (touch?.left ?? false)
    this.state.right = this.cursors.right.isDown || this.keyRight.isDown || (touch?.right ?? false)
    this.state.jump = this.cursors.up.isDown || this.keyJump.isDown || (touch?.jump ?? false)
    this.state.attack = this.keyAttack.isDown || (touch?.attack ?? false)
    return this.state
  }
}
