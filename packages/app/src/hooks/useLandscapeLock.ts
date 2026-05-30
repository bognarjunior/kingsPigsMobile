import { useEffect } from 'react'
import * as ScreenOrientation from 'expo-screen-orientation'

export function useLandscapeLock(): void {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {
      // orientation lock is best-effort; ignore unsupported environments
    })

    return () => {
      ScreenOrientation.unlockAsync().catch(() => {})
    }
  }, [])
}
