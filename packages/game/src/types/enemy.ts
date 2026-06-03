import type Phaser from 'phaser'

export type EnemyState = 'idle' | 'run' | 'attack' | 'hurt' | 'dead'

export type PigType = 'pig' | 'bomb'

export interface EnemySpawn {
  readonly type: PigType
  readonly col: number
  readonly row: number
  readonly patrol: number
}

// pluggable attack: the pig plays `anim` and, at the strike moment, calls fire()
// to deal the attack (a melee hit, a thrown bomb, ...) via scene events.
export interface AttackBehavior {
  readonly range: number
  readonly anim: string
  ready(now: number): boolean
  trigger(now: number): void
  fire(scene: Phaser.Scene, x: number, y: number, targetX: number, targetY: number): void
}

export interface AttackEvent {
  readonly x: number
  readonly y: number
  readonly facingLeft: boolean
}

export interface ThrowBombEvent {
  readonly x: number
  readonly y: number
  readonly targetX: number
}

export interface BombExplodeEvent {
  readonly x: number
  readonly y: number
}

export interface PigBody {
  readonly width: number
  readonly height: number
  readonly offsetX: number
  readonly offsetY: number
  readonly frameHeight: number
}

export interface PigTextures {
  readonly idle: string
  readonly run: string
  readonly hit: string
  readonly dead: string
}

export interface PigAnims {
  readonly idle: string
  readonly run: string
  readonly hit: string
  readonly dead: string
}

// the look a thrower wears while it carries ammo (different sprite sheet, so it
// brings its own body) plus the pick-up animation it plays to re-arm
export interface ArmedSet {
  readonly idleAnim: string
  readonly runAnim: string
  readonly pickAnim: string
  readonly body: PigBody
}

export interface PigConfig {
  readonly textures: PigTextures
  readonly anims: PigAnims
  readonly body: PigBody
  readonly createAttack: () => AttackBehavior
  // throwers start unarmed, seek a bomb/box on the ground, and re-arm by picking it up
  readonly seeksAmmo: boolean
  readonly armed?: ArmedSet
}
