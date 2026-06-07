import type Phaser from 'phaser'

import type { Enemy } from '@/entities/Enemy'
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
  // difficulty tier (0 = green base). Drives colour + health/speed/damage.
  readonly tier?: number
}

export type Rgb = readonly [number, number, number]

// a difficulty tier: the recoloured skin ramp plus the stats it scales
export interface PigTier {
  // animation/texture suffix ('' = green base, otherwise 'white' | 'blue' | ...)
  readonly name: string
  // target skin ramp (highlight -> deep shadow); null leaves the green untouched
  readonly skin: readonly Rgb[] | null
  readonly health: number
  readonly speedScale: number
  readonly heartDamage: number
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
  // context carries the thrower's loot and the pig's hit damage; each behaviour
  // reads only what it needs (melee uses damage, the box thrower uses loot)
  fire(scene: Phaser.Scene, x: number, y: number, targetX: number, targetY: number, ctx?: FireContext): void
}

export interface AttackEvent {
  readonly x: number
  readonly y: number
  readonly facingLeft: boolean
  readonly damage?: number
}

// extra context handed to fire(): a thrower's crate loot and the pig's hit damage
export interface FireContext {
  readonly loot?: Loot
  readonly damage?: number
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

export interface CannonFireEvent {
  readonly x: number
  readonly y: number
  readonly directionX: number
}

export interface BoxPigHatch {
  readonly type: PigType
  readonly tier?: number
  readonly patrol: number
}

export interface BoxPigRevealEvent extends BoxPigHatch {
  readonly x: number
  readonly floorY: number
  readonly source: Enemy
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
