export type LevelPhase = 'intro' | 'play' | 'outro'

export interface LevelInit {
  readonly levelKey: string
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

export interface LevelSpawns {
  readonly player: SpawnTile
  readonly entryDoor: SpawnTile
  readonly exitDoor: SpawnTile
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
