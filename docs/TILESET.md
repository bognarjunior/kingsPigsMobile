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

## TODO (not mapped yet)
- **Background-to-wall shadow ("sobra")**: where the pink background meets a border
  there is a shadowed edge tile (per-side shapes). To be located and added on the
  `background` layer next to the borders.
