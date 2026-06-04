import type Phaser from 'phaser'

import type { Loot } from '@/types/level'

export type EnemyState = 'idle' | 'run' | 'attack' | 'hurt' | 'dead'

export type PigType = 'pig' | 'thrower'

// the kinds of grounded ammo a thrower can pick up and lob
export type AmmoKind = 'bomb' | 'box'

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
  // 1-based animation frame at which the strike/projectile is released
  readonly releaseFrame: number
  ready(now: number): boolean
  trigger(now: number): void
  // payload carries what the thrower holds (e.g. a crate's loot); melee/bomb ignore it
  fire(scene: Phaser.Scene, x: number, y: number, targetX: number, targetY: number, payload?: Loot): void
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

export interface ThrowBoxEvent {
  readonly x: number
  readonly y: number
  readonly targetX: number
  readonly loot: Loot
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

// one ammo kind a thrower can use: the look it wears while carrying it plus how
// it throws it. A thrower may list several (bomb, box, ...) and use whichever it
// finds first on the ground.
export interface AmmoOption {
  readonly kind: AmmoKind
  readonly armed: ArmedSet
  readonly createAttack: () => AttackBehavior
}

export interface PigConfig {
  readonly textures: PigTextures
  readonly anims: PigAnims
  readonly body: PigBody
  // a melee pig has a fixed attack and never seeks ammo
  readonly createAttack?: () => AttackBehavior
  // a thrower starts empty-handed and re-arms from any of these ammo kinds
  readonly ammo?: readonly AmmoOption[]
}
