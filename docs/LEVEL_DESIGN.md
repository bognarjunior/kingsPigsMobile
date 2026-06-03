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

- **Fixed**: `{ type, col, row, patrol }` — exactly like today, just moved into `LevelContent.enemies`.
- **Triggered wave**: a rectangular zone in the level. When the King enters it the first time,
  it spawns its list of pigs once, then disarms.
  ```ts
  interface EnemySpawner { zone: Rect; pigs: EnemyPlacement[]; once: true }
  ```
- 🔸 **OPEN** — what fires a wave: only zone-on-enter, or also "all pigs in the room dead → door
  unlocks / next wave"? (Suggested default: **zone-on-enter, fire once**. Boss arena handled later.)

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
- 🔸 **OPEN (later) — shop catalog & frequency**: what's for sale (raise max heart, full heal, …),
  prices, and whether it opens every level or only at hubs. Revisit when we build the shop.

---

## 5. Hearts / lives

- Hearts heal the King and define the health bar (already built).
- A **heart** is one possible box loot (`Loot.kind = 'heart'`). It **only refills lost hearts**,
  up to the **current** max — it never raises the max.
- **Raising the max heart cap is shop-only (paid with diamonds).** The old rule "auto +1 max every
  10 hearts" is **removed**.

---

## 6. Doors

- The King is **not** auto-pulled in. He stops in front of a door and presses **attack** to enter,
  **only if no pig is within attack range** (otherwise attack = hammer swing).
- **Exit door** → next level. **Entry door** → previous level (he can go back).
- **Level 1 has no "back"**: after the intro (King steps out, door closes), the entry door waits a
  moment and then **disappears**.

---

## 7. Suggested implementation order

1. Door rework (stand-in-front + attack-to-enter, back/forward, level-1 entry door vanish).
2. Consolidate the three registries into `LevelContent`.
3. Breakable boxes + loot (replaces loose pickups); reuse the ammo loop so box pigs throw them.
4. Triggered enemy waves (zone-on-enter).
5. Diamond wallet (persist across levels).
6. Shop scene (catalog/prices — deferred).
7. Boss arena / King Pig (uses waves + door lock).

---

## Open decisions checklist

- [ ] §2 — wave trigger rule (zone-only vs. also clear-room gating) — *revisit at the boss*
- [ ] §4 — shop catalog, prices, and frequency — *deferred, revisit when building the shop*

**Resolved:** box contents authored per box (empty / heart / diamonds); no loose items, all from
boxes; ground boxes double as box-pig ammo and break into loot; hearts only refill (never raise
the max); max heart cap raised only via the shop (auto +1-every-10 rule dropped).
