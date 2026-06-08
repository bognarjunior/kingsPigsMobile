import AsyncStorage from '@react-native-async-storage/async-storage'

const SAVE_KEY = 'kp:save'

// Persists the game's save blob. The game owns its shape (it sends the snapshot via
// game:save); the app stores the raw JSON string so it can inject it straight back
// into the WebView before the next boot.
export async function loadSave(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SAVE_KEY)
  } catch (error) {
    console.warn('[storage] failed to load save', error)
    return null
  }
}

export async function saveGame(data: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('[storage] failed to save', error)
  }
}
