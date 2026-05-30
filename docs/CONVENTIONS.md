# Code Conventions

Prescriptive code style guide. Applies to both packages (`game` and `app`).
For **game architecture** patterns (entities, scenes, events), see [PATTERNS.md](PATTERNS.md).
This is the **how to write**: names, types, hooks, services, constants, imports.

---

## 0. Language

- **All written artifacts are in English**: variable/function/class/type names, file and
  folder names, symbolic constant values, event keys, comments, commit messages, **and the
  documentation** (`docs/`).
- The only thing in pt-BR is the **live conversation** with the team.

```typescript
// good: identifiers and comments in English
const playerSpeed = PLAYER.SPEED // horizontal velocity in px/s

// bad: Portuguese identifiers/comments
const velocidadeJogador = PLAYER.SPEED // velocidade horizontal
```

## 1. Naming

| Element | Convention | Example |
|---------|------------|---------|
| Class / React component | `PascalCase` | `Player`, `GameScreen` |
| Class/component file | `PascalCase.ts(x)` | `Player.ts`, `GameScreen.tsx` |
| Util/hook/service file | `camelCase.ts` | `bridge.ts`, `useGame.ts`, `storageService.ts` |
| Folder | `camelCase` (lowercase) | `entities/`, `systems/`, `services/` |
| Asset | `kebab-case` | `king-idle.png` |
| Function / variable | `camelCase` | `handleInput`, `playerSpeed` |
| Hook | `use` + `PascalCase` | `useGameBridge` |
| Type / Interface | `PascalCase`, **no `I` prefix** | `InputState`, `Player` |
| Component props | `PascalCase` + `Props` | `GameScreenProps` |
| True constant | `SCREAMING_SNAKE_CASE` | `MAX_HEALTH` |
| Constants object | `SCREAMING_SNAKE_CASE` + `as const` | `PLAYER`, `PHYSICS` |
| Event (Phaser / Bridge) | `source:action` (lowercase) | `player:attack`, `game:over` |
| Boolean | `is/has/should/can` prefix | `isGrounded`, `hasKey` |
| Handler | `handle` (internal) / `on` (prop) | `handleAttack`, `onMessage` |
| Enum-like (union) | `PascalCase` for the type | `PlayerState` |

## 2. Types and Interfaces

- **`interface`** for object shapes and component props.
- **`type`** for unions, tuples, utilities, and function types.
- **No `I` prefix**. Always `PascalCase`.
- **`enum` forbidden** — use a string union or an `as const` object.
- **`any` forbidden** without a justifying comment. For unknown input use `unknown` +
  narrowing.
- Prefer `readonly` for immutable data and props.

```typescript
// object → interface
interface InputState {
  left: boolean
  right: boolean
  jump: boolean
  attack: boolean
}

// union → type (instead of enum)
type PlayerState = 'idle' | 'run' | 'jump' | 'fall' | 'attack' | 'hurt' | 'dead'

// props → interface with Props suffix
interface GameScreenProps {
  onGameOver: (score: number) => void
}
```

**Where types live — STRICT RULE:**
- **No inline `type`/`interface` in an implementation file.** Every type definition lives in
  `src/types/`, organized by domain (`types/player.ts`, `types/input.ts`, `types/bridge.ts`,
  `types/components.ts`...).
- Implementation files (classes, components, services) **import** their types — they never
  declare them.
- This applies even to **component props** and **single-use** types: they go to `types/`,
  not in the file.
- Each file in `types/` exports types for a cohesive domain. Name `camelCase.ts`.

```typescript
// types/input.ts
export interface InputState {
  readonly left: boolean
  readonly right: boolean
  readonly jump: boolean
  readonly attack: boolean
}

// types/player.ts
export type PlayerState = 'idle' | 'run' | 'jump' | 'fall' | 'attack' | 'hurt' | 'dead'

// systems/InputSystem.ts  → imports, never declares
import type { InputState } from '@/types/input'
```

## 3. Constants

- Every gameplay number in `packages/game/src/constants/GameConstants.ts`.
- Grouped in `as const` objects, keys in `SCREAMING_SNAKE_CASE`.
- Repeated strings (storage keys, event names) are constants too — **never** a loose string
  literal scattered around.

```typescript
// game/src/constants/GameConstants.ts
export const PLAYER = { SPEED: 160, JUMP_VELOCITY: -380, MAX_HEALTH: 100 } as const

// game/src/constants/events.ts  (centralized event names)
export const GAME_EVENT = {
  READY: 'game:ready',
  OVER: 'game:over',
  SCORE: 'game:score',
  PAUSE: 'game:pause',
  SAVE: 'game:save',
  LOAD: 'game:load',
} as const
export type GameEventName = (typeof GAME_EVENT)[keyof typeof GAME_EVENT]

// app/src/constants/storage.ts  (centralized persistence keys)
export const STORAGE_KEY = {
  HIGH_SCORE: '@kp/high-score',
  PROGRESS: '@kp/progress',
  SETTINGS: '@kp/settings',
} as const
```

> The `game:*` event names are deliberately duplicated between `game` and `app` (separate
> packages). If the list grows, extract a `packages/shared`.

## 4. Per-package folder structure

