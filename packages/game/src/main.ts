import Phaser from 'phaser'

import { gameConfig } from '@/config/GameConfig'
import { initAppCommands } from '@/services/appCommands'
import { initPersistence } from '@/services/persistence'

initPersistence() // apply any injected save + start forwarding changes, before scenes run
initAppCommands() // expose the inbound app → game channel before scenes subscribe

new Phaser.Game(gameConfig)
