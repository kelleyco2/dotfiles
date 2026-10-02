export type MatrixRainMode = 'work' | 'blocked'

declare module 'claude-code' {
  interface PluginState {
    'matrix-rain': { isRaining: boolean; isOff: boolean; height: number }
  }
}
