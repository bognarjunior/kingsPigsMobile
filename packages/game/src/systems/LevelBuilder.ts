import Phaser from 'phaser'

import { DECO_TILE as D, TERRAIN_TILE as T, TILE_SIZE, TILESET } from '@/constants/tiles'
import { LAYER, OBJECT_LAYER, SPAWN } from '@/constants/keys'
import type { Decoration, Finger, LevelDefinition, Plank } from '@/types/level'

const EMPTY = 0

type Grid = number[]

interface BuiltGrids {
  readonly background: Grid
  readonly decorations: Grid
  readonly solid: Grid
}

export class LevelBuilder {
  // Ensure the tilemap for `key` is in the scene cache, building it from the
  // definition if it isn't already loaded (e.g. a hand-authored Tiled JSON).
  static ensure(scene: Phaser.Scene, key: string, definition: LevelDefinition): void {
    if (scene.cache.tilemap.exists(key)) {
      return
    }

    scene.cache.tilemap.add(key, {
      format: Phaser.Tilemaps.Formats.TILED_JSON,
      data: LevelBuilder.toTiledJSON(definition),
    })
  }

  static toTiledJSON(def: LevelDefinition): object {
    const { width: w, height: h } = def
    const grids = LevelBuilder.buildGrids(def)
    const layer = (name: string, id: number, data: Grid): object => ({
      type: 'tilelayer',
      name,
      id,
      width: w,
      height: h,
      x: 0,
      y: 0,
      opacity: 1,
      visible: true,
      data,
    })

    return {
      type: 'map',
      orientation: 'orthogonal',
      renderorder: 'right-down',
      infinite: false,
      width: w,
      height: h,
      tilewidth: TILE_SIZE,
      tileheight: TILE_SIZE,
      tilesets: [
        LevelBuilder.tilesetEntry(TILESET.TERRAIN),
        LevelBuilder.tilesetEntry(TILESET.DECORATIONS),
      ],
      layers: [
        layer(LAYER.BACKGROUND, 1, grids.background),
        layer(LAYER.DECORATIONS, 2, grids.decorations),
        layer(LAYER.SOLID, 3, grids.solid),
        LevelBuilder.spawnsLayer(def),
      ],
      nextlayerid: 5,
      nextobjectid: 4,
      tiledversion: '1.10',
      version: '1.10',
    }
  }

  private static tilesetEntry(ts: {
    readonly name: string
    readonly firstgid: number
    readonly columns: number
    readonly image: string
    readonly imageWidth: number
    readonly imageHeight: number
    readonly tileCount: number
  }): object {
    return {
      firstgid: ts.firstgid,
      name: ts.name,
      image: ts.image,
      imagewidth: ts.imageWidth,
      imageheight: ts.imageHeight,
      tilewidth: TILE_SIZE,
      tileheight: TILE_SIZE,
      tilecount: ts.tileCount,
      columns: ts.columns,
      margin: 0,
      spacing: 0,
    }
  }

  private static spawnsLayer(def: LevelDefinition): object {
    const point = (id: number, name: string, tile: { col: number; row: number }): object => ({
      id,
      name,
      type: '',
      x: tile.col * TILE_SIZE,
      y: tile.row * TILE_SIZE,
      width: 0,
      height: 0,
      point: true,
      rotation: 0,
      visible: true,
    })

    return {
      type: 'objectgroup',
      name: OBJECT_LAYER.SPAWNS,
      id: 4,
      opacity: 1,
      visible: true,
      x: 0,
      y: 0,
      objects: [
        point(1, SPAWN.PLAYER, def.spawns.player),
        point(2, SPAWN.ENTRY_DOOR, def.spawns.entryDoor),
        point(3, SPAWN.EXIT_DOOR, def.spawns.exitDoor),
      ],
    }
  }

  private static buildGrids(def: LevelDefinition): BuiltGrids {
    const { width: w, height: h } = def
    const fingers: readonly Finger[] = [...def.stalactites, ...def.stalagmites]

    const inRect = (c: number, r: number): boolean =>
      def.rooms.some((rc) => c >= rc.left && c <= rc.right && r >= rc.top && r <= rc.bottom)
    const inFinger = (c: number, r: number): boolean =>
      fingers.some((f) => c >= f.col && c < f.col + f.width && r >= f.top && r <= f.bottom)
    const room = (c: number, r: number): boolean =>
      c >= 0 && c < w && r >= 0 && r < h && inRect(c, r) && !inFinger(c, r)

    const solid = LevelBuilder.autotileWalls(def, room)
    LevelBuilder.addPlanks(def.planks, solid, w)

    const casts = (c: number, r: number): boolean =>
      c >= 0 && c < w && r >= 0 && r < h && solid[r * w + c] !== EMPTY && solid[r * w + c] < TILESET.DECORATIONS.firstgid
    const background = LevelBuilder.autotileShadow(def, room, casts)

    const decorations = new Array<number>(w * h).fill(EMPTY)
    def.decorations.forEach((d) => LevelBuilder.addDecoration(d, decorations, w))

    return { background, decorations, solid }
  }

