import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, Timer } from 'claude-code'

import type { VercelDeploysDeploy, VercelDeploysStatus } from '../types'
import {
  ACTIVE,
  ago,
  cliToken,
  deploymentsUrl,
  finished,
  parseDeployments,
  parseProject,
  parseRepo,
  triggersDeploy,
} from './vercel'

const project = atom({ plugin: 'vercel-deploys', key: 'project' } as const, '')
const status = atom({ plugin: 'vercel-deploys', key: 'status' } as const, 'unlinked' as VercelDeploysStatus)
const error = atom({ plugin: 'vercel-deploys', key: 'error' } as const, '')
const deploys = atom({ plugin: 'vercel-deploys', key: 'deploys' } as const, [] as VercelDeploysDeploy[])
const checkedAt = atom({ plugin: 'vercel-deploys', key: 'checkedAt' } as const, 0)

const IDLE_MS = 60_000
const FAST_MS = 10_000
// A push takes a few seconds to become a deployment; keep polling fast while we wait for it.
const WATCH_MS = 3 * 60_000
const PANE = 'vercel-deploys'
const PANE_COLUMNS = 52

const STATE: Record<string, { mark: string; label: string; color: string }> = {
  READY: { mark: '●', label: 'Ready', color: 'success' },
  ERROR: { mark: '✕', label: 'Error', color: 'error' },
  CANCELED: { mark: '○', label: 'Canceled', color: 'inactive' },
  BUILDING: { mark: '◐', label: 'Building', color: 'warning' },
  INITIALIZING: { mark: '◐', label: 'Starting', color: 'warning' },
  QUEUED: { mark: '◌', label: 'Queued', color: 'warning' },
}

type Link = { projectId: string; orgId: string; name: string }

// Module state: a reload rediscovers both on session.start.
let link: Link | null = null
let timer: Timer | undefined
let watchUntil = 0

async function gitPath($: EngineInterface, flag: string): Promise<string> {
  const run = await $.process.run(['git', 'rev-parse', '--path-format=absolute', flag]).catch(() => undefined)
  return run?.exitCode === 0 ? run.stdout.trim() : ''
}

// `.vercel/` is gitignored, so a worktree usually lacks it: fall back to the main checkout.
async function findLink($: EngineInterface): Promise<Link | null> {
  const cwd = await $.session.cwd()
  const top = await gitPath($, '--show-toplevel')
  const common = await gitPath($, '--git-common-dir')
  const main = common.endsWith('/.git') ? common.slice(0, -'/.git'.length) : ''
  for (const dir of [cwd, top, main]) {
    if (!dir) continue
    const text = await $.fs.read(`${dir}/.vercel/project.json`).catch(() => '')
    const parsed = text ? parseProject(text) : null
    if (parsed) return parsed
    const repo = await $.fs.read(`${dir}/.vercel/repo.json`).catch(() => '')
    const fromRepo = repo ? parseRepo(repo) : null
    if (fromRepo) return fromRepo
  }
  return null
}

async function token($: EngineInterface): Promise<string | undefined> {
  const env = await $.env.get('VERCEL_TOKEN')
  if (env) return env
  // Kept in the login Keychain so the token never lands in dotfiles.
  const keychain = await $.process
    .run(['security', 'find-generic-password', '-s', 'vercel-token', '-w'])
    .catch(() => undefined)
  if (keychain?.exitCode === 0 && keychain.stdout.trim()) return keychain.stdout.trim()
  const home = (await $.env.get('HOME')) ?? ''
  const auth = await $.fs.read(`${home}/Library/Application Support/com.vercel.cli/auth.json`).catch(() => '')
  return auth ? cliToken(auth, await $.clock.now()) : undefined
}

async function refresh($: EngineInterface): Promise<void> {
  if (!link) return
  const bearer = await token($)
  if (!bearer) {
    await update($, status, () => 'missing-token' as const)
    return
  }

  const res = await $.http
    .fetch(deploymentsUrl(link.projectId, link.orgId), { headers: { Authorization: `Bearer ${bearer}` } })
    .catch((err: unknown) => ({ ok: false, status: 0, text: String(err), headers: {} }))
  const at = await $.clock.now()
  await update($, checkedAt, () => at)

  if (!res.ok) {
    const why = res.status === 401 || res.status === 403 ? 'token rejected' : `HTTP ${res.status || 'error'}`
    await update($, status, () => 'error' as const)
    await update($, error, () => why)
    return
  }

  const before = await read($, deploys)
  const after = parseDeployments(res.text)
  await update($, deploys, () => after)
  await update($, status, () => 'ok' as const)
  await update($, error, () => '')

  for (const d of finished(before, after)) {
    const s = STATE[d.state]?.label ?? d.state
    const took = d.readyAt ? ` in ${ago(d.readyAt - d.createdAt)}` : ''
    $.ui.toast(`▲ ${link.name} ${d.target}: ${s}${took}`)
  }
}

