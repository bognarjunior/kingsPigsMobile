import { StyleSheet, View } from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'

import { gameHtml } from '@/assets/game/gameHtml'
import { handleGameMessage } from '@/bridge/GameBridge'

export function GameScreen() {
  function onMessage(event: WebViewMessageEvent) {
    handleGameMessage(event.nativeEvent.data)
  }

  return (
    <View style={styles.container}>
      <WebView
        style={styles.webview}
        originWhitelist={['*']}
        source={{ html: gameHtml }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        onMessage={onMessage}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
})
