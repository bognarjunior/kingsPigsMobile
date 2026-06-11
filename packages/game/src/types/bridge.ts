export interface ReactNativeWebView {
  postMessage(message: string): void
}

export interface BridgeWindow {
  ReactNativeWebView?: ReactNativeWebView
  // the host platform the app injects before boot ('ios' | 'android' | ...)
  __KP_PLATFORM__?: string
}
