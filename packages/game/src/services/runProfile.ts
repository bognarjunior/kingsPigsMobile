// The player's run profile: progression that must outlive a level (it survives
// scene restarts, level changes and death). Held in memory for now — it resets on
// a full reload. Phase 6 hydrates/saves it through the Bridge (game:load/game:save),
// which is why all access goes through this single service.
import { PLAYER } from '@/constants/GameConstants'

class RunProfile {
  private diamondCount = 0
  private liveCount: number = PLAYER.START_LIVES
  // permanent shop upgrades (kept across game over)
  private maxHeartBonus = 0
  private damageBonusValue = 0
  // ids of loot already taken, as `${levelKey}:${col},${row}` — anti-farm: a box
  // the King already opened comes back empty, so re-entering can't re-loot it.
  private readonly takenLoot = new Set<string>()

  get diamonds(): number {
    return this.diamondCount
  }

  addDiamonds(amount: number): void {
    this.diamondCount += amount
  }

  // shop checkout: deduct the price if affordable
  spend(amount: number): boolean {
    if (this.diamondCount < amount) {
      return false
    }
    this.diamondCount -= amount
    return true
  }

  get lives(): number {
    return this.liveCount
  }

  loseLife(): void {
    this.liveCount = Math.max(0, this.liveCount - 1)
  }

  addLife(): void {
    this.liveCount += 1
  }

  get maxHeartBonusValue(): number {
    return this.maxHeartBonus
  }

  raiseMaxHeartBonus(): void {
    this.maxHeartBonus += 1
  }

  get damageBonus(): number {
    return this.damageBonusValue
  }

  raiseDamageBonus(amount: number): void {
    this.damageBonusValue += amount
  }

  // game over: fresh attempt from the start — lives refilled, loot reopened, but
  // the diamond wallet and purchased upgrades (meta-progression) are kept.
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
