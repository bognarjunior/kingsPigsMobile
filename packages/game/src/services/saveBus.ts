// A tiny decoupling layer: state holders (run profile, audio settings) call
// requestSave() after a change without importing the persistence service, and the
// persistence service registers the listener. Keeps the save trigger dependency-free
// (no import cycle between the singletons and persistence).
type Listener = () => void

let listener: Listener | undefined

export function onSaveNeeded(callback: Listener): void {
  listener = callback
}

export function requestSave(): void {
  listener?.()
}
