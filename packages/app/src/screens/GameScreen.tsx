import { Asset } from 'expo-asset'
import { Directory, File, Paths } from 'expo-file-system'
import { useEffect, useState } from 'react'
import { ActivityIndicator, BackHandler, Platform, StyleSheet, View } from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'

import { gameAudio } from '@/assets/game/gameAudio'
import { gameHtml } from '@/assets/game/gameHtml'
import { handleGameMessage } from '@/bridge/GameBridge'
import { loadSave, saveGame } from '@/services/storageService'

// Close the app when the game asks to exit. Only Android allows a deliberate exit;
// iOS forbids quitting programmatically, so the request is a no-op there.
function exitApp(): void {
  if (Platform.OS === 'android') {
    BackHandler.exitApp()
  }
}

// Write the built game to disk and serve it over file:// so the WebView can load
// the music as separate sibling files (kept out of the inlined HTML to keep the
// JS bundle small). Sprites/SFX stay inlined in the HTML.
async function prepareGame(): Promise<string> {
  const dir = new Directory(Paths.cache, 'game')
  if (!dir.exists) {
    dir.create()
  }
  const audioDir = new Directory(dir, 'audio')
  if (!audioDir.exists) {
    audioDir.create()
  }

  const index = new File(dir, 'index.html')
  if (index.exists) {
    index.delete()
  }
  index.write(gameHtml)

  for (const [name, mod] of Object.entries(gameAudio)) {
    const dest = new File(audioDir, name)
    if (dest.exists) {
      continue // bundled music already copied (cache persists between launches)
    }
    const asset = Asset.fromModule(mod)
    await asset.downloadAsync()
    if (asset.localUri) {
      new File(asset.localUri).copySync(dest)
    }
  }

  return index.uri
}

export function GameScreen() {
  const [ready, setReady] = useState<{ uri: string; save: string | null } | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([prepareGame(), loadSave()])
      .then(([uri, save]) => {
        if (active) {
          setReady({ uri, save })
        }
      })
      .catch((error) => console.error('[game] failed to prepare files', error))
    return () => {
      active = false
    }
  }, [])

  function onMessage(event: WebViewMessageEvent) {
    handleGameMessage(event.nativeEvent.data, { onSave: saveGame, onExit: exitApp })
  }

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#ffffff" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <WebView
        style={styles.webview}
        originWhitelist={['*']}
        injectedJavaScriptBeforeContentLoaded={`window.__KP_SAVE__ = ${ready.save ?? 'null'}; true;`}
        source={{ uri: ready.uri }}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        allowingReadAccessToURL={Paths.cache.uri}
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
  loading: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
})