  private static autotileWalls(def: LevelDefinition, room: (c: number, r: number) => boolean): Grid {
    const { width: w, height: h } = def
    const grid = new Array<number>(w * h).fill(EMPTY)
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        if (room(c, r)) {
          continue
        }
        const u = room(c, r - 1)
        const d = room(c, r + 1)
        const l = room(c - 1, r)
        const rt = room(c + 1, r)
        const orth = Number(u) + Number(d) + Number(l) + Number(rt)
        let tile: number = EMPTY
        if (orth === 1) {
          tile = u ? T.FLOOR : d ? T.CEIL : rt ? T.WALL_L : T.WALL_R
        } else if (orth >= 2) {
          if (u && rt) tile = T.I_UR
          else if (u && l) tile = T.I_UL
          else if (d && rt) tile = T.I_DR
          else if (d && l) tile = T.I_DL
          else tile = T.FLOOR
        } else if (room(c + 1, r + 1)) tile = T.O_TL
        else if (room(c - 1, r + 1)) tile = T.O_TR
        else if (room(c + 1, r - 1)) tile = T.O_BL
        else if (room(c - 1, r - 1)) tile = T.O_BR
        grid[r * w + c] = tile
      }
    }
    return grid
  }

  private static autotileShadow(
    def: LevelDefinition,
    room: (c: number, r: number) => boolean,
    casts: (c: number, r: number) => boolean,
  ): Grid {
    const { width: w, height: h } = def
    const grid = new Array<number>(w * h).fill(EMPTY)
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        if (!room(c, r)) {
          continue
        }
        const u = casts(c, r - 1)
        const d = casts(c, r + 1)
        const l = casts(c - 1, r)
        const rt = casts(c + 1, r)
        let tile: number = T.BG_P
        if (u && l) tile = T.BG_TL
        else if (u && rt) tile = T.BG_TR
        else if (d && l) tile = T.BG_BL
        else if (d && rt) tile = T.BG_BR
        else if (u) tile = T.BG_T
        else if (d) tile = T.BG_B
        else if (l) tile = T.BG_L
        else if (rt) tile = T.BG_R
        else if (casts(c + 1, r + 1)) tile = T.CV_DR
        else if (casts(c - 1, r + 1)) tile = T.CV_DL
        else if (casts(c + 1, r - 1)) tile = T.CV_UR
        else if (casts(c - 1, r - 1)) tile = T.CV_UL
        grid[r * w + c] = tile
      }
    }
    return grid
  }

  private static addPlanks(planks: readonly Plank[], solid: Grid, w: number): void {
    planks.forEach((p) => {
      const caps = p.material === 'brick' ? [T.PLAT_L, T.PLAT_M, T.PLAT_R] : [D.PLANK_L, D.PLANK_M, D.PLANK_R]
      for (let c = p.from; c <= p.to; c++) {
        const tile = c === p.from ? caps[0] : c === p.to ? caps[2] : caps[1]
        solid[p.row * w + c] = tile
      }
    })
  }

  private static addDecoration(d: Decoration, deco: Grid, w: number): void {
    const put = (c: number, r: number, gid: number): void => {
      deco[r * w + c] = gid
    }
    if (d.kind === 'window') {
      put(d.col, d.row, D.WIN_TL)
      put(d.col + 1, d.row, D.WIN_TR)
      put(d.col, d.row + 1, D.WIN_BL)
      put(d.col + 1, d.row + 1, D.WIN_BR)
      put(d.col, d.row + 2, D.BEAM_L)
      put(d.col + 1, d.row + 2, D.BEAM_R)
      return
    }
    put(d.col, d.row, D.FLAG_TOP)
    put(d.col, d.row + 1, D.FLAG_BODY)
    put(d.col, d.row + 2, D.FLAG_TAIL)
  }
}
