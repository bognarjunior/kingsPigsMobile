import { type RefObject, useEffect } from 'react'
import { AppState } from 'react-native'
import type { WebView } from 'react-native-webview'

// Drives the game's app -> game pause channel from the OS-level signal: when the
// system backgrounds the app (incoming call, app switcher, control center), tell the
// game to pause so the player resumes on their own terms. Complements the game's own
// in-WebView visibility handling. Resume stays manual, so we never auto-resume here.
const PAUSE_COMMAND = "window.__kpCommand && window.__kpCommand('pause'); true;"

export function useBackgroundPause(ref: RefObject<WebView | null>): void {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        ref.current?.injectJavaScript(PAUSE_COMMAND)
      }
    })
    return () => subscription.remove()
  }, [ref])
}