```
game/src/
├── config/        GameConfig.ts          (Phaser config)
├── constants/     GameConstants.ts, events.ts, keys.ts (asset/scene/anim keys)
├── scenes/        Boot/Menu/Game         (orchestrate; keep update() as empty as possible)
├── entities/      Player, Enemy, Pig     (OO shell; delegate behavior)
├── behaviors/     StateMachine, PatrolBehavior, ... (reusable entity logic)
├── systems/       Input, Combat, Camera  (cross-cutting services)
├── ui/            VirtualControls, HUD
├── utils/         bridge.ts, pure helpers
└── types/         ALL types, by domain (player.ts, input.ts, bridge.ts...)

app/src/
├── screens/       GameScreen.tsx         (presentational; no business logic)
├── components/    reusable components
├── hooks/         useXxx.ts              (orchestration/state — logic lives here)
├── contexts/      XxxContext.tsx         (state via Context API)
├── services/      storageService.ts, (future) httpClient/apiService (all I/O)
├── bridge/        GameBridge.ts          (onMessage handlers)
├── constants/     storage.ts, config.ts
└── types/         ALL types, by domain (bridge.ts, storage.ts, components.ts...)
```

**Logic in a dedicated file (separation of concerns):**
- Entities and components are **thin shells** — they orchestrate, they do not concentrate
  logic.
- Reusable game logic (state machine, AI, combat resolution) → `behaviors/` or `systems/`,
  not inside the entity class.
- App business logic → **custom hooks** (`hooks/`) and **services**, never in the component.
- A component/screen ideally just renders and wires handlers; the "how" lives outside.

## 5. React Native — components and hooks

- **Function components only.** One component per file, same name as the file.
- Declare as `function`, not `const` arrow (better stack traces and hoisting).
- **Named exports** everywhere (components included) — easier grep and refactor.
- Props always typed via `interface XxxProps`.
- Styles with `StyleSheet.create` at the bottom of the file. No inline styles (except dynamic
  values).

```tsx
interface GameScreenProps {
  onGameOver: (score: number) => void
}

export function GameScreen({ onGameOver }: GameScreenProps) {
  // ...
  return <View style={styles.container}>{/* ... */}</View>
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
})
```

**Custom hooks** in `hooks/`, `use` prefix, explicitly typed return:

```typescript
export function useGameBridge(): UseGameBridgeResult {
  // ...
}
```

## 6. State with Context API

Fixed per-context pattern: **single file** with (1) the context, (2) the provider,
(3) the accessor hook that validates usage inside the provider.

```tsx
// contexts/GameContext.tsx
interface GameContextValue {
  score: number
  setScore: (value: number) => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: PropsWithChildren) {
  const [score, setScore] = useState(0)
  const value = useMemo(() => ({ score, setScore }), [score])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within <GameProvider>')
  return ctx
}
```

## 7. Services and API consumption

> **There is no backend now.** This section defines the pattern for when one exists and
> already applies to `storageService` (local persistence).

- All I/O (network, storage) lives in `services/`. **Components never call `fetch`/
  `AsyncStorage` directly** — always through a service.
- One file per domain: `storageService.ts`, `scoreService.ts`, etc.
- `async` functions, typed input and output. `try/catch` at the service boundary.
- Never swallow errors silently — log and/or propagate a typed error.

**Persistence (project decision): native via Bridge → AsyncStorage.**
The game does not access storage; it emits `game:save` / `game:load` through the `Bridge`,
the app handles it in `GameBridge` and uses `storageService`.

```typescript
// app/src/services/storageService.ts
export async function saveHighScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY.HIGH_SCORE, String(score))
  } catch (error) {
    console.error('[storage] failed to save high score', error)
    throw error
  }
}

export async function loadHighScore(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY.HIGH_SCORE)
    return raw ? Number(raw) : 0
  } catch (error) {
    console.error('[storage] failed to load high score', error)
    return 0
  }
}
```

**When a REST API arrives** (future): a single `httpClient.ts` (typed fetch, base URL from
config, centralized error handling) and per-domain services consuming it. No scattered
`fetch`.

## 8. Imports and path alias

- Alias **`@/`** → `src/` in each package (configured in the game's `vite.config.ts` and the
  app's `tsconfig` + Metro).
- Import order: (1) external libs, (2) internal via `@/`, (3) relative. Blank line between
  groups.
- **Named exports** by default. Avoid `export default` (except where the tool requires it,
  e.g. `App.tsx`, Expo config).

```typescript
import Phaser from 'phaser'

import { PLAYER } from '@/constants/GameConstants'
import { InputSystem } from '@/systems/InputSystem'

import type { InputState } from './types'
```

## 9. Async and error handling

- Always `async/await` (never chained `.then().catch()`).
- `try/catch` at the I/O boundary (services), not scattered in the UI.
- Do not use `any` in `catch` — treat it as `unknown` and narrow.

## 10. Formatting / Lint

- **Prettier**: no semicolons, single quotes, 2 spaces, trailing commas, width 100.
- **ESLint** with `typescript-eslint` (strict) — no implicit `any`, no unused variables,
  import ordering.
- Config lands together with the Phase 1 scaffold.
