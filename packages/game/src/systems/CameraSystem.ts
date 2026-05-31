import Phaser from 'phaser'

import { CAMERA } from '@/constants/GameConstants'

export class CameraSystem {
  constructor(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, width: number, height: number) {
    const camera = scene.cameras.main
    camera.setBounds(0, 0, width, height)
    camera.startFollow(target, true, CAMERA.LERP, CAMERA.LERP)
  }
}
