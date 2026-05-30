import { CONTROLS } from '@/constants/GameConstants'

const CONTAINER_ID = 'virtual-controls'

export class VirtualControls {
  private readonly container: HTMLDivElement

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
    dpad.appendChild(this.createButton('◀'))
    dpad.appendChild(this.createButton('▶'))

    const actions = this.createCluster('right')
    actions.appendChild(this.createButton('B'))
    actions.appendChild(this.createButton('A'))

    this.container.appendChild(dpad)
    this.container.appendChild(actions)
    document.body.appendChild(this.container)
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

  private createButton(label: string): HTMLButtonElement {
    const button = document.createElement('button')
    button.textContent = label
    Object.assign(button.style, {
      width: `${CONTROLS.BUTTON_SIZE}px`,
      height: `${CONTROLS.BUTTON_SIZE}px`,
      borderRadius: '50%',
      border: '2px solid rgba(255, 255, 255, 0.6)',
      background: 'rgba(255, 255, 255, 0.18)',
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: '20px',
      fontFamily: 'sans-serif',
      userSelect: 'none',
      touchAction: 'none',
    })
    return button
  }
}
