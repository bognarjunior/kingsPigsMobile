# Development Roadmap

Incremental development across 7 phases. Each phase delivers something verifiable and brings
only the assets it actually uses (avoids the noise of unused files).

> **This is the tracking document.** Check each item when done (`- [ ]` → `- [x]`) and update
> the progress table below. A phase is only considered complete when **all** its items are
> checked and the **acceptance criteria** have been verified **on Android and iOS**.

## Overall progress

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Foundation (monorepo + player + WebView) | ✅ Done |
| 2 | Animation and State Machine | ✅ Done |
| 3 | Mobile virtual controls | ✅ Done |
| 4 | Tilemap / playable level | 🚧 In progress |
| 5 | HUD, collectibles, and progression | ⬜ Not started |
| 6 | Game ↔ app communication | ⬜ Not started |
| 7 | Publishing | ⬜ Not started |

**Legend:** ⬜ not started · 🚧 in progress · ✅ done (acceptance verified on Android+iOS)

---

## Phase 1 — Foundation ✅

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

## Phase 2 — Animation and State Machine ✅

Animated King driven by a state machine, plus the first enemy.

- [x] Copy + normalize the King animation sheets (run/jump/fall/attack/hit/dead)
- [x] Reusable `StateMachine` (behaviors), decoupled from any specific entity
- [x] Player state machine drives animations (`idle | run | jump | fall | attack | hurt | dead`)
- [x] Central animation registration; load all sheets in `BootScene`
- [x] Tighten physics bodies to the sprite's opaque bounds (feet rest on the ground)
- [x] `Enemy` base class; `Pig` (03-Pig) extends it
- [x] `PatrolBehavior` + chase: Pig patrols between bounds and chases within detection range
- [x] No combat yet — attack/hit are animation-only (damage lands in Phase 5)

**Acceptance:** the King plays the right animation per state and lands cleanly on the
ground; the Pig patrols and switches to chasing when the King is in range, facing its
movement direction. Verified on the iOS Simulator and a physical Android device (APK).

---

## Phase 3 — Mobile virtual controls ✅

Make the on-screen controls actually drive the game, with multi-touch.

- [x] Wire `VirtualControls` buttons (◀ ▶ jump attack) via pointer events (touch + mouse)
- [x] Touch source produces an `InputState`; `InputSystem` merges keyboard + touch
- [x] **Multi-touch**: hold a direction while pressing jump/attack at the same time
- [x] Visual pressed/active feedback on each button
- [x] Suppress default touch gestures (scroll, double-tap zoom, long-press) over the canvas
- [x] Immersive fullscreen (hide Android nav/status bars) + responsive resolution that
      fills the screen with no letterbox

**Acceptance:** on the device, holding ◀/▶ moves the King, jump and attack respond, and
direction + action combos register simultaneously — no keyboard needed; the game runs
fullscreen. Verified on a physical Android device (APK).

---

## Phase 4 — Tilemap / playable level

Replace the placeholder ground with a real level and a following camera.

- [ ] Copy + normalize the tileset assets (Terrain 32×32, Decorations 32×32)
- [ ] Build a level in **Tiled** and export it (JSON)
- [ ] Load the tilemap + tilesets in Phaser and render the layers
- [ ] Tile-layer collision replaces the placeholder rectangle ground
- [ ] `CameraSystem`: follow the player, set world/camera bounds, screen shake
- [ ] Spawn the Player and Pig from the map; derive patrol bounds from level geometry

**Acceptance:** a scrollable level with real tile collisions; the camera follows the King
within the map bounds; the King and Pig move over actual geometry. Verified on Android and iOS.

---

## Phase 5 — HUD, collectibles, and progression

Make it a real game loop: fight, collect, lose, retry.

- [ ] Copy + normalize the HUD/collectible assets (lives & coins)
- [ ] `CombatSystem`: the King's attack damages the Pig; the Pig can hurt the King
- [ ] Health for player/enemies; wire the `hurt`/`dead` states to real damage
- [ ] `HUD`: health bar + score/diamond counter
- [ ] Collectibles (diamonds/hearts) with pickup, score, and heal effects
- [ ] Checkpoint + respawn
- [ ] Game over screen and restart flow

**Acceptance:** attacking kills the Pig and the Pig can hurt the King; collecting items
updates the HUD; dying shows game over and restart works. Verified on Android and iOS.

---

## Phase 6 — Game ↔ app communication

Close the loop with the native shell.

- [ ] Emit all bridge events from the game: `game:ready`, `game:over`, `game:score`, `game:pause`
- [ ] `GameBridge` routes typed `onMessage` events to handlers in the app
- [ ] Native persistence via `storageService` (AsyncStorage): high score save/load
- [ ] `game:save` / `game:load` round-trip through the Bridge
- [ ] App → game commands via `injectedJavaScript` (e.g. pause/resume from native)
- [ ] App state via Context API (e.g. high score) wired to the bridge events

**Acceptance:** score and game-over reach the app; the high score persists across app
restarts (AsyncStorage); pausing/resuming from native works. Verified on Android and iOS.

---

## Phase 7 — Publishing

Ship it to the stores.

- [ ] App icon, splash screen, orientation, and permissions in `app.json`
- [ ] Migrate from Expo Go to an **EAS** development build
- [ ] EAS build profiles (development / preview / production)
- [ ] Production build + on-device performance pass (real devices)
- [ ] Store metadata, screenshots, and privacy details
- [ ] Submit to the **App Store** and **Play Store** (EAS Submit)

**Acceptance:** production builds run on real iOS and Android devices and the store
submissions are prepared. Verified on Android and iOS devices.

---

## Principles across phases

- Do not anticipate: each phase only brings the assets and code it uses.
- Every phase ends verifiable (explicit acceptance criteria).
- Refactors land when the phase requires them, not "just in case".
