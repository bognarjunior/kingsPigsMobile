import type { GameEventName } from '@/constants/events'
import type { BridgeWindow } from '@/types/bridge'

export function sendToApp(event: GameEventName, payload?: object): void {
  const rnWebView = (window as unknown as BridgeWindow).ReactNativeWebView
  rnWebView?.postMessage(JSON.stringify({ event, payload }))
}

// only Android lets the app close itself on request; iOS forbids a programmatic exit,
// so the title screen hides the EXIT button there instead of offering a dead control
export function canExitApp(): boolean {
  return (window as unknown as BridgeWindow).__KP_PLATFORM__ === 'android'
}
