export type MusicTrack =
  | 'original'
  | 'epic'
  | 'metal'
  | 'medieval'
  | 'whistler'
  | 'whistler-short'
  | 'minstrels'
  | 'exploration'

// one selectable music track: its id, the Phaser sound key, the file loaded at
// boot (relative to index.html), and the player-facing name in the settings panel.
export interface MusicTrackInfo {
  readonly id: MusicTrack
  readonly key: string
  readonly file: string
  readonly label: string
}
