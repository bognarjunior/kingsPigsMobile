# Best Practices

Mandatory principles and practices, by domain. Complements [CONVENTIONS](CONVENTIONS.md)
(style) and [PATTERNS](PATTERNS.md) (game architecture). Grounded in current references
(see [Sources](#sources)).

---

## 1. General principles (SOLID, DRY, SoC)

- **Single Responsibility** — each class/module/function has **one** reason to change. A
  giant entity doing input + physics + rendering + AI is forbidden; break it apart.
- **Open/Closed** — `Enemy` is a stable base; new enemies (`Pig`, `KingPig`) extend it
  without changing the base.
- **Liskov** — subclasses honor the base contract (a `Pig` is usable wherever an `Enemy` is).
- **Interface Segregation** — small, focused interfaces (`InputState` does not carry things
  the Player does not use).
- **Dependency Inversion** — entities depend on abstractions (`InputState`), not on
  implementations (keyboard/touch).
- **DRY** — zero duplication. Repeated logic becomes a reusable function/behavior/system.
- **KISS / YAGNI** — the simplest solution that satisfies the phase; don't build for an
  imagined future (see per-phase scope in the ROADMAP).
- **Separation of Concerns** — distinct layers: presentation, business logic, orchestration
  (hooks), external world (services). Don't mix them.

## 2. Object orientation in the project

- **Inheritance for entities**: `Phaser.Physics.Arcade.Sprite` → `Enemy` (base) → `Pig`.
- **Composition for behavior**: prefer composing `behaviors`/`systems` over deep hierarchies.
  *Composition over inheritance* when the relationship is not "is-a".
- **Encapsulation**: `private`/`protected` fields; expose via methods. An entity's internal
  state is not touched from outside — only via events.
- **Small, cohesive methods**: `handleInput()`, `handlePhysics()`, `handleAnimation()`,
  `handleCombat()`. No monster method.
- **No scattered mutable global state**; state belongs to its owner.

## 3. TypeScript

- **`strict: true`** always. No `any` (use `unknown` + type guards).
- **Explicit return types** on methods and public functions.
- **`readonly`** for immutable data; `as const` for literals/constants.
- **`enum` forbidden** — string union or `as const` object (better tree-shaking and
  inference).
- **Utility types** (`Pick`, `Omit`, `Partial`, `Record`) instead of redefining shapes.
- **Type guards** to narrow `unknown` (e.g. validating the `onMessage` payload).
- **All types in `types/`** (see CONVENTIONS) — implementation imports, never declares.
- Avoid unnecessary *type assertions* (`as`); prefer real narrowing.

## 4. JavaScript

- `const` by default; `let` only when reassigning; **never `var`**.
- Immutability: don't mutate received arrays/objects — create new ones (`map`, `filter`,
  spread). (In game hot paths, see the performance exception in section 6.)
- `async/await` instead of `.then()` chains; handle errors with `try/catch`.
- Strict equality `===`; avoid implicit coercion.
- Optional chaining `?.` and nullish `??` instead of verbose checks.
- Pure functions whenever possible (same input → same output, no side effects).

## 5. React Native

- **Layers (SoC):** Presentation (JSX) · Business logic (functions/services) · State
  orchestration (custom hooks) · External world (services: storage/API).
- **"Dumb" components**: they only render and wire handlers. **Logic leaves the UI** for
  hooks/services — making it reusable and testable.
- **Custom hooks** for orchestration and state; one hook per responsibility.
- **Services** mediate data (storage/API). Components **never** call `fetch`/`AsyncStorage`
  directly.
- **Function components** only; props typed via `interface` (in `types/`).
- **Conscious memoization**: `useMemo`/`useCallback`/`memo` where there is real cost, not
  reflexively.
- **Lists** with a stable `key`; `FlatList` for long lists (not `map` inside `ScrollView`).
- **No heavy logic in render**; side effects in `useEffect` with correct deps.
- Accessibility and `testID` on interactive elements where applicable.

## 6. Game development (general)

- **Lean game loop**: no memory allocation inside `update()` (no `new`, no temporary
  arrays/objects per frame) — the main cause of FPS drops and GC stutter.
- **Object pooling** for frequently created/destroyed objects (projectiles, particles,
  enemies): reuse instead of create/destroy.
- **State machine** for character behavior instead of `if/else` chains.
- **Delta time**: movement/animation independent of framerate.
- **Data drives the game**: values in constants/config, not hardcoded in logic.
- **Separate data from behavior**: the entity carries state; systems operate on it.

## 7. Phaser 3

- **One Scene per file**, extending `Phaser.Scene`. One entity per file, extending the
  appropriate GameObject.
- **Keep the Scene's `update()` as empty as possible** — delegate to entities/systems.
- **Input at the Scene/System level**, not inside each entity (feeds `InputState`).
- **Keys in constants**: scene, asset, and animation names in `constants/keys.ts` — never a
  loose string literal (avoids silent typos).
- **Object pooling via Groups** (`this.add.group`) for recurring spawns; pre-create in
  `create()` and toggle visibility instead of creating on demand.
- **Event-based communication** (`scene.events` / EventBus) — entities don't reference each
  other.
- **Arcade Physics**: static bodies for scenery, dynamic for actors; `setCollideWorldBounds`
  and well-defined collision groups.
- **Pixel art**: `pixelArt: true`, `roundPixels` when needed, no smoothing.
- **Destroy what you create**: remove listeners and objects on scene change to avoid leaks.
- **Entity `preUpdate`** for its own per-frame logic (instead of bloating the Scene).

---

## Project application (actionable summary)

| Where | Rule |
|-------|------|
| Phaser entity | thin OO shell; behavior in `behaviors/`/`systems/`; private state |
| Per-frame logic | in the entity's `preUpdate`; Scene's `update()` nearly empty |
| Recurring spawns | object pool (Group), never `new` in the loop |
| Input | System → `InputState`; entity consumes the abstraction |
| Types | 100% in `types/`, imported |
| Business logic (app) | hooks + services; component only renders |
| I/O (storage/API) | only in `services/` |
| Key strings | centralized in `constants/` |

## Sources

- [Phaser — bad/best practices (Discourse)](https://phaser.discourse.group/t/what-are-phaser-3-bad-best-practices/5088)
- [Phaser — best practices for managing state](https://phaser.discourse.group/t/best-practices-for-managing-state/6518)
- [Ourcade — State Pattern for Character Movement in Phaser 3](https://blog.ourcade.co/posts/2020/state-pattern-character-movement-phaser-3/)
- [Ourcade — Object Pools in Phaser 3](https://blog.ourcade.co/posts/2020/phaser-3-optimization-object-pool-basic/)
- [Phaser — Game Object Pools Tutorial](https://phaser.io/news/2021/04/game-object-pools-tutorial)
- [Phaser — Using Phaser with TypeScript](https://phaser.io/tutorials/how-to-use-phaser-with-typescript)
- [CheesecakeLabs — React Best Practices: Separation of Concerns](https://cheesecakelabs.com/blog/react-best-practices-in-projects/)
- [How to structure a React App in 2025](https://ramonprata.medium.com/how-to-structure-a-react-app-in-2025-spa-ssr-or-native-10d8de7a245a)
- [Total TypeScript — Where To Put Your Types](https://www.totaltypescript.com/where-to-put-your-types-in-application-code)
- [Onix — How to organize Types and Interfaces](https://www.nodeteam.onix-systems.com/blog/how-to-organize-typescript/)
