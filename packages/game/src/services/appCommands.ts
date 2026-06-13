import { dispatchAppCommand } from '@/services/commandBus'
import type { AppCommand } from '@/types/command'

const VALID_COMMANDS: readonly AppCommand[] = ['pause', 'resume']

function isAppCommand(value: unknown): value is AppCommand {
  return typeof value === 'string' && (VALID_COMMANDS as readonly string[]).includes(value)
}

// Expose the inbound channel the native app drives via injectedJavaScript
// (window.__kpCommand). Call once at startup, before any scene subscribes.
export function initAppCommands(): void {
  ;(window as unknown as { __kpCommand?: (command: unknown) => void }).__kpCommand = (command) => {
    if (isAppCommand(command)) {
      dispatchAppCommand(command)
    }
  }
}
