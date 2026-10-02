import { describe, expect, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

import { field, pickProject, repos, setField } from './brain'

const page = (next: string, repoList: string, status = 'active') =>
  `---\ntitle: X\ntype: project\nupdated: 2026-09-01\nstatus: ${status}\nnext: ${next}\nrepos: [${repoList}]\n---\n\n## Goal\nBody stays.\n`

describe('helpers', () => {
  test('reads fields and expands repos', async () => {
    const text = page('Ship it: today', '~/Code/homestead, github.com/x/y')
    expect(field(text, 'next')).toBe('Ship it: today')
    expect(repos(text, '/Users/c')).toEqual(['/Users/c/Code/homestead'])
  })

  test('setField rewrites frontmatter only', async () => {
    const out = setField(page('old', '~/Code/a'), 'next', 'new thing')
    expect(field(out, 'next')).toBe('new thing')
    expect(out.endsWith('Body stays.\n')).toBe(true)
  })

  test('pickProject needs a slug when several match', async () => {
    const ps = [{ slug: 'a' }, { slug: 'b' }]
    expect(pickProject(ps, 'b do it')).toEqual({ project: { slug: 'b' }, text: 'do it' })
    expect('error' in pickProject(ps, 'do it')).toBe(true)
    expect(pickProject([{ slug: 'a' }], 'do it')).toEqual({ project: { slug: 'a' }, text: 'do it' })
  })
})

// A fake vault: two active projects on homestead, one paused, one on another repo.
function vault(on: On) {
  const files: Record<string, string> = {
    '/h/brain/projects/irrigation/irrigation.md': page('Get the nadir shot', '~/Code/homestead'),
    '/h/brain/projects/foundry/foundry.md': page('Check iPhone nav', '~/Code/homestead, ~/Code/drops').replace(
      'updated: 2026-09-01',
      'updated: 2026-09-20',
    ),
    '/h/brain/projects/old/old.md': page('nope', '~/Code/homestead', 'paused'),
    '/h/brain/projects/seraph/seraph.md': page('Watch Dax', '~/Code/seraph'),
  }
  const handoffs: string[][] = []
  on('session.start', async ($, e) => ({ cwd: e.cwd }))
  on('command.register', async ($, e) => ({ value: { command: e.name } }))
  on('env.get', async ($, e) => ({ value: e.name === 'HOME' ? '/h' : undefined }))
  on('session.cwd', async () => ({ value: '/h/Code/homestead-feature/src' }))
  on('process.run', async ($, e) => {
    if (e.argv[0] === 'git')
      return { value: { exitCode: 0, stdout: '/h/Code/homestead/.git\n', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
    handoffs.push([...e.argv])
    return { value: { exitCode: 0, stdout: 'synced', stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('fs.list', async () => ({
    value: ['irrigation', 'foundry', 'old', 'seraph'].map(name => ({ name, kind: 'dir' as const, size: 0, mtimeMs: 0, isLink: false })),
  }))
  on('fs.read', async ($, e) => {
    if (!(e.path in files)) throw new Error('ENOENT')
    return { value: files[e.path] ?? '' }
  })
  on('fs.write', async ($, e) => {
    files[e.path] = e.text
    return { value: undefined }
  })
  return { files, handoffs }
}

const run = ($: Engine, command: string, args: string) =>
  $.command.run({ command, args, origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 120 } })

async function start($: Engine) {
  await $.session.start({ cwd: '/h/Code/homestead-feature/src', surface: 'terminal', isInteractive: true })
}

test('/next writes the right page', async ($, on) => {
  const { files } = vault(on)
  await start($)
  const ambiguous = await run($, 'next', 'do a thing')
  expect(ambiguous.text).toContain('Several projects')

  const done = await run($, 'next', 'irrigation Measure the north polygon')
  expect(done.text).toContain('irrigation: next set')
  const irrigation = files['/h/brain/projects/irrigation/irrigation.md'] ?? ''
  expect(field(irrigation, 'next')).toBe('Measure the north polygon')
  expect(field(irrigation, 'updated')).not.toBe('2026-09-01')
  expect(irrigation.endsWith('Body stays.\n')).toBe(true)

  // A paused project and another repo's project never match.
  expect((await run($, 'next', 'old nope')).text).toContain('Several projects')
  expect((await run($, 'next', 'seraph x')).text).toContain('Several projects')

  const dash = await run($, 'next', 'irrigation a — b')
  expect(dash.text).toContain('No em dashes')
})

test('/handoff runs brain handoff', async ($, on) => {
  const { handoffs } = vault(on)
  await start($)
  const out = await run($, 'handoff', 'Wired the band')
  expect(out.text).toContain('handoff done')
  expect(handoffs).toEqual([['/h/brain/bin/brain', 'handoff', 'Wired the band']])
})
