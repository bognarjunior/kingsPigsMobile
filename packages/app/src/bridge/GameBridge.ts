import type { GameMessage } from '@/types/bridge'

export interface GameMessageHandlers {
  onSave?: (data: unknown) => void
  onExit?: () => void
}

export function handleGameMessage(raw: string, handlers: GameMessageHandlers = {}): void {
  let message: GameMessage

  try {
    message = JSON.parse(raw) as GameMessage
  } catch (error) {
    console.warn('[bridge] invalid message from game', raw, error)
    return
  }

  switch (message.event) {
    case 'game:save':
      handlers.onSave?.(message.payload)
      return
    case 'game:exit':
      handlers.onExit?.()
      return
    default:
      // Phase 6 will route the rest (over / score / pause) to native features.
      console.log('[bridge] game event:', message.event, message.payload)
  }
}
