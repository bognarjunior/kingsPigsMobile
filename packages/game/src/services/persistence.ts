import { GAME_EVENT } from '@/constants/events'
import { audioSettings } from '@/services/audioSettings'
import { runProfile } from '@/services/runProfile'
import { onSaveNeeded } from '@/services/saveBus'
import type { SaveData } from '@/types/save'
import { sendToApp } from '@/utils/bridge'

const SAVE_VERSION = 1
const SAVE_DEBOUNCE_MS = 300

let pending: ReturnType<typeof setTimeout> | undefined

// Bind persistence: apply any snapshot the app injected before boot, then forward
// every change (debounced) to the app as a game:save event. Call once at startup,
// before any scene reads the profile or audio settings.
export function initPersistence(): void {
  const injected = (window as unknown as { __KP_SAVE__?: SaveData }).__KP_SAVE__
  if (injected && injected.version === SAVE_VERSION) {
    runProfile.hydrate(injected)
    audioSettings.hydrate(injected.audio)
  }
  onSaveNeeded(scheduleSave)
}

function scheduleSave(): void {
  if (pending !== undefined) {
    return // a save is already queued; one snapshot covers the burst of changes
  }
  pending = setTimeout(() => {
    pending = undefined
    sendToApp(GAME_EVENT.SAVE, snapshot())
  }, SAVE_DEBOUNCE_MS)
}

function snapshot(): SaveData {
  return {
    version: SAVE_VERSION,
    diamonds: runProfile.diamonds,
    lives: runProfile.lives,
    maxHeartBonus: runProfile.maxHeartBonusValue,
    damageBonus: runProfile.damageBonus,
    takenLoot: runProfile.takenLootList,
    audio: {
      track: audioSettings.track,
      musicMuted: audioSettings.musicMuted,
      sfxMuted: audioSettings.sfxMuted,
      musicVolume: audioSettings.musicVolume,
      sfxVolume: audioSettings.sfxVolume,
    },
  }
}
