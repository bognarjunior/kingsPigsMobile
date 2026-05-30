# Architecture

## Overview

The project separates **game logic** from the **mobile shell**. The game is a fully
standalone Phaser web app; the Expo app only hosts that game inside a `WebView` and bridges
to native resources.

```
┌─────────────────────────────────────────────────────────┐
│  React Native app (Expo)                                 │
│                                                          │
│   ┌──────────────────────────────────────────────────┐  │
│   │  WebView (react-native-webview)                  │  │
│   │                                                  │  │
│   │   ┌────────────────────────────────────────┐    │  │
│   │   │  Phaser 3 game (self-contained bundle) │    │  │
│   │   │  - Scenes, Entities, Systems           │    │  │
│   │   │  - Canvas + overlaid HTML controls     │    │  │
│   │   └────────────────────────────────────────┘    │  │
│   │            ▲                  │                   │  │
│   └────────────┼──────────────────┼──────────────────┘  │
│   onMessage    │ postMessage      │  injectedJavaScript  │
│   (GameBridge) │ (Bridge.ts)      ▼                      │
│                └──────────► native resources             │
└─────────────────────────────────────────────────────────┘
```

## Why WebView + Phaser (and not pure React Native)?

- Reuses 100% of the Phaser logic across web and mobile — a single game codebase.
- Phaser + Arcade Physics already solve rendering, physics, and pixel-art animation.
- The mobile shell stays thin: just hosting, the event bridge, and store publishing.

Known trade-off: performance and touch latency depend on the WebView. We mitigate with a low
internal resolution (480×270), `pixelArt: true`, and HTML controls (not Phaser objects).

## Build pipeline (game → app)

**Development** (`C`): the WebView points to the Vite dev server (hot-reload). The plain
browser also works for fast logic iteration.

**Production** (`A`): `vite-plugin-singlefile` generates **a single `index.html`** with JS
and assets embedded (base64). A post-build step (`scripts/wrap-html.mjs`) turns that HTML
into a TypeScript module (`gameHtml.ts`) that the app imports and injects into the WebView
via `source={{ html: gameHtml }}`. This guarantees **100% offline** operation in Expo Go,
with no local server and no Metro transformer configuration.

```
packages/game/src  ──vite build──►  index.html (single-file)
                                          │
                              scripts/wrap-html.mjs
                                          ▼
              packages/app/src/assets/game/gameHtml.ts  (export const gameHtml)
                                          │
                                 import in GameScreen.tsx
                                          ▼
                          WebView source={{ html: gameHtml }}
```

## Layers of the `game` package

| Layer | Folder | Responsibility |
|-------|--------|----------------|
| Bootstrap | `main.ts`, `config/` | Instantiates Phaser with the global config |
| Scenes | `scenes/` | Orchestrate the game (Boot, Menu, Game). **No entity logic.** |
| Entities | `entities/` | Game Objects (Player, Enemy, Pig). Own state via State Machine. |
| Systems | `systems/` | Cross-cutting services (Input, Combat, Camera). |
| UI | `ui/` | HUD and virtual controls (HTML over the canvas). |
| Constants | `constants/` | All numeric values of the game. |
| Utils | `utils/` | App bridge (`Bridge.ts`) and helpers. |

### Structural rules

- **Scenes contain no entity logic** — they only create, wire, and delegate.
- **Entities never access each other directly** — communication via Phaser events
  (`this.scene.events.emit(...)` / `.on(...)`).
- **Input is abstract** — entities consume an `InputState`, without knowing whether it came
  from keyboard or touch.
- **Zero magic numbers** outside `constants/GameConstants.ts`.

## Communication bridge (game ↔ app)

**game → app** direction: `utils/Bridge.ts` calls `ReactNativeWebView.postMessage(...)`.
Outside the WebView (e.g. the dev browser), it becomes a silent no-op.

**app → game** direction: `GameBridge.ts` handles `onMessage` and can inject commands via
`injectedJavaScript`.

Planned events (full implementation in Phase 6):

| Event | Direction | When |
|-------|-----------|------|
| `game:ready` | game → app | game loaded and ready |
| `game:over`  | game → app | the player died |
| `game:score` | game → app | score updated |
| `game:pause` | game → app | game paused |

## Phaser config (summary)

- Renderer: `AUTO` (WebGL with Canvas fallback).
- Internal resolution: **480×270**, `Scale.FIT` + centered.
- `pixelArt: true` (no smoothing — crisp pixel art).
- Arcade Physics with gravity from `GameConstants.PHYSICS.GRAVITY`.
- Orientation locked to **landscape** (in the Expo `app.json`).

## Assets

**Source (not versioned as game assets):** the `Kings and Pigs/` folder at the repo root
holds the original sprites (`Sprites/`, `78x58` frames for King Human, `38x28` for King Pig,
`32x32` tilesets...) and the `.aseprite` sources. It is the **raw library**, not consumed
directly by the game.

**Destination (consumed by the game):** `packages/game/public/assets/`. For each phase we
copy **only** the assets it uses, **normalizing names to kebab-case** (no spaces or
parentheses): `Sprites/01-King Human/Idle (78x58).png` → `public/assets/king/idle.png`. The
frame dimensions (78×58) are declared in `BootScene` when loading the spritesheet.

> Rule: never copy the whole folder. Bring assets per phase (see ROADMAP) to avoid unused
> assets in the bundle.
