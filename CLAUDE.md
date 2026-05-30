# CLAUDE.md — Development Contract

> **Read this file before writing or changing any code.**
> It is the operational source of truth for the Kings and Pigs Mobile project.

## Before developing — mandatory checklist

1. Read [docs/CONVENTIONS.md](docs/CONVENTIONS.md) — code conventions (names, types, hooks, services, constants).
2. Read [docs/BEST_PRACTICES.md](docs/BEST_PRACTICES.md) — SOLID/OOP + TS/JS/RN/Phaser best practices.
3. Read [docs/PATTERNS.md](docs/PATTERNS.md) — game architecture patterns (non-negotiable).
4. Check the current phase in [docs/ROADMAP.md](docs/ROADMAP.md) and **do only what the phase asks**.
5. When unsure how the pieces connect, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
6. Setup/tooling: [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md).
7. Raise questions **before** coding. Do not start with open points.

## Non-negotiable rules (summary of PATTERNS.md)

- **TypeScript `strict: true`**. No `any` without a justifying comment.
- **Zero magic numbers** outside `packages/game/src/constants/GameConstants.ts`.
- **Entities never access each other directly** — only via Phaser events
  (`this.scene.events.emit('source:action', ...)`).
- **Abstract input**: entities consume only `InputState`, never keyboard/touch directly.
- **Scenes contain no entity logic** — they only create, wire, and delegate.
- **Entities** extend `Phaser.Physics.Arcade.Sprite`, own a State Machine, and
  separate `handleInput()` / `handlePhysics()` / `handleAnimation()` / `handleCombat()`.
- **Virtual controls** are HTML over the canvas, **not** Phaser objects.
- **Communication with the app** always via `utils/Bridge.ts` (`game:*` events).
- **Always complete files** — never snippets with `// rest of the code here`.
- **No obvious comments** — the code explains itself.
- **English everywhere** — code, comments, commits, and docs are in English.
  Only the live conversation with the user is in pt-BR.
- **Types**: `interface` for objects, `type` for unions, **no `I` prefix**, **no `enum`**.
- **ALL types/interfaces live in `types/`** — never inline in the file; always import.
- **Logic in a dedicated file** — entities/components are thin shells; behavior goes to
  `behaviors`/`systems` (game) or `hooks`/`services` (app). Reuse (DRY).
- **OOP + SOLID**: inheritance for entities (`Enemy`→`Pig`), composition for behavior,
  encapsulation (private fields, access via events).
- **I/O only in `services/`** — components never call `fetch`/`AsyncStorage` directly.
- **Named exports** by default; avoid `export default`.

## Stack decisions (fixed)

- **No backend** for now (API/services conventions defined for the future).
- State in the RN app: **Context API**.
- Persistence: **native via Bridge → AsyncStorage** (the game emits `game:save`/`game:load`,
  the app handles it and uses `storageService`). The game never touches storage directly.

## Per-phase scope — do not anticipate

Each phase brings **only** the assets and code it uses. Do not add animations, enemies,
tilemaps, HUD, or the full bridge before the phase that defines them (see ROADMAP).

## Workspace

- **pnpm** monorepo at the root: `packages/game` (Phaser) and `packages/app` (Expo).
- Per-package commands: `pnpm --filter game <script>` / `pnpm --filter app <script>`.
- The game build produces a single-file HTML → becomes `gameHtml.ts` in the app (see ARCHITECTURE).

## Git

- Semantic commits **in English**: `feat:`, `fix:`, `refactor:`, `chore:`.
- One commit per logical unit. **Do not push without the user asking.**

## Definition of Done (every delivery)

- [ ] Follows all non-negotiable rules above.
- [ ] `tsc` with no errors (strict).
- [ ] No hardcoded values outside `GameConstants.ts`.
- [ ] The phase acceptance criteria (ROADMAP) are met and verified.
