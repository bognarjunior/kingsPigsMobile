import { useEffect } from 'react'
import { Platform } from 'react-native'
import * as NavigationBar from 'expo-navigation-bar'

export function useImmersiveMode(): void {
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return
    }

    NavigationBar.setVisibilityAsync('hidden').catch(() => {})
    NavigationBar.setBehaviorAsync('overlay-swipe').catch(() => {})
  }, [])
}
