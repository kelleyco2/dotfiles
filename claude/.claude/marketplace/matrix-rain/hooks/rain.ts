// The rain simulation: pure, no `$`, so tests can step it with a seeded random.

export type Mode = 'work' | 'blocked'

type Drop = {
  head: number // row of the bright head, fractional; starts above the strip
  speed: number // rows per second
  glyphs: number[] // index 0 is the head, then up the tail
  isWord: boolean
}

const DEFAULT_COLOR = 0x01000000
// Half-width katakana plus digits: the film's alphabet, all width-1 BMP.
const KANA: number[] = []
for (let c = 0xff66; c <= 0xff9d; c++) KANA.push(c)
for (let c = 0x30; c <= 0x39; c++) KANA.push(c)

const LEVELS = 10 // brightness steps down a tail; keeps the palette well under the 1024 pairs

export class Rain {
  columns: number
  rows: number
  private drops: (Drop | null)[]
  private words: string[] = []
  private random: () => number

  constructor(columns: number, rows: number, random: () => number = Math.random) {
    this.columns = columns
    this.rows = rows
    this.random = random
    this.drops = Array.from({ length: columns }, () => null)
  }

  resize(columns: number, rows: number) {
    this.drops = Array.from({ length: columns }, (_, i) => this.drops[i] ?? null)
    this.columns = columns
    this.rows = rows
  }

  // Real work to weave in: file names, commands, patterns. Newest kept, a handful at most.
  addWord(word: string) {
    const clean = [...word].filter(ch => ch >= ' ' && ch <= '~').join('').trim()
    if (clean.length < 2) return
    this.words = [clean.slice(0, 24), ...this.words.filter(w => w !== clean)].slice(0, 8)
  }

  get isEmpty(): boolean {
    return this.drops.every(d => d === null)
  }

  private glyph(): number {
    return KANA[Math.floor(this.random() * KANA.length)] ?? 0x30
  }

  private spawn(intensity: number): Drop {
    const word = this.words.length > 0 && this.random() < 0.35
      ? this.words[Math.floor(this.random() * this.words.length)]
      : undefined
    // A word reads top to bottom, so its last letter leads as the head.
    const glyphs = word
      ? [...word].reverse().map(ch => ch.charCodeAt(0))
      : Array.from({ length: 3 + Math.floor(this.random() * (this.rows + 4)) }, () => this.glyph())
    return {
      head: -1,
      speed: (5 + 17 * intensity) * (0.6 + this.random() * 0.8),
      glyphs,
      isWord: word !== undefined,
    }
  }

  // Advance `dt` seconds. While `isRaining`, empty columns may start a drop; after, the rain drains away.
  step(dt: number, intensity: number, isRaining: boolean) {
    const spawnPerSecond = 0.2 + 0.9 * intensity
    for (let i = 0; i < this.columns; i++) {
      const drop = this.drops[i]
      if (!drop) {
        if (isRaining && this.random() < spawnPerSecond * dt) this.drops[i] = this.spawn(intensity)
        continue
      }
      // Once the turn ends the drops fall at least 30 rows/s, so a 12-row strip clears in about a second.
      drop.head += (isRaining ? drop.speed : Math.max(drop.speed * 3, 30)) * dt
      // Random tails flicker, as in the film; word drops hold still so they stay readable.
      if (!drop.isWord && this.random() < 4 * dt) {
        const k = 1 + Math.floor(this.random() * (drop.glyphs.length - 1))
        drop.glyphs[k] = this.glyph()
      }
      if (drop.head - drop.glyphs.length >= this.rows) this.drops[i] = null
    }
  }

  // Row-major [codePoint, fg, bg] triplets, as a Raster's `cells` wants before base64.
  cells(mode: Mode): Uint32Array {
    const out = new Uint32Array(this.columns * this.rows * 3)
    for (let k = 0; k < this.columns * this.rows; k++) {
      out[k * 3] = 0x20
      out[k * 3 + 1] = DEFAULT_COLOR
      out[k * 3 + 2] = DEFAULT_COLOR
    }
    for (let x = 0; x < this.columns; x++) {
      const drop = this.drops[x]
      if (!drop) continue
      const top = Math.floor(drop.head)
      for (let j = 0; j < drop.glyphs.length; j++) {
        const y = top - j
        if (y < 0 || y >= this.rows) continue
        const k = (y * this.columns + x) * 3
        out[k] = drop.glyphs[j] ?? 0x30
        out[k + 1] = color(mode, j, drop.glyphs.length, drop.isWord)
      }
    }
    return out
  }
}

export function color(mode: Mode, j: number, length: number, isWord: boolean): number {
  if (j === 0) return mode === 'blocked' ? 0xfff2c8 : 0xd8ffe0
  const level = Math.min(LEVELS - 1, Math.floor((j / Math.max(1, length)) * LEVELS))
  const fade = 1 - (level / LEVELS) * 0.85
  if (mode === 'blocked') return (Math.round(255 * fade) << 16) | (Math.round(0xb0 * fade) << 8)
  if (isWord) return (Math.round(0x70 * fade) << 16) | (Math.round(255 * fade) << 8) | Math.round(0xb0 * fade)
  return (Math.round(255 * fade) << 8) | Math.round(0x41 * fade)
}

export function toBase64(cells: Uint32Array): string {
  const bytes = new Uint8Array(cells.buffer, cells.byteOffset, cells.byteLength)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}
