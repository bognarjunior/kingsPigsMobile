# Level Design — Content Model

> **Status: implemented content model.** This maps *how a level populates itself*. The
> per-level definition is `LevelContent` in `types/level.ts`. Items still marked **🔸 OPEN**
> are not in the code yet.

## Guiding decisions (agreed)

| Topic | Decision |
|-------|----------|
| Enemies appear | **Mixed**: most are hand-placed and present at level start; a few areas trigger waves. |
| Items come from | **Boxes only**: the King breaks crates (or a box pig throws them) and the loot pops out. No loose items. |
| Diamonds are for | **Currency** for the shop (title menu and in-game pause hub). |
| Doors | King is no longer auto-pulled in; he stands in front and presses **attack** to enter (only when no pig is in attack range). Exit → next level, entry → previous level. |

---

## 1. One content definition per level

One `LevelContent` object per level (`types/level.ts`) holds everything that lives in the room:

```ts
interface LevelContent {
  enemies: EnemySpawn[]
  boxes: BoxPlacement[]
  bombSupply: SpawnTile[]
  cannons: CannonPlacement[]
  boxPigs: EnemySpawn[]
  doorWaves: DoorWave[]
  bosses: KingPigSpawn[]
  safe?: boolean
}
```

Doors stay in the tilemap object layer (`entry_door` / `exit_door`).

Geometry (the room shape) stays where it is — in the tilemap / `LevelDefinition`. This file is
only about *what lives inside* the room.

---

## 2. Enemies — fixed + triggered

- **Fixed**: `{ type, col, row, patrol, tier }` — moved into `LevelContent.enemies`.
- **Two types only**: `pig` (melee) and `thrower`. A thrower is generic: empty-handed it hunts the
  nearest loose ammo of **any** kind (bomb or crate), grabs it, switches to that ammo's carrying
  sprite, throws it, then re-arms. With no ammo (or when cornered) it falls back to **fists** — so
  a thrower is never harmless. Specialising one (bomb-only, box-only) is just a shorter ammo list.
- **Triggered wave**: a `DoorWave` (`EnemySpawn` plus `count`). A door materialises near the King,
  releases that many pigs, then vanishes. The 3-level slice leaves `doorWaves` empty.
- 🔸 **OPEN** — clear-room gating (door stays locked until the room is clear) is not implemented.

---

## 2b. Pig tiers — difficulty by colour

The pig is green in the source art; tiers recolour **only the four skin shades** (eyes/teeth/outline
stay) via a palette swap done **at load time** — one green source in, every colour out, no extra PNGs
shipped (`systems/recolorTexture.ts`, driven by `PIG_TIERS`). Each tier scales health, speed and the
pig's **contact (fist/melee) damage**; thrown bombs/crates keep their own flat damage.

| Tier | Colour | Health (hammer = 25/hit) | Speed | Hit damage |
|------|--------|--------------------------|-------|------------|
| 0 | 🟢 Green | 50 (2 hits) | ×1.0 | 1 heart |
| 1 | ⚪ White | 75 (3) | ×1.1 | 1 |
| 2 | 🔵 Blue | 100 (4) | ×1.2 | 1 |
| 3 | 🔴 Red | 125 (5) | ×1.3 | 2 |
| 4 | ⚫ Gray | 150 (6) | ×1.4 | 2 |

> (Gray replaces a true black, which collided with the purple background.) Numbers live in
> `PIG_TIERS` and are easy to rebalance. A spawn's `tier` defaults to 0.

**Stomp = double damage.** Jumping on a pig's head deals `PIG.STOMP_DAMAGE` = 50 (double a 25 hammer
hit), so a head-stomp is the efficient kill: green dies in 1 stomp, gray in 3 (vs 6 hammer hits).

---

## 3. Boxes & loot

**There are no loose items anymore — everything comes from boxes.** A ground crate is a single
shared object: the King can break it with the hammer, *or* a box pig can pick it up and throw it.
Either way, if it held an item, that item pops out and behaves like a pickup (floats briefly, the
King walks into it to collect).

- **Loot model** — each box declares what it holds (authored per box, not random):
  ```ts
  interface BoxPlacement { col: number; row: number; loot: Loot }
  type Loot =
    | { kind: 'empty' }
    | { kind: 'heart' }
    | { kind: 'diamonds'; amount: number }
  ```
- **King breaks it**: hit by the King's attack (reuse `CombatSystem`). Default: **1 hit = break**.
  On break, spawn the loot (if any).
- **Box pig throws it**: the box on the ground is the box pig's **ammo** — same seek-and-arm loop
  as the bomb pig (`seeksAmmo`). The pig grabs the nearest box, throws it at the King; the crate
  **breaks on impact** and, if it held an item, the item appears where it landed.
- The thrown crate is a projectile that damages the King on a direct hit (like the bomb), then
  breaks. An empty crate just breaks; a loaded one also drops its loot.

> Architecture note: "loose bomb" and "loose box" are the same idea — *grounded ammo a thrower
> seeks and picks up*. The bomb-pig ammo loop generalises to the box pig; the box adds the
> break-into-loot behaviour on top.

