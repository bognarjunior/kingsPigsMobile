# Level Design — Content Model

> **Status: DRAFT for review.** This maps *how a level populates itself* — enemies, items,
> rewards, doors — so placement stops being ad-hoc. Items marked **🔸 OPEN** still need a
> decision before implementation. Once agreed, this becomes the source of truth and the
> scattered registries (`LEVEL_ENEMIES`, `LEVEL_PICKUPS`, `LEVEL_BOMB_SUPPLY`) collapse into
> a single per-level content definition.

## Guiding decisions (agreed)

| Topic | Decision |
|-------|----------|
| Enemies appear | **Mixed**: most are hand-placed and present at level start; a few areas trigger waves. |
| Items come from | **Boxes only**: the King breaks crates (or a box pig throws them) and the loot pops out. No loose items. |
| Diamonds are for | **Currency** for a shop — but the shop is **deferred**; for now diamonds just accumulate. |
| Doors | King is no longer auto-pulled in; he stands in front and presses **attack** to enter (only when no pig is in attack range). Exit → next level, entry → previous level. |

---

## 1. One content definition per level

Today content is spread across three registries. Proposal: a single `LevelContent` object per
level, so everything a level contains lives in one place.

```ts
// types/content.ts (sketch — for discussion)
interface LevelContent {
  enemies: EnemyPlacement[]   // fixed pigs present from the start
  spawners: EnemySpawner[]    // trigger zones that release a wave once
  boxes: BoxPlacement[]       // breakable crates holding loot
  // doors stay in the tilemap object layer (entry_door / exit_door)
}
```

Geometry (the room shape) stays where it is — in the tilemap / `LevelDefinition`. This file is
only about *what lives inside* the room.

---

## 2. Enemies — fixed + triggered

- **Fixed**: `{ type, col, row, patrol, tier }` — moved into `LevelContent.enemies`.
- **Two types only**: `pig` (melee) and `thrower`. A thrower is generic: empty-handed it hunts the
  nearest loose ammo of **any** kind (bomb or crate), grabs it, switches to that ammo's carrying
  sprite, throws it, then re-arms. With no ammo (or when cornered) it falls back to **fists** — so
  a thrower is never harmless. Specialising one (bomb-only, box-only) is just a shorter ammo list.
- **Triggered wave**: a rectangular zone in the level. When the King enters it the first time,
  it spawns its list of pigs once, then disarms.
  ```ts
  interface EnemySpawner { zone: Rect; pigs: EnemyPlacement[]; once: true }
  ```
- 🔸 **OPEN** — what fires a wave: only zone-on-enter, or also "all pigs in the room dead → door
  unlocks / next wave"? (Suggested default: **zone-on-enter, fire once**. Boss arena handled later.)

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

## 4. Diamonds = currency (shop deferred)

- Diamonds collected accumulate into a **wallet** that persists **across levels within a run**
  (and later across sessions via the Bridge → AsyncStorage, in Phase 6).
- They are spent in a **shop** — but the **shop is deferred**. For now diamonds only accumulate
  and show on the HUD; the spending screen comes later.
- 🔸 **OPEN (later) — shop catalog & frequency**: prices and whether it opens every level or only at
  hubs. Revisit when we build the shop. Planned King upgrades to sell:
  - **+ max health** (raise the heart cap — the only way to grow it)
  - **+ attack damage** (King hits harder)
  - **invulnerability** (a temporary shield / longer i-frames)
  - **extra life** (top up the lives counter from §5)
  - full heal / refill hearts

---

## 5. Hearts, lives & death

Two separate resources:

- **Hearts** = health *within* a level (the heart bar). Lost to damage; a **heart** box-loot refills
  them up to the **current** max (never raises it). The max cap grows **only via the shop**
  (diamonds). The old "auto +1 max every 10 hearts" rule is **removed**.
- **Lives** = attempts that span levels and sessions. Hearts hitting **0 → lose one life** and the
  current level restarts with hearts refilled. **0 lives → game over.** Lives are earned/bought and
  **persist** (see §7).

