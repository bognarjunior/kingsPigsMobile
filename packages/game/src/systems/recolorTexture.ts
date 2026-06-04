import type Phaser from 'phaser'

import { PIG_SKIN } from '@/constants/GameConstants'
import type { Rgb } from '@/types/enemy'

// Build a recoloured copy of a loaded spritesheet by swapping the pig's skin
// ramp for a tier ramp, then register it under newKey with the same frames.
// One green source in, every coloured tier out — no extra PNGs to ship.
export function recolorSpriteSheet(
  scene: Phaser.Scene,
  baseKey: string,
  newKey: string,
  frameWidth: number,
  frameHeight: number,
  skin: readonly Rgb[],
): void {
  if (scene.textures.exists(newKey)) {
    return
  }

  const source = scene.textures.get(baseKey).getSourceImage() as HTMLImageElement
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }
  ctx.drawImage(source, 0, 0)

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = image.data
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 20) {
      continue
    }
    const match = PIG_SKIN.findIndex(([r, g, b]) => r === pixels[i] && g === pixels[i + 1] && b === pixels[i + 2])
    if (match >= 0) {
      const [r, g, b] = skin[match]
      pixels[i] = r
      pixels[i + 1] = g
      pixels[i + 2] = b
    }
  }
  ctx.putImageData(image, 0, 0)

  // Phaser parses a canvas source into frames just like an image sheet
  scene.textures.addSpriteSheet(newKey, canvas as unknown as HTMLImageElement, { frameWidth, frameHeight })
}
