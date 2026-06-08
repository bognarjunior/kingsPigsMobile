import Phaser from 'phaser'

import { gameConfig } from '@/config/GameConfig'
import { initPersistence } from '@/services/persistence'

initPersistence() // apply any injected save + start forwarding changes, before scenes run

new Phaser.Game(gameConfig)
