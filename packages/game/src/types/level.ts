import type { EnemySpawn } from '@/types/enemy'

export type LevelPhase = 'intro' | 'play' | 'outro'

// which door the King steps out of on arrival: 'entry' when coming forward (or at
// game start), 'exit' when coming back from the next level (continuous world).
export type LevelEntrance = 'entry' | 'exit'

export interface LevelInit {
  readonly levelKey: string
  readonly entrance?: LevelEntrance
}

// inclusive interior rectangle (in tile coordinates)
export interface Rect {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

// a brick finger carved out of the room contour (stalactite / stalagmite)
export interface Finger {
  readonly col: number
  readonly top: number
  readonly bottom: number
  readonly width: number
}

export type PlankMaterial = 'wood' | 'brick'

export interface Plank {
  readonly row: number
  readonly from: number
  readonly to: number
  readonly material: PlankMaterial
}

export type DecorationKind = 'window' | 'flag'

export interface Decoration {
  readonly kind: DecorationKind
  readonly col: number
  readonly row: number
}

export interface SpawnTile {
  readonly col: number
  readonly row: number
}

export type PickupKind = 'heart' | 'diamond'

export interface PickupSpawn {
  readonly kind: PickupKind
  readonly col: number
  readonly row: number
}

// what a crate holds; authored per box (not random)
export type Loot =
  | { readonly kind: 'empty' }
  | { readonly kind: 'heart' }
  | { readonly kind: 'diamonds'; readonly amount: number }

export interface BoxPlacement {
  readonly col: number
  readonly row: number
  readonly loot: Loot
}

export interface BoxBrokenEvent {
  readonly x: number
  readonly y: number
  readonly loot: Loot
  // set when a scenery crate (not a thrown one) breaks, so its loot is banked once
  readonly id?: string
}

export interface LevelSpawns {
  readonly player: SpawnTile
  readonly entryDoor: SpawnTile
  readonly exitDoor: SpawnTile
}

// everything that populates a level (entities/items), kept apart from the room
// geometry in LevelDefinition. One per level, whatever the map's source.
export type CannonFacing = 'left' | 'right'

export interface CannonPlacement {
  readonly col: number
  readonly row: number
  readonly facing: CannonFacing
}

export interface LevelContent {
  readonly enemies: readonly EnemySpawn[]
  readonly boxes: readonly BoxPlacement[]
  readonly bombSupply: readonly SpawnTile[]
  readonly cannons: readonly CannonPlacement[]
}

export interface LevelDefinition {
  readonly width: number
  readonly height: number
  readonly rooms: readonly Rect[]
  readonly stalactites: readonly Finger[]
  readonly stalagmites: readonly Finger[]
  readonly planks: readonly Plank[]
  readonly decorations: readonly Decoration[]
  readonly spawns: LevelSpawns
}
