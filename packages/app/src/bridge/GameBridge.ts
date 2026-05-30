import type { GameMessage } from '@/types/bridge'

export function handleGameMessage(raw: string): void {
  let message: GameMessage

  try {
    message = JSON.parse(raw) as GameMessage
  } catch (error) {
    console.warn('[bridge] invalid message from game', raw, error)
    return
  }

  // Phase 6 routes these events to native features (storage, pause UI, score, etc.).
  console.log('[bridge] game event:', message.event, message.payload)
}
