import type { GameEventName } from '@/constants/events'
import type { BridgeWindow } from '@/types/bridge'

export function sendToApp(event: GameEventName, payload?: object): void {
  const rnWebView = (window as unknown as BridgeWindow).ReactNativeWebView
  rnWebView?.postMessage(JSON.stringify({ event, payload }))
}
