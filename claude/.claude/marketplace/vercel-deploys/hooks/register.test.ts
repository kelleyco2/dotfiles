import { describe, expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'
import type { Engine } from 'claude-code/testing'

import { cliToken, deploymentsUrl, finished, headline, parseDeployments, parseRepo, triggersDeploy } from './vercel'

const NOW = 1_800_000_000_000

const api = (deploys: Array<{ uid: string; state: string; target?: string; created: number; ready?: number }>) =>
  JSON.stringify({
    deployments: deploys.map(d => ({
      ...d,
      url: `seraph-${d.uid}.vercel.app`,
      inspectorUrl: `https://vercel.com/x/seraph/${d.uid}`,
      meta: { githubCommitRef: 'main', githubCommitSha: 'abcdef1234', githubCommitMessage: 'ship it\n\nbody' },
    })),
  })

describe('helpers', () => {
  test('reads the repo-root project from repo.json', () => {
    const repo = JSON.stringify({
      projects: [
        { id: 'prj_web', orgId: 'team_1', name: 'web', directory: 'apps/web' },
        { id: 'prj_root', orgId: 'team_1', name: 'root', directory: '.' },
      ],
    })
    expect(parseRepo(repo)).toEqual({ projectId: 'prj_root', orgId: 'team_1', name: 'root' })
    expect(parseRepo('{"projects":[]}')).toBeNull()
  })

  test('parses deployments', async () => {
    const [d] = parseDeployments(api([{ uid: 'a', state: 'READY', target: 'production', created: 1 }]))
    expect(d?.sha).toBe('abcdef1')
    expect(d?.message).toBe('ship it')
    expect(d?.url).toBe('https://seraph-a.vercel.app')
  })

  test('headline shows prod, plus a newer preview', async () => {
    const ds = parseDeployments(
      api([
        { uid: 'p', state: 'READY', target: 'production', created: 10 },
        { uid: 'old', state: 'READY', created: 5 },
      ]),
    )
    expect(headline(ds).map(d => d.uid)).toEqual(['p'])
    const newer = parseDeployments(api([{ uid: 'new', state: 'BUILDING', created: 20 }]))
    expect(headline([...ds, ...newer]).map(d => d.uid)).toEqual(['p', 'new'])
  })

  test('team ids only for teams; expired CLI tokens are ignored', async () => {
    expect(deploymentsUrl('prj', 'team_1')).toContain('teamId=team_1')
    expect(deploymentsUrl('prj', 'user_1')).not.toContain('teamId')
    expect(cliToken(JSON.stringify({ token: 't', expiresAt: 100 }), 200_000)).toBeUndefined()
    expect(cliToken(JSON.stringify({ token: 't', expiresAt: 300 }), 200_000)).toBe('t')
  })

  test('deploy triggers and finished builds', async () => {
    expect(triggersDeploy('git push origin main')).toBe(true)
    expect(triggersDeploy('gh pr merge 12 --squash')).toBe(true)
    expect(triggersDeploy('git status')).toBe(false)
    const before = parseDeployments(api([{ uid: 'a', state: 'BUILDING', created: 1 }]))
    const after = parseDeployments(api([{ uid: 'a', state: 'READY', created: 1, ready: 61_000 }]))
    expect(finished(before, after).map(d => d.uid)).toEqual(['a'])
    expect(finished(after, after)).toEqual([])
  })
})

// A linked repo, a token, and a Vercel API whose answer the test swaps.
function world(on: On, opts: { token?: string; keychain?: string } = { token: 'tok' }) {
  const clock = mock.clock(on, { now: NOW })
  mock.env(on, { HOME: '/h', ...(opts.token ? { VERCEL_TOKEN: opts.token } : {}) })
  const state = { body: api([]), calls: [] as string[], status: undefined as string | undefined, panes: [] as string[], opened: [] as string[] }
  on('session.start', async ($, e) => ({ cwd: e.cwd }))
  // The engine's Bash is not run in tests; the mod only reacts after the call settles.
  on('tool.call', async () => ({ deny: 'not run in tests' }))
  on('session.cwd', async () => ({ value: '/h/Code/seraph' }))
  on('command.register', async ($, e) => ({ value: { command: e.name } }))
  on('process.run', async ($, e) => {
    const cmd = e.argv[0]
    if (cmd === 'open') state.opened.push(e.argv[1] ?? '')
    const out = cmd === 'git' ? '/h/Code/seraph/.git\n' : cmd === 'security' ? (opts.keychain ?? '') : ''
    const code = cmd === 'security' && !opts.keychain ? 44 : 0
    return { value: { exitCode: code, stdout: out, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } }
  })
  on('fs.read', async ($, e) => {
    if (e.path === '/h/Code/seraph/.vercel/project.json')
      return { value: JSON.stringify({ projectId: 'prj_1', orgId: 'team_1', projectName: 'seraph' }) }
    return { deny: 'ENOENT' }
  })
  on('http.fetch', async ($, e) => {
    state.calls.push(e.url)
    return { value: { status: 200, ok: true, headers: {}, text: state.body } }
  })
  on('session.id', async () => ({ value: 'sess-1' }))
  on('fs.write', async ($, e) => {
    if (e.path === '/h/.claude/state/vercel-deploys/sess-1.json') state.status = e.text
    return { value: undefined }
  })
  on('ui.panes', async () => ({
    value: state.panes.map(id => ({ id, title: id, isShown: true, isFocused: true, isPlaced: true })),
  }))
  on('ui.open', async ($, e) => {
    state.panes.push(e.id)
    return { value: { isPlaced: true } }
  })
  on('ui.close', async ($, e) => {
    state.panes = state.panes.filter(id => id !== e.id)
    return { value: undefined }
  })
  const toasts: string[] = []
  on('ui.toast', async ($, e) => {
    toasts.push(e.text)
    return { value: undefined }
  })
  return { clock, state, toasts }
}

async function start($: Engine) {
  await $.session.start({ cwd: '/h/Code/seraph', surface: 'terminal', isInteractive: true })
}

const run = ($: Engine, command: string) =>
  $.command.run({ command, args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 200 } })

