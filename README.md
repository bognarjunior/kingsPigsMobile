# Kings and Pigs — Mobile

2D recreation of the platformer **Kings and Pigs** (originally built in GameMaker),
developed with **Phaser 3** and packaged as a **React Native + Expo** app for publishing
on the App Store and Play Store.

The game runs inside a `WebView` in the mobile app, as a self-contained Phaser bundle
loaded offline. Game ↔ app communication happens via `postMessage` / `onMessage`.

Original assets (sprites/tilesets): https://github.com/bognarjunior/KingsAndPigs

---

## Monorepo

```
kingsPigsMobile/
├── packages/
│   ├── game/   ← Phaser 3 + TypeScript + Vite (the game logic)
│   └── app/    ← React Native + Expo (the mobile shell + WebView)
└── docs/       ← architecture, roadmap, and standards
```

| Package | Stack | Responsibility |
|---------|-------|----------------|
| `game`  | Phaser 3, TypeScript, Vite | All gameplay, physics, rendering, input |
| `app`   | Expo, React Native, react-native-webview | Native shell, WebView, event bridge |

## Documentation

- [Code Conventions](docs/CONVENTIONS.md) — names, types, hooks, services, constants
- [Best Practices](docs/BEST_PRACTICES.md) — SOLID/OOP + TS/JS/RN/Phaser
- [Architecture Patterns](docs/PATTERNS.md) — entities, scenes, events, input
- [Architecture](docs/ARCHITECTURE.md) — how the pieces connect
- [Phase Roadmap](docs/ROADMAP.md) — what each phase delivers (1 to 7)
- [Environment](docs/ENVIRONMENT.md) — machine setup and tooling

## Quick start (valid from Phase 1 onward)

```bash
pnpm install

# Game development (browser, hot-reload)
pnpm --filter game dev

# Build the bundle and run it in the mobile app
pnpm --filter game build      # generates the self-contained HTML inside the app
pnpm --filter app start       # opens Expo
```

## Commit convention

Semantic commits in English: `feat:`, `fix:`, `refactor:`, `chore:`.

## Asset license

Sprites and tilesets from the *Pixel Adventure / Kings & Pigs* pack (Pixel Frog), free to use.
