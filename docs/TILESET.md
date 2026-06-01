# Terrain Tileset Mapping

Source: `Kings and Pigs/Sprites/14-TileSets/Terrain (32x32).png` → copied to
`packages/game/src/assets/tiles/terrain.png` and used **whole** as the Phaser tileset.

- Grid: **19 columns × 13 rows**, 32×32 px tiles (≈108 drawn pieces).
- Tiled `firstgid = 1`, so for a cell at `(col, row)`: **`gid = row * 19 + col + 1`**.
- Two map layers: `background` (pink brick, no collision) + `solid` (terrain, collides).
- Orientation rule for borders: **the tan/peach face points INTO the play area**.

## Confirmed pieces (verified in-game)

### Straight borders — from the room frame at cols 1–3, rows 1–3
| Use | Cell (col,row) | gid | Notes |
|-----|----------------|-----|-------|
| **Floor** | (2,1) | 22 | tan faces up (stand on top) |
| **Ceiling** | (2,3) | 60 | tan faces down |
| **Left wall** | (3,2) | 42 | tan faces right (into room) |
| **Right wall** | (1,2) | 40 | tan faces left (into room) |

### Corners — the 2×2 "window" block at cols 7–8, rows 1–2
Each cell of this block is a rounded corner; together they form the window.
| Use | Cell (col,row) | gid |
|-----|----------------|-----|
| **Top-left corner** | (7,1) | 27 |
| **Top-right corner** | (8,1) | 28 |
| **Bottom-left corner** | (7,2) | 46 |
| **Bottom-right corner** | (8,2) | 47 |

### Floating platform — SINGLE row, cols 1–3, row 5
Row 4 above it is **empty/transparent** — never place collidable tiles there
(doing so adds an invisible collision row above the platform).
| Use | Cell (col,row) | gid |
|-----|----------------|-----|
| Platform — left cap / middle / right cap | (1,5)/(2,5)/(3,5) | 97 / 98 / 99 |

### Vertical pillar — 1-wide wall, col 5, rows 1–3
| Use | Cell (col,row) | gid |
|-----|----------------|-----|
| Pillar top / middle / bottom | (5,1)/(5,2)/(5,3) | 26 / 44 / 63 |

### Background (pink brick) — rows 7–11
| Use | Cell (col,row) | gid |
|-----|----------------|-----|
| Plain fill | (2,8) | 155 |

### Background shadow ("sobra") — 9-slice at cols 1–3, rows 7–9
Darkens the pink background where it touches a solid tile. Orthogonal neighbours give
edges + concave corners (used by the room borders).
| Use | Cell (col,row) | gid |
|-----|----------------|-----|
| Top-left / Top / Top-right | (1,7)/(2,7)/(3,7) | 135 / 136 / 137 |
| Left / Plain / Right | (1,8)/(2,8)/(3,8) | 154 / 155 / 156 |
| Bottom-left / Bottom / Bottom-right | (1,9)/(2,9)/(3,9) | 173 / 174 / 175 |

### Convex shadow corners — blob block at cols 7–8, rows 7–8 (VERIFIED in-game)
For shadows that wrap **outside** a protrusion (e.g. a floating platform): the
diagonal background cell uses the blob tile whose dark mass points toward the solid.
| Diagonal cell relative to solid | Cell (col,row) | gid |
|---------------------------------|----------------|-----|
| solid is down-right (dark bottom-right) | (7,7) | 141 |
| solid is down-left (dark bottom-left) | (8,7) | 142 |
| solid is up-right (dark top-right) | (7,8) | 160 |
| solid is up-left (dark top-left) | (8,8) | 161 |

### Convex room corners + concave inner corners (for irregular room contours)
The wall autotiler picks tiles from the **room footprint** (any shape) by counting
which orthogonal/diagonal neighbours are interior:
- Straight edges: floor (2,1), ceiling (2,3), left wall (3,2), right wall (1,2).
- **Convex** room corners (room bulges out — the window block): TL (7,1), TR (8,1),
  BL (7,2), BR (8,2).
- **Concave** inner corners (room wraps a notch — the frame block): tan up-left (1,1),
  up-right (3,1), down-left (1,3), down-right (3,3).

### Vertical pillar — col 5, rows 1–3
Top cap (5,1)=25, shaft (5,2)=44, bottom cap (5,3)=63. **Not used for
stalactites/stalagmites** — those are carved as contour fingers (see below).

---

# Decorations Tileset Mapping

Source: `Kings and Pigs/Sprites/14-TileSets/Decorations (32x32).png` → copied to
`packages/game/src/assets/tiles/decorations.png`, **224×192 = 7 cols × 6 rows**.
Loaded as a **second tileset** with `firstgid = 248` (terrain has 247 tiles), so for a
cell `(col,row)`: **`gid = 248 + row*7 + col`**.

| Use | Cells (col,row) | gids |
|-----|-----------------|------|
| **Window** (2×2 arch) | (2,3)(3,3)/(2,4)(3,4) | 271,272 / 278,279 |
| Window light-beam tiles (below) | (2,5)(3,5) | 285,286 |
| **Flag/banner** — top / body / forked tail / pointed tip | (1,1)/(1,2)/(1,3)/(1,4) | 256/263/270/277 |
| **Plank platform** — left cap / mid / right cap | (2,2)/(3,2)/(4,2) | 264/265/266 |

## Verified technique notes

- **Window light beam**: the cream beam is baked opaque into the window tiles and looks
  like a hard white triangle over the brick. Fix: set the beam pixels' **alpha ≈ 70**
  (script `soften_beam.mjs`) so the decoration layer **blends** over the background brick
  → a soft light shaft. Use the **forked tail (1,3)** for the flag — never stack both tails.
- **Black standardization**: the void / camera background is `COLORS.BACKGROUND = 0x3f3851`,
  which is the terrain's dominant mortar/border dark — so the void and the brick outline
  read as one consistent black.
- **Stalactites / stalagmites are contour fingers, NOT pillars.** Carve a 2-wide (or
  3-wide but **≤ 2 tall**) column out of the room interior; the wall autotiler walls it
  like any edge (solid brick, tan only on the exposed faces, no gaps, never poking
  outside). A 3×3+ block would enclose a centre cell with no fill tile (black hole).
- **Floating platforms** must not cast the brick background shadow (only the room contour
  does). Place planks in open space, clear of walls and fingers, with vertical room.
