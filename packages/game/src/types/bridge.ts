export interface ReactNativeWebView {
  postMessage(message: string): void
}

export interface BridgeWindow {
  ReactNativeWebView?: ReactNativeWebView
}
