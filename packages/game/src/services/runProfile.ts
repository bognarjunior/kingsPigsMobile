// The player's run profile: progression that must outlive a level (it survives
// scene restarts, level changes and death). Held in memory for now — it resets on
// a full reload. Phase 6 hydrates/saves it through the Bridge (game:load/game:save),
// which is why all access goes through this single service.
import { PLAYER } from '@/constants/GameConstants'

class RunProfile {
  private diamondCount = 0
  private liveCount: number = PLAYER.START_LIVES
  // ids of loot already taken, as `${levelKey}:${col},${row}` — anti-farm: a box
  // the King already opened comes back empty, so re-entering can't re-loot it.
  private readonly takenLoot = new Set<string>()

  get diamonds(): number {
    return this.diamondCount
  }

  addDiamonds(amount: number): void {
    this.diamondCount += amount
  }

  get lives(): number {
    return this.liveCount
  }

  loseLife(): void {
    this.liveCount = Math.max(0, this.liveCount - 1)
  }

  // game over: fresh attempt from the start — lives refilled, loot reopened, but
  // the diamond wallet (meta-progression) is kept.
  resetRun(): void {
    this.liveCount = PLAYER.START_LIVES
    this.takenLoot.clear()
  }

  private lootKey(levelKey: string, id: string): string {
    return `${levelKey}:${id}`
  }

  isLootTaken(levelKey: string, id: string): boolean {
    return this.takenLoot.has(this.lootKey(levelKey, id))
  }

  markLootTaken(levelKey: string, id: string): void {
    this.takenLoot.add(this.lootKey(levelKey, id))
  }
}

export const runProfile = new RunProfile()
