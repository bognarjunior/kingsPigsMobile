import { CONTROLS } from '@/constants/GameConstants'
import type { InputState, TouchInputSource } from '@/types/input'

const CONTAINER_ID = 'virtual-controls'
const IDLE_BACKGROUND = 'rgba(255, 255, 255, 0.18)'
const ACTIVE_BACKGROUND = 'rgba(255, 255, 255, 0.45)'

type ControlAction = keyof InputState

export class VirtualControls implements TouchInputSource {
  private readonly container: HTMLDivElement
  private readonly state = { left: false, right: false, jump: false, attack: false }

  constructor() {
    this.container = document.createElement('div')
    this.container.id = CONTAINER_ID
    Object.assign(this.container.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: '10',
    })

    const dpad = this.createCluster('left')
    dpad.appendChild(this.createButton('◀', 'left'))
    dpad.appendChild(this.createButton('▶', 'right'))

    const actions = this.createCluster('right')
    actions.appendChild(this.createButton('B', 'attack'))
    actions.appendChild(this.createButton('A', 'jump'))

    this.container.appendChild(dpad)
    this.container.appendChild(actions)
    document.body.appendChild(this.container)
  }

  getState(): InputState {
    return this.state
  }

  destroy(): void {
    this.container.remove()
  }

  private createCluster(side: 'left' | 'right'): HTMLDivElement {
    const cluster = document.createElement('div')
    Object.assign(cluster.style, {
      position: 'absolute',
      bottom: `${CONTROLS.MARGIN}px`,
      [side]: `${CONTROLS.MARGIN}px`,
      display: 'flex',
      gap: `${CONTROLS.GAP}px`,
    })
    return cluster
  }

  private createButton(label: string, action: ControlAction): HTMLButtonElement {
    const button = document.createElement('button')
    button.textContent = label
    Object.assign(button.style, {
      width: `${CONTROLS.BUTTON_SIZE}px`,
      height: `${CONTROLS.BUTTON_SIZE}px`,
      borderRadius: '50%',
      border: '2px solid rgba(255, 255, 255, 0.6)',
      background: IDLE_BACKGROUND,
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: '20px',
      fontFamily: 'sans-serif',
      userSelect: 'none',
      touchAction: 'none',
      pointerEvents: 'auto',
    })

    const press = (event: PointerEvent): void => {
      event.preventDefault()
      this.state[action] = true
      button.style.background = ACTIVE_BACKGROUND
    }

    const release = (event: PointerEvent): void => {
      event.preventDefault()
      this.state[action] = false
      button.style.background = IDLE_BACKGROUND
    }

    button.addEventListener('pointerdown', press)
    button.addEventListener('pointerup', release)
    button.addEventListener('pointercancel', release)
    button.addEventListener('pointerleave', release)
    button.addEventListener('contextmenu', (event) => event.preventDefault())

    return button
  }
}
