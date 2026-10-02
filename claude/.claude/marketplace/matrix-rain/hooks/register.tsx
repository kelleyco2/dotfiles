import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, Timer } from 'claude-code'

import { Rain, toBase64 } from './rain'
import type { Mode } from './rain'

// Mounts the strip: true from a prompt until the last drop drains after the turn.
const isRaining = atom({ plugin: 'matrix-rain', key: 'isRaining' } as const, false)
// /rain off, remembered across sessions in $.store.
const isOff = atom({ plugin: 'matrix-rain', key: 'isOff' } as const, false)
// Rows tall, /rain <rows>, remembered too. The band slot caps it at about half the terminal.
const height = atom({ plugin: 'matrix-rain', key: 'height' } as const, 12)

const DEFAULT_ROWS = 12
const MAX_ROWS = 60
const GAP = 1
const FRAME_MS = 66 // about 15 fps: smooth enough for rain, light on CPU
const KEY = 'rain'

// Module state: a hot reload starts it over, which is fine for weather.
const rain = new Rain(80, DEFAULT_ROWS)
let isWorking = false
let mode: Mode = 'work'
let chars = 0 // output characters since the last frame
let rate = 0 // smoothed characters per second
let site: string | undefined // the band's requestId, once drawn
let ticker: Timer | undefined

function intensity(): number {
  return isWorking ? Math.max(0.25, Math.min(1, rate / 300)) : 0.25
}

function stop() {
  ticker?.cancel()
  ticker = undefined
}

function frame($: EngineInterface) {
  const dt = FRAME_MS / 1000
  rate = 0.85 * rate + 0.15 * (chars / dt)
  chars = 0
  rain.step(dt, intensity(), isWorking)
  if (!isWorking && rain.isEmpty) {
    stop()
    void update($, isRaining, () => false)
    return
  }
  if (site) void $.ui.blit({ requestId: site, key: KEY, cells: toBase64(rain.cells(mode)) })
}

async function begin($: EngineInterface) {
  isWorking = true
  mode = 'work'
  if (await read($, isOff)) return
  // Ticker first: setting isRaining redraws at once, and the strip draws only while the ticker runs.
  ticker ??= $.clock.every(FRAME_MS, () => frame($))
  await update($, isRaining, () => true)
}

// Drawing only while the ticker runs: `isRaining` lives in $.state and survives a reload, the ticker does not.
// Both reads run every time: a read is what subscribes the drawing to redraw when the value changes.
async function isShowing($: EngineInterface): Promise<boolean> {
  const raining = await read($, isRaining)
  const off = await read($, isOff)
  return raining && !off && ticker !== undefined
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // Fires again on every reload: clear a strip a reload left mounted mid-rain.
    stop()
    isWorking = false
    await update($, isRaining, () => false)
    await $.command.register({
      name: 'rain',
      description: 'Turn the Matrix rain on or off (remembered across sessions)',
      argumentHint: '[on|off|<rows>]',
      immediate: true,
    })
    const stored = (await $.store.get('isOff').catch(() => false)) === true
    await update($, isOff, () => stored)
    const rows = await $.store.get('height').catch(() => undefined)
    if (typeof rows === 'number') await update($, height, () => rows)

    return next(e)
  })

  on('command.run', { command: 'rain' }, async ($, e) => {
    const arg = e.args.trim()
    if (/^\d+$/.test(arg)) {
      const rows = Math.max(1, Math.min(MAX_ROWS, Number(arg)))
      await $.store.set('height', rows)
      await update($, height, () => rows)
      return { text: `Rain height ${rows} rows (capped at what the space above the prompt allows).` }
    }
    const off = arg === 'off' ? true : arg === 'on' ? false : !(await read($, isOff))
    await $.store.set('isOff', off)
    await update($, isOff, () => off)
    if (off) {
      stop()
      await update($, isRaining, () => false)
    }

    return { text: off ? 'Rain off. /rain on to bring it back.' : 'Rain on. It falls while Claude works.' }
  })

  on('prompt.submit', async ($, e, next) => {
    await begin($)
    return next(e)
  })

  // Output speed drives the rain: count streamed text as it arrives.
  on('turn.step', async function* ($, e, next) {
    const stream = next(e)
    for await (const chunk of stream) {
      if (chunk.kind === 'text' || chunk.kind === 'thinking') {
        chars += chunk.text.length
        mode = 'work'
      }
      yield chunk
    }
    return stream.result
  })

  on('tool.call', async ($, e, next) => {
    const input = e as unknown as Record<string, unknown>
    const path = typeof input.file_path === 'string' ? input.file_path : undefined
    const word =
      path?.split('/').pop() ??
      (typeof input.command === 'string' ? input.command : undefined) ??
      (typeof input.pattern === 'string' ? input.pattern : undefined) ??
      String(e.tool)
    rain.addWord(word)
    // A question for the person holds the turn on them.
    if (String(e.tool) === 'AskUserQuestion') mode = 'blocked'
    const result = await next(e)
    mode = 'work'

    return result
  })

  // A permission prompt is about to wait on the person.
  on('classic.PermissionRequest', async ($, e, next) => {
    mode = 'blocked'
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    isWorking = false
    mode = 'work'
    return next(e)
  })

  // The rain says Claude is working, so the rotating spinner word goes while it shows.
  // A state message (`message`, such as a wait) still draws, as does the spinner when the rain is off.
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (e.surface !== 'terminal' || e.props.message !== null) return next(e)
    if (!(await isShowing($))) return next(e)
    const { Box } = $.ui.resolve(e)

    return <Box />
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.surface !== 'terminal' || e.props.hasSurvey) return next(e)
    if (!(await isShowing($))) return next(e)

    const columns = Math.max(1, Math.min(512, e.props.bodyColumns))
    // One blank row above the rain keeps streamed text off it; the gap counts against the band's room.
    const rows = Math.max(1, Math.min(await read($, height), e.props.maxRows - GAP))
    if (columns !== rain.columns || rows !== rain.rows) rain.resize(columns, rows)
    site = e.requestId
    const { Box, Raster } = $.ui.resolve(e)

    return (
      <Box flexDirection="column" marginTop={GAP}>
        <Raster key={KEY} columns={columns} rows={rows} cells={toBase64(rain.cells(mode))} />
      </Box>
    )
  })
}
