# Architecture Patterns

Mandatory code rules for the whole project. The goal is to keep entities decoupled, values
centralized, and the code typed end to end.

---

## TypeScript

- `strict: true` in every `tsconfig.json`.
- **No `any`** without an explicit justifying comment.
- No obvious comments — the code must explain itself.
- Always **complete** files — never snippets with `// rest of the code here`.

## Centralized constants

Every gameplay number lives in `constants/GameConstants.ts`. No magic numbers scattered
through the code.

```typescript
export const PLAYER = {
  SPEED: 160,
  JUMP_VELOCITY: -380,
  ATTACK_DAMAGE: 25,
  MAX_HEALTH: 100,
} as const

export const PIG = {
  SPEED: 80,
  PATROL_DISTANCE: 120,
  ATTACK_DAMAGE: 15,
  MAX_HEALTH: 50,
  DETECTION_RANGE: 200,
} as const

export const PHYSICS = {
  GRAVITY: 500,
} as const
```

## Entity pattern (Game Objects)

Each entity (`Player`, `Enemy`, `Pig`):

- Extends `Phaser.Physics.Arcade.Sprite`.
- Keeps internal state via a simple **State Machine**.
- **Never** accesses another entity directly — only via Phaser events.
- Separates responsibilities into methods: `handleInput()`, `handlePhysics()`,
  `handleAnimation()`, `handleCombat()`.

```typescript
type PlayerState = 'idle' | 'run' | 'jump' | 'fall' | 'attack' | 'hurt' | 'dead'
```

## Entity communication — events only

Accessing another entity directly is forbidden. Use the scene's event emitter:

```typescript
// the source of the effect only emits:
this.scene.events.emit('player:attack', { damage: PLAYER.ATTACK_DAMAGE, x, y })

// whoever reacts listens:
this.scene.events.on('player:attack', this.onPlayerAttack, this)
```

Event name convention: `source:action` (e.g. `player:attack`, `pig:dead`).

## Abstract input

The Player consumes only an `InputState`, without knowing the source (keyboard or touch):

```typescript
interface InputState {
  left: boolean
  right: boolean
  jump: boolean
  attack: boolean
}
```

`InputSystem` is the only layer that knows keyboard/`VirtualControls` and produces the
`InputState`. Swapping the input source does not touch the entities.

## Separation of concerns in Scenes

- `BootScene` — loads assets and shows loading.
- `MenuScene` — start screen / play button.
- `GameScene` — creates entities, initializes systems, runs the loop. **No entity logic.**

## App bridge (Bridge)

`utils/Bridge.ts` centralizes all outbound communication. No-op outside the WebView.

```typescript
export function sendToApp(event: string, payload?: object): void {
  const rnWebView = (window as unknown as { ReactNativeWebView?: { postMessage(msg: string): void } })
    .ReactNativeWebView
  rnWebView?.postMessage(JSON.stringify({ event, payload }))
}
```

Standard events: `game:ready`, `game:over`, `game:score`, `game:pause`.

## Virtual controls

- **HTML** elements overlaid on the canvas — **not** Phaser objects.
- Buttons: left ◀, right ▶, jump, attack.
- **Multi-touch** support (`touchstart`/`touchend`), updating `InputSystem`.

## Vite (game build)

```typescript
// vite.config.ts
export default {
  base: './',                                   // relative paths (required for WebView)
  build: { outDir: '../../app/src/assets/game' } // build goes straight to the RN app
}
```

In production, `vite-plugin-singlefile` generates a self-contained HTML; the post-build step
converts it into `gameHtml.ts` (see [ARCHITECTURE](ARCHITECTURE.md)).

## Git

- Semantic commits: `feat:`, `fix:`, `refactor:`, `chore:`.
- One commit per logical unit of work.
