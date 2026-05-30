export interface InputState {
  readonly left: boolean
  readonly right: boolean
  readonly jump: boolean
  readonly attack: boolean
}

export interface TouchInputSource {
  getState(): InputState
}
