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
| 4 | Tilemap / playable level | ✅ Done (iOS sim; Pig + shake → Phase 5) |
| 5 | HUD, collectibles, and progression | ✅ Core done (iOS sim); real save → Phase 6 |
| 6 | Game ↔ app communication | ✅ Core done (iOS sim); high-score N/A by design; on-device pass pending |
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

- [x] Copy + normalize the tileset assets (Terrain 32×32) — Decorations deferred (unused so far)
- [x] Build a level and export it (JSON) — authored via a generator script (Tiled-compatible JSON)
- [x] Load the tilemap + tilesets in Phaser and render the layers (`background` + `solid`)
- [x] Tile-layer collision replaces the placeholder rectangle ground
- [x] `CameraSystem`: follow the player, set world/camera bounds — **screen shake deferred to Phase 5**
- [x] Spawn the Player and the doors from the map object layer (`spawns`)
- [x] Entry/exit doors with intro/outro sequence (extra: King exits/enters, `game:level-complete`)

**Scope decisions for this phase:**
- King-only — the **Pig** (spawn + patrol from geometry) is deferred to **Phase 5** (with combat).
- **Screen shake** is deferred to Phase 5, where combat/impacts give it a natural trigger.
- Verified on the **iOS Simulator** only for now (EAS/Android build is Phase 7).

**Acceptance:** a scrollable level with real tile collisions; the camera follows the King
within the map bounds; the King moves over actual geometry. Verified on the iOS Simulator.

---

## Phase 5 — HUD, collectibles, and progression 🚧

Make it a real game loop: fight, collect, lose, retry.

- [x] Copy + normalize the HUD/collectible assets (hearts, live bar; diamonds 🚧)
- [x] `CombatSystem`: the King's attack damages the Pig; the Pig can hurt the King
- [x] Health for player/enemies; wire the `hurt`/`dead` states to real damage
- [x] Basic Pig AI: front vision cone, chase, melee, knockback, stomp/stun, patrol pauses
- [x] `HUD`: health bar (scalable sliced ribbon, 3→10 hearts) — diamond counter 🚧
- [x] Heart pickup: heals + raises the max every 10 hearts; `LEVEL_PICKUPS` registry
- [x] Diamond pickup + score counter on the HUD
- [x] Heart/diamond idle animations (pulse/spin)
- [x] Bomb pig: seek-and-arm ammo loop (hunts a loose bomb, picks it up, throws an
      arcing fused bomb, then re-arms); `Bomb` projectile + `BombItem`
- [x] Breakable loot boxes (replace loose pickups) + unified thrower (bomb **or** box) — `LevelContent`
- [x] Attack-to-enter doors with forward/back navigation (level-1 entry door vanishes)
- [x] Pig difficulty tiers — palette swap green→white→blue→red→gray, scaling HP/speed/damage; stomp = 2×;
      throwers fall back to melee when out of ammo
- [x] Persistence + anti-farm — run profile (diamonds / lives + per-level loot-taken); loot is
      one-time, enemies reset ([LEVEL_DESIGN](LEVEL_DESIGN.md) §7–§8). In-memory for now; real save = Phase 6.
- [x] Lives + death / game-over (hearts→lose a life→retry; 0 lives→game over) (LEVEL_DESIGN §5)
- [x] Cannon hazard — manned by any pig; ballistic ball lands and turns into a bomb
- [x] Box-pig ambush — crate disguised among loot; lunges once, then hatches into a real pig
- [x] **Pig from a door** — triggered appearance (door opens, the needed pigs come out, door vanishes)
- [x] **Triggered enemy waves** (door spawners release waves on trigger) (LEVEL_DESIGN §2)
- [x] **Shop** — spend diamonds on King upgrades (max health, damage, shield, extra life); opens from
      the title menu and the in-game pause hub (LEVEL_DESIGN §4)
- [x] **King Pig boss** — scaling, summons minion waves (LEVEL_DESIGN §10)
- [ ] (polish) cannon's crouched match-pig sprite; box-pig configurable hatch type/tier

> Full system design / decisions map lives in **[docs/LEVEL_DESIGN.md](LEVEL_DESIGN.md)**.

**Acceptance:** attacking kills the Pig and the Pig can hurt the King; collecting items
updates the HUD; dying shows game over and restart works. Verified on the iOS Simulator.

---

## Content & polish — cross-cutting (not yet scheduled)

Gaps that aren't tied to a single phase but are needed for a real game:

- [x] **Audio** — 8-bit SFX (jump, attack, hurt, box break, explosion, pig death,
      pickup, buy) + eight selectable looping music tracks, behind an audio service.
      Music is served as external files via `file://` (kept out of the JS bundle); a
      settings panel (track / mute music+SFX / volume) opens from the menu and in-game.
      Remaining: a door SFX, and persisting audio prefs via the Bridge.
- [ ] **Real level design** — the current levels are **test arrangements**. Author real
      levels (layout + balanced enemy/box/cannon placement) once the systems are stable.
- [x] **Menu / title screen** — title hub with PLAY / SHOP / SETTINGS, a styled audio settings
      panel, and an in-game pause hub; all share one beveled-button look. Later: a "continue".

---

## Phase 6 — Game ↔ app communication

Close the loop with the native shell.

- [x] Emit all bridge events from the game: `game:ready`, `game:over`, `game:score`,
      `game:pause` / `game:resume`, `game:save`, `game:exit`
- [x] `GameBridge` routes typed `onMessage` events to handlers in the app
      (`save` / `exit` / `score` / `pause` / `resume`)
- [x] Native persistence via `storageService` (AsyncStorage): the player **profile**
      (diamonds, lives, upgrades, per-level loot-taken) **+ audio prefs** — see LEVEL_DESIGN §7
- [x] `game:save` / `game:load` round-trip through the Bridge (save event + injected hydration)
- [x] App → game commands via `injectedJavaScript`: `window.__kpCommand` accepts
      `pause`/`resume`; the app sends `pause` on `AppState` background (native interrupt)
- [x] **Auto-pause on interruption** — the game opens the pause hub when backgrounded
      (in-WebView `HIDDEN` + native `AppState`), so the player resumes on their own terms
- [~] App state via Context API (high score): the game emits `game:score` and the app
      routes it, but no high-score UI — diamonds are the persisted currency, so a separate
      score has no home in this design (revisit if a score-based mode is added)

**Acceptance:** score and pause/resume reach the app and the native interrupt pauses the
game; game-over and save round-trip work. Verified on the iOS Simulator; on-device pass pending.

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