const pane = ($: Engine) =>
  $.ui.mount({
    plugin: 'vercel-deploys',
    surface: 'terminal',
    component: 'Pane',
    requestId: 'vercel-deploys',
    props: { title: 'x', isFocused: true, bodyColumns: 52, placement: 'dock', scroll: { offset: 0, bodyRows: 30 }, view: {} },
  })

test('a push starts fast polling, the statusline file tracks the build, and a toast says when it is done', async ($, on) => {
  const { clock, state, toasts } = world(on)
  state.body = api([{ uid: 'p1', state: 'READY', target: 'production', created: NOW - 3_600_000, ready: NOW - 3_500_000 }])
  await start($)
  await clock.settle()
  expect(JSON.parse(state.status ?? '{}')).toEqual({ status: 'ok', prod: 'READY', isBuilding: false })

  state.body = api([
    { uid: 'p2', state: 'BUILDING', target: 'production', created: NOW },
    { uid: 'p1', state: 'READY', target: 'production', created: NOW - 3_600_000, ready: NOW - 3_500_000 },
  ])
  await $.tool.call({ tool: 'Bash', tool_use_id: 't1', command: 'git push origin main' })
  await clock.settle()
  expect(JSON.parse(state.status ?? '{}')).toEqual({ status: 'ok', prod: 'BUILDING', isBuilding: true })

  const callsBefore = state.calls.length
  state.body = api([{ uid: 'p2', state: 'READY', target: 'production', created: NOW, ready: NOW + 90_000 }])
  await clock.advance(10_000)
  expect(state.calls.length).toBe(callsBefore + 1)
  expect(toasts).toEqual(['▲ seraph production: Ready in 2m'])
})

test('/deploys toggles the sidebar; a row opens the deploy in Vercel', async ($, on) => {
  const { clock, state } = world(on)
  state.body = api([
    { uid: 'p1', state: 'READY', target: 'production', created: NOW - 60_000, ready: NOW },
    { uid: 'p0', state: 'ERROR', target: 'production', created: NOW - 120_000 },
  ])
  await start($)
  await clock.settle()

  expect((await run($, 'deploys')).text).toContain('Deploys open')
  expect(state.panes).toEqual(['vercel-deploys'])
  const ui = await pane($)
  expect(await ui.find({ type: 'Text', text: /✕/ })).toBeDefined()
  await ui.press({ key: 'd-p0' })
  expect(state.opened).toEqual(['https://vercel.com/x/seraph/p0'])
  await ui.unmount()

  expect((await run($, 'deploys')).text).toContain('closed')
  expect(state.panes).toEqual([])
})

test('linked repo with no token says so', async ($, on) => {
  const { clock, state } = world(on, {})
  await start($)
  await clock.settle()
  expect(JSON.parse(state.status ?? '{}').status).toBe('missing-token')
})

test('falls back to the Keychain token', async ($, on) => {
  const { clock, state } = world(on, { keychain: 'kc-tok\n' })
  state.body = api([{ uid: 'p1', state: 'READY', target: 'production', created: NOW - 60_000, ready: NOW }])
  await start($)
  await clock.settle()
  expect(JSON.parse(state.status ?? '{}').prod).toBe('READY')
})
