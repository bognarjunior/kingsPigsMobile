import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'

import { useLandscapeLock } from '@/hooks/useLandscapeLock'
import { GameScreen } from '@/screens/GameScreen'

export default function App() {
  useLandscapeLock()

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <GameScreen />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
})
