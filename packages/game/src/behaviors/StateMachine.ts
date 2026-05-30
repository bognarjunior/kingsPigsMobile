import type { StateHandlers } from '@/types/stateMachine'

export class StateMachine<TState extends string> {
  private readonly states = new Map<TState, StateHandlers>()
  private currentState?: TState

  addState(name: TState, handlers: StateHandlers = {}): this {
    this.states.set(name, handlers)
    return this
  }

  setState(name: TState): void {
    if (this.currentState === name) {
      return
    }

    if (this.currentState !== undefined) {
      this.states.get(this.currentState)?.onExit?.()
    }

    this.currentState = name
    this.states.get(name)?.onEnter?.()
  }

  update(): void {
    if (this.currentState !== undefined) {
      this.states.get(this.currentState)?.onUpdate?.()
    }
  }

  get state(): TState | undefined {
    return this.currentState
  }
}
