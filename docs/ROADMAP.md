# Development Roadmap

Incremental development across 7 phases. Each phase delivers something verifiable and brings
only the assets it actually uses (avoids the noise of unused files).

> **This is the tracking document.** Check each item when done (`- [ ]` → `- [x]`) and update
> the progress table below. A phase is only considered complete when **all** its items are
> checked and the **acceptance criteria** have been verified **on Android and iOS**.

## Overall progress

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Foundation (monorepo + player + WebView) | 🚧 In progress |
| 2 | Animation and State Machine | ⬜ Not started |
| 3 | Mobile virtual controls | ⬜ Not started |
| 4 | Tilemap / playable level | ⬜ Not started |
| 5 | HUD, collectibles, and progression | ⬜ Not started |
| 6 | Game ↔ app communication | ⬜ Not started |
| 7 | Publishing | ⬜ Not started |

**Legend:** ⬜ not started · 🚧 in progress · ✅ done (acceptance verified on Android+iOS)

---

## Phase 1 — Foundation (current) 🚧

Monorepo + game running + player with basic physics + WebView in the app.

- [x] Directory structure and `pnpm-workspace.yaml`
- [x] `game` package: Phaser 3 + Vite + TypeScript (strict)
- [x] `app` package: Expo initialized
- [x] `BootScene` (loads assets) + `MenuScene` (stub) + `GameScene` (gameplay)
- [x] Player (King Human, static sprite) with keyboard movement: ◀ ▶ jump
- [x] Platform physics: gravity + collision with a **placeholder** ground (static rectangle)
- [x] `InputSystem` abstracting the keyboard into `InputState`
- [x] `GameConstants.ts` with base values (PLAYER, PIG, PHYSICS)
- [x] `VirtualControls.ts` — visible buttons, **no** touch logic yet
- [x] `Bridge.ts` — skeleton (no-op outside the WebView)
- [x] Single-file build → app WebView showing the game

**Acceptance:** `pnpm --filter game dev` shows the King walking/jumping on a platform;
`pnpm --filter game build && pnpm --filter app start` shows the same game in the WebView,
verified **on the Android emulator and the iOS Simulator**.

---

## Phase 2 — Animation and State Machine

- Full slicing of the King spritesheets (Idle, Run, Jump, Fall, Attack, Hit, Dead).
- Refined Player State Machine (`idle | run | jump | fall | attack | hurt | dead`).
- `Pig` enemy with patrol AI (walks between bounds, detects the player).
- `Enemy` as the base class; `Pig` extends it.

## Phase 3 — Mobile virtual controls

- Functional `VirtualControls`: ◀ ▶ jump attack.
- **Multi-touch** (hold a direction + jump/attack simultaneously).
- `touchstart`/`touchend` feeding `InputSystem` (same `InputState` as the keyboard).

## Phase 4 — Tilemap / playable level

- Map built in **Tiled**, imported into Phaser.
- Tilesets from the original repository (terrain, decoration).
- Tile-layer collision replaces the placeholder ground.
- `CameraSystem`: player follow, map bounds, shake.

## Phase 5 — HUD, collectibles, and progression

- `HUD`: health bar, score/diamond counter.
- Collectibles (hearts, diamonds), checkpoint.
- Game over screen and restart flow.

## Phase 6 — Game ↔ app communication

- Full implementation of the `postMessage` / `onMessage` bridge.
- Events: `game:ready`, `game:over`, `game:score`, `game:pause`.
- App reacting (e.g. high score persistence, native pause UI).

## Phase 7 — Publishing

- Icons, splash, orientation, permissions in `app.json`.
- Build via **EAS** (migration from Expo Go to development/production build).
- Preparation and submission to the **App Store** and **Play Store**.

---

## Principles across phases

- Do not anticipate: each phase only brings the assets and code it uses.
- Every phase ends verifiable (explicit acceptance criteria).
- Refactors land when the phase requires them, not "just in case".
