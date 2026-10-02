import { describe, expect, mock, test } from 'claude-code/testing'
import type { On, RenderElement } from 'claude-code'
import type { Engine } from 'claude-code/testing'

import { Rain, color } from './rain'

// A seeded random so the simulation is repeatable.
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

describe('simulation', () => {
  test('rains while working, then drains to empty', async () => {
    const rain = new Rain(40, 12, seeded(1))
    rain.addWord('a-long-file-name-to-drain.tsx')
    for (let i = 0; i < 60; i++) rain.step(0.066, 1, true)
    expect(rain.isEmpty).toBe(false)
    // Worst case: a 24-glyph word just entering a 12-row strip clears in 37 rows at 30 rows/s.
    for (let i = 0; i < 20; i++) rain.step(0.066, 1, false)
    expect(rain.isEmpty).toBe(true)
  })

  test('cells are glyph, fg, bg triplets for the whole strip', async () => {
    const rain = new Rain(10, 4, seeded(2))
    for (let i = 0; i < 30; i++) rain.step(0.066, 1, true)
    const cells = rain.cells('work')
    expect(cells.length).toBe(10 * 4 * 3)
    const glyphs = [...cells].filter((_, k) => k % 3 === 0)
    expect(glyphs.some(g => g !== 0x20)).toBe(true)
  })

  test('a word falls reading top to bottom', async () => {
    const rain = new Rain(1, 8, () => 0.01) // always spawn, always pick the word
    rain.addWord('/Users/x/page.tsx'.split('/').pop() ?? '')
    for (let i = 0; i < 40 && rain.cells('work')[7 * 3] === 0x20; i++) rain.step(0.066, 1, true)
    const column = [...rain.cells('work')].filter((_, k) => k % 3 === 0).map(c => String.fromCharCode(c)).join('')
    expect(column.replace(/ /g, '')).toContain('page')
  })

  test('palette stays well under the 1024 color pairs a Raster paints', async () => {
    const seen = new Set<number>()
    for (const mode of ['work', 'blocked'] as const)
      for (const isWord of [true, false])
        for (let len = 1; len <= 30; len++) for (let j = 0; j < len; j++) seen.add(color(mode, j, len, isWord))
    expect(seen.size).toBeLessThan(64)
  })
})

const BAND = {
  plugin: 'matrix-rain',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: true, maxRows: 10, bodyColumns: 60, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

function engine(on: On, store: Record<string, unknown> = {}) {
  mock.store(on, store)
  const clock = mock.clock(on)
  on('session.start', async ($, e) => ({ cwd: e.cwd }))
  on('command.register', async ($, e) => ({ value: { command: e.name } }))
  on('prompt.submit', async ($, e) => ({ text: e.text }))
  on('ui.blit', async () => ({ value: {} }))
  on('ui.render', async ($, e) => h($.ui.resolve(e).Box, {}) as RenderElement)
  return clock
}

const run = ($: Engine, args: string) =>
  $.command.run({ command: 'rain', args, origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 120 } })

async function start($: Engine) {
  await $.session.start({ cwd: '/tmp', surface: 'terminal', isInteractive: true })
}

test('a prompt starts the rain strip; /rain off removes it and is remembered', async ($, on) => {
  const clock = engine(on)
  await start($)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await ui.find({ type: 'Raster' })).toBeUndefined()

  await $.prompt.submit({ text: 'go', wait: false, origin: { kind: 'composer' } })
  await clock.advance(1000)
  expect(await ui.find({ type: 'Raster' })).toBeDefined()

  expect((await run($, 'off')).text).toContain('Rain off')
  expect(await ui.find({ type: 'Raster' })).toBeUndefined()
})

test('a reload mid-rain clears the strip instead of leaving it blank', async ($, on) => {
  const clock = engine(on)
  await start($)
  await $.prompt.submit({ text: 'go', wait: false, origin: { kind: 'composer' } })
  await clock.advance(500)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await ui.find({ type: 'Raster' })).toBeDefined()

  await start($) // session.start fires again on every reload
  expect(await ui.find({ type: 'Raster' })).toBeUndefined()
})

test('/rain off carries into the next session', async ($, on) => {
  const clock = engine(on, { isOff: true })
  await start($)
  await $.prompt.submit({ text: 'go', wait: false, origin: { kind: 'composer' } })
  await clock.advance(1000)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await ui.find({ type: 'Raster' })).toBeUndefined()
})

test('/rain <rows> sets the height, capped by the band slot', async ($, on) => {
  const clock = engine(on)
  await start($)
  await $.prompt.submit({ text: 'go', wait: false, origin: { kind: 'composer' } })
  await clock.advance(500)
  expect((await run($, '30')).text).toContain('30 rows')
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal', props: { ...BAND.props, maxRows: 18 } })
  // 18 rows of room, one of them the gap above the rain.
  expect((await ui.find({ type: 'Raster' }))?.props).toMatchObject({ rows: 17 })
})

test('the spinner hides while it rains and comes back when the rain is off', async ($, on) => {
  const clock = engine(on)
  await start($)
  const SPINNER = { plugin: 'matrix-rain', component: 'Spinner', surface: 'terminal' } as const
  const props = { word: 'Sauteing', message: null, suffix: '\u2026', mode: 'responding' } as const
  await $.prompt.submit({ text: 'go', wait: false, origin: { kind: 'composer' } })
  await clock.advance(500)
  const hidden = await $.ui.mount({ ...SPINNER, props })
  expect(await hidden.find({ type: 'Box' })).toBeDefined()
  expect(await hidden.find({ type: 'Text', text: /Sauteing/ })).toBeUndefined()

  const waiting = await $.ui.mount({ ...SPINNER, props: { ...props, message: 'Waiting for permission' } })
  expect(await waiting.find({ type: 'Box' })).toBeDefined() // the engine stand-in drew, not the hide

  await run($, 'off')
  const back = await $.ui.mount({ ...SPINNER, props })
  expect(back).toBeDefined()
})

test('no strip on surfaces without a Raster', async ($, on) => {
  engine(on)
  await start($)
  await $.prompt.submit({ text: 'go', wait: false, origin: { kind: 'composer' } })
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect(await ui.find({ type: 'Raster' })).toBeUndefined()
})
