import type { AppCommand } from '@/types/command'

// Leaf module that decouples the window entry point the app calls from the active
// scene that reacts to it (no import cycle), mirroring saveBus on the outbound side.
type Listener = (command: AppCommand) => void

let listener: Listener | undefined

export function onAppCommand(callback: Listener | undefined): void {
  listener = callback
}

export function dispatchAppCommand(command: AppCommand): void {
  listener?.(command)
}