---

## 4. Diamonds = currency (shop)

- Diamonds accumulate in a **wallet** that persists across levels and sessions (Bridge → AsyncStorage).
- The shop opens from the **title menu** (permanent upgrades only) and the **in-game pause hub**
  (the same upgrades plus a timed shield). Prices live in `SHOP` and are placeholders.
- Catalog on sale:
  - **+ max health** (`PRICE_MAX_HEART`)
  - **+ attack damage** (`PRICE_DAMAGE`)
  - **extra life** (`PRICE_LIFE`)
  - **shield** (`PRICE_INVULN`, in-game only, `INVULN_MS`)
- Full heal is not sold.

---

## 5. Hearts, lives & death

Two separate resources:

- **Hearts** = health *within* a level (the heart bar). Lost to damage; a **heart** box-loot refills
  them up to the **current** max (never raises it). The max cap grows **only via the shop**
  (diamonds). The old "auto +1 max every 10 hearts" rule is **removed**.
- **Lives** = attempts that span levels and sessions. Hearts hitting **0 → lose one life** and the
  current level restarts with hearts refilled. **0 lives → game over.** Lives are earned/bought and
  **persist** (see §7).

- **Game over** keeps the diamond wallet and purchased upgrades. `resetRun()` refills lives and
  reopens loot.
- **Hearts between levels** refill to the current max when the level scene starts. The shop does
  not sell a full heal.

---

## 6. Doors

- The King is **not** auto-pulled in. He stops in front of a door and presses **attack** to enter,
  **only if no pig is within attack range** (otherwise attack = hammer swing).
- **Exit door** → next level. **Entry door** → previous level (he can go back).
- **Level 1 has no "back"**: after the intro (King steps out, door closes), the entry door waits a
  moment and then **disappears**.

---

## 7. Persistence (the save)

A single persistent **profile** is the player's meta-progression. It survives quitting and
reopening the game. The game emits `game:save`; the app stores it with `storageService`
(AsyncStorage) and injects `window.__KP_SAVE__` before boot. `game:load` is declared but unused.

`SaveData` holds:
- **diamonds**
- **lives**
- **maxHeartBonus** and **damageBonus**
- **takenLoot** (see §8)
- **audio** prefs (track, mute, volume)

Level unlock / progress is not in the save. Changes are debounced, then flushed when the page hides.

---

## 8. Re-entry & anti-farm

Levels can be re-entered (the back door), so loot must not regenerate.

- **Loot is one-time.** Each box/pickup has a stable id (its `col,row` in that level). Once taken,
  it's recorded in the profile; on re-entry that box spawns **already empty** (or not at all). No
  item farming by walking back and forth.
- **Enemies reset.** Re-entering re-spawns the pigs for a fresh fight — that's fine, since beating
  them yields no currency (rewards come only from boxes).
- On build, a box whose loot id is already in the profile spawns **empty**.

---

## 9. Level variety

There is **no fixed enemy quota**. Each level authors its own `enemies` and `boxes` lists
independently, so levels can be heavy, light, **enemy-free (objects only)**, or **box-free**
(pure combat). Difficulty is shaped by counts + tiers + layout, not a global number.

---

## 10. King Pig — the boss (recurring, scaling)

The King Pig is fought **several times**, each encounter **stronger** (higher tier / more health /
more attacks), building to the final fight.

- **L3** hosts one King Pig (`bosses` on `LevelContent`) with its own health bar.
- **Summons**: one wave of two pigs when health drops below half (`atHealthBelow: 0.5`).
- 🔸 **OPEN**: the exit door does not lock until the boss dies. No boss encounters besides L3.

---

## 11. Suggested implementation order

1. ~~Door rework~~ ✅ (stand-in-front + attack-to-enter, back/forward, level-1 entry door vanish).
2. ~~Consolidate registries into `LevelContent`~~ ✅
3. ~~Breakable boxes + loot~~ ✅ · ~~unified thrower~~ ✅ · ~~pig tiers~~ ✅
4. ~~Persistence + anti-farm~~ ✅ (Bridge → AsyncStorage).
5. ~~Lives + death/game-over flow~~ ✅ (§5).
6. ~~Triggered enemy waves~~ ✅ (door waves; unused in the current slice).
7. ~~Shop~~ ✅ (§4).
8. ~~King Pig boss~~ ✅ on L3 (health bar + one summon). Locked arena door still open (§10).

---

## Open decisions checklist

- [x] §2 — door waves (clear-room gating still open)
- [x] §4 — shop catalog and where it opens (prices in `SHOP` are placeholders; no full heal)
- [x] §5 — game over keeps meta-progression; hearts refill at level start
- [ ] §10 — locked boss door; encounters beyond the L3 King Pig

**Resolved:** box contents authored per box (empty / heart / diamonds); no loose items, all from
boxes; ground boxes double as thrower ammo and break into loot; hearts only refill (never raise the
max); max heart cap raised only via the shop. Two resources — hearts (in-level) + lives (persistent).
Re-entry: enemies reset, loot is one-time. No fixed enemy quota per level. One King Pig on L3.