- 🔸 **OPEN — game over cost**: does game over keep the persistent profile (diamonds/upgrades) and
  just send you back to the start/hub, or wipe the run? (Lean: keep the meta-profile; restart the
  run. Decide when we build the death/game-over flow.)
- 🔸 **OPEN — hearts between levels**: refill to full on each new level, or carry the current hearts
  over? (Lean: refill to full at level start; the shop sells an extra full-heal.)

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
reopening the game — written through the Bridge → `storageService` (AsyncStorage), per CLAUDE.md;
the game emits `game:save` / `game:load`, the app does the I/O. (Real wiring lands with the Bridge,
**Phase 6**; until then a run-only in-memory profile stands in and resets on reload.)

The profile holds:
- **diamonds** wallet (currency)
- **lives** counter (§5)
- **upgrades** bought (max hearts, attack damage, …)
- **per-level loot taken** — which boxes are already opened / pickups collected (see §8)
- **progress** — levels reached / unlocked

Saved on key events (level complete, purchase, life lost); loaded on boot.

---

## 8. Re-entry & anti-farm

Levels can be re-entered (the back door), so loot must not regenerate.

- **Loot is one-time.** Each box/pickup has a stable id (its `col,row` in that level). Once taken,
  it's recorded in the profile; on re-entry that box spawns **already empty** (or not at all). No
  item farming by walking back and forth.
- **Enemies reset.** Re-entering re-spawns the pigs for a fresh fight — that's fine, since beating
  them yields no currency (rewards come only from boxes).
- Mechanically: today entering a door does `scene.restart`, which rebuilds everything. The change
  is to **filter out already-taken loot** from `LevelContent.boxes` using the profile on build.

---

## 9. Level variety

There is **no fixed enemy quota**. Each level authors its own `enemies` and `boxes` lists
independently, so levels can be heavy, light, **enemy-free (objects only)**, or **box-free**
(pure combat). Difficulty is shaped by counts + tiers + layout, not a global number.

---

## 10. King Pig — the boss (recurring, scaling)

The King Pig is fought **several times**, each encounter **stronger** (higher tier / more health /
more attacks), building to the final fight.

- **Arena**: a locked room — the door **locks until the boss is beaten** (this is the "clear-room
  gating" variant of §2's trigger). 
- **Health bar** of its own (multi-hit), separate from the regular pigs.
- **Summons waves**: during the fight it can trigger waves of coloured tier pigs (§2 + §2b).
- 🔸 **OPEN**: the schedule (which levels host a boss), the boss's own moveset/attacks, its sprite
  sheet, and how much it scales per encounter. Design these when we build the first boss.

---

## 11. Suggested implementation order

1. ~~Door rework~~ ✅ (stand-in-front + attack-to-enter, back/forward, level-1 entry door vanish).
2. ~~Consolidate registries into `LevelContent`~~ ✅
3. ~~Breakable boxes + loot~~ ✅ · ~~unified thrower~~ ✅ · ~~pig tiers~~ ✅
4. **Persistence + anti-farm** (profile: diamonds/lives/upgrades + per-level loot-taken). Foundation
   for everything below — even though the real AsyncStorage wiring waits for the Bridge (Phase 6).
5. Lives + death/game-over flow (§5).
6. Triggered enemy waves (zone-on-enter, §2).
7. Shop scene (spends diamonds on §4 upgrades — catalog still open).
8. King Pig boss — recurring & scaling (§10).

---

## Open decisions checklist

- [ ] §2 — wave trigger rule for non-boss rooms (zone-only vs. clear-room gating)
- [ ] §4 — shop catalog, prices, and frequency — *deferred, revisit when building the shop*
- [ ] §5 — game-over cost; hearts refill-vs-carry between levels
- [ ] §10 — boss schedule, moveset, sprite, per-encounter scaling

**Resolved:** box contents authored per box (empty / heart / diamonds); no loose items, all from
boxes; ground boxes double as thrower ammo and break into loot; hearts only refill (never raise the
max); max heart cap raised only via the shop. Two resources — hearts (in-level) + lives (persistent).
Re-entry: enemies reset, loot is one-time. No fixed enemy quota per level. Boss recurs and scales.