// One self-rescheduling timer: fast while something builds or a push is pending, slow otherwise.
async function schedule($: EngineInterface): Promise<void> {
  timer?.cancel()
  const now = await $.clock.now()
  const isBusy = now < watchUntil || (await read($, deploys)).some(d => ACTIVE.has(d.state))
  timer = $.clock.after(isBusy ? FAST_MS : IDLE_MS, () => {
    void refresh($).finally(() => schedule($))
  })
}

async function kick($: EngineInterface): Promise<void> {
  await refresh($)
  await pin($)
  await schedule($)
}

function line(d: VercelDeploysDeploy, now: number) {
  const s = STATE[d.state] ?? { mark: '?', label: d.state, color: 'inactive' }
  const age = ACTIVE.has(d.state) ? ago(now - d.createdAt) : `${ago(now - (d.readyAt ?? d.createdAt))} ago`
  return { s, age }
}

// The status bar is Cooper's own statusline.js, so hand it a tiny file to draw rather than
// pinning a line of our own above it. Keyed by session so parallel sessions don't clash.
async function stateFile($: EngineInterface): Promise<string> {
  const home = (await $.env.get('HOME')) ?? ''
  return `${home}/.claude/state/vercel-deploys/${await $.session.id()}.json`
}

async function pin($: EngineInterface): Promise<void> {
  const file = await stateFile($)
  const st = await read($, status)
  const list = await read($, deploys)
  const prod = list.find(d => d.target === 'production')
  const summary = {
    status: st,
    prod: prod?.state ?? '',
    isBuilding: list.some(d => ACTIVE.has(d.state)),
  }
  await $.process.run(['mkdir', '-p', file.slice(0, file.lastIndexOf('/'))]).catch(() => undefined)
  await $.fs.write(file, JSON.stringify(summary)).catch(() => undefined)
}

async function toggle($: EngineInterface): Promise<string> {
  const isUp = (await $.ui.panes()).some(p => p.id === PANE)
  if (isUp) {
    await $.ui.close({ id: PANE })
    return 'Deploys closed.'
  }
  await $.ui.open({ id: PANE, title: `▲ ${link?.name ?? 'Deploys'}`, focus: true, columns: PANE_COLUMNS })
  void kick($)
  return 'Deploys open. ↑↓ or 1-9 to pick, Enter opens in Vercel, r refreshes, x closes.'
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'deploys',
      description: 'Toggle the Vercel deploys sidebar for this repo',
      immediate: true,
    })

    link = await findLink($)
    await update($, project, () => link?.name ?? '')
    await update($, status, () => (link ? 'ok' : 'unlinked') as VercelDeploysStatus)
    if (link) void kick($)

    return next(e)
  })

  on('session.end', async ($, e, next) => {
    if (link) await $.process.run(['rm', '-f', await stateFile($)]).catch(() => undefined)
    return next(e)
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const result = await next(e)
    if (link && triggersDeploy(e.command)) {
      watchUntil = (await $.clock.now()) + WATCH_MS
      void kick($)
    }
    return result
  })

  on('command.run', { command: 'deploys' }, async $ => {
    if (!link) return { text: 'No Vercel link here. Run `vercel link` first.' }
    return { text: await toggle($) }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const st = await read($, status)
    const width = e.props.bodyColumns
    const close = () => void $.ui.close({ id: PANE })
    const refreshNow = () => void kick($)
    const now = await $.clock.now()
    const at = await read($, checkedAt)
    const footer = (
      <Box flexDirection="column" marginTop={1}>
        <Box gap={2}>
          <Button key="refresh" plain hotkey="r" label="refresh" onPress={refreshNow} />
          <Button key="close" plain hotkey="x" label="close" onPress={close} />
        </Box>
        <Text dimColor>{at ? `↵ opens in Vercel · checked ${ago(now - at)} ago` : '↵ opens in Vercel'}</Text>
      </Box>
    )

    if (st !== 'ok') {
      const why =
        st === 'missing-token' ? 'No token. Add Keychain item vercel-token or set VERCEL_TOKEN.' : await read($, error)
      return (
        <Box flexDirection="column">
          <Text color="error">{why}</Text>
          {footer}
        </Box>
      )
    }

    const list = (await read($, deploys)).slice(0, 9)

    return (
      <Box flexDirection="column">
        {list.length === 0 && <Text dimColor>No deployments yet.</Text>}
        {list.map((d, i) => {
          const { s, age } = line(d, now)
          const href = d.inspectorUrl || d.url
          const head = `${d.target === 'production' ? 'prod' : 'prev'} ${age.replace(' ago', '').padStart(3)} ${d.branch || d.sha}`
          return (
            <Box key={`row-${d.uid}`} flexDirection="column">
              <Button
                key={`d-${d.uid}`}
                plain
                hotkey={String(i + 1)}
                autoFocus={i === 0 ? true : undefined}
                onPress={() => void $.process.run(['open', href])}
              >
                <Text color={s.color}>{s.mark}</Text> {head}
              </Button>
              {d.message ? <Text dimColor>{`   ${clip(d.message, Math.max(8, width - 3))}`}</Text> : null}
            </Box>
          )
        })}
        {footer}
      </Box>
    )
  })
}

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}
