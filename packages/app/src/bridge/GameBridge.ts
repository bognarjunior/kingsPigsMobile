import type { GameMessage } from '@/types/bridge'

export interface GameMessageHandlers {
  onSave?: (data: unknown) => void
  onExit?: () => void
  onScore?: (payload: unknown) => void
  onPause?: () => void
  onResume?: () => void
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
    case 'game:score':
      handlers.onScore?.(message.payload)
      return
    case 'game:pause':
      handlers.onPause?.()
      return
    case 'game:resume':
      handlers.onResume?.()
      return
    default:
      console.log('[bridge] game event:', message.event, message.payload)
  }
}
