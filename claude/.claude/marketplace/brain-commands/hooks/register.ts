import type { EngineInterface, Register } from 'claude-code'

import { field, isInside, pickProject, repos, setField, today } from './brain'

type BrainProject = { slug: string; next: string; file: string }

const NO_EM_DASH = 'No em dashes in the brain. Use a colon, comma, or parentheses.'

// The repo a session belongs to: a worktree maps to its main checkout, so `wt add` sessions match too.
async function repoRoot($: EngineInterface): Promise<string> {
  const cwd = await $.session.cwd()
  const git = await $.process
    .run(['git', 'rev-parse', '--path-format=absolute', '--git-common-dir'])
    .catch(() => undefined)
  const common = git?.exitCode === 0 ? git.stdout.trim() : ''
  return common.endsWith('/.git') ? common.slice(0, -'/.git'.length) : cwd
}

async function brainDir($: EngineInterface): Promise<{ home: string; brain: string }> {
  const home = (await $.env.get('HOME')) ?? ''
  const brain = (await $.env.get('BRAIN_PATH')) ?? `${home}/brain`
  return { home, brain }
}

// Active projects whose `repos:` covers this session's repo.
async function scan($: EngineInterface): Promise<BrainProject[]> {
  const { home, brain } = await brainDir($)
  const root = await repoRoot($)
  const dirs = await $.fs.list(`${brain}/projects`).catch(() => [])
  const found: BrainProject[] = []
  for (const d of dirs) {
    if (d.kind !== 'dir') continue
    const file = `${brain}/projects/${d.name}/${d.name}.md`
    const text = await $.fs.read(file).catch(() => '')
    if (!text) continue
    const status = field(text, 'status')
    if (status === 'done' || status === 'paused') continue
    if (!repos(text, home).some(r => isInside(root, r))) continue
    found.push({ slug: d.name, next: field(text, 'next'), file })
  }
  return found
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'next',
      description: "Set a brain project's next action (no Claude turn)",
      argumentHint: '[slug] <next action>',
      immediate: true,
    })
    await $.command.register({
      name: 'handoff',
      description: 'Run brain handoff: index, log, sync (no Claude turn)',
      argumentHint: '<one line>',
      immediate: true,
    })

    return next(e)
  })

  on('command.run', { command: 'next' }, async ($, e) => {
    const picked = pickProject(await scan($), e.args)
    if ('error' in picked) return { text: picked.error }
    const text = picked.text.replace(/\s+/g, ' ').trim()
    if (!text) return { text: `${picked.project.slug}: ${picked.project.next || '(no next action)'}` }
    if (text.includes('—')) return { text: NO_EM_DASH }

    const page = await $.fs.read(picked.project.file)
    await $.fs.write(picked.project.file, setField(setField(page, 'next', text), 'updated', today(new Date())))

    return { text: `${picked.project.slug}: next set. Syncs on the next Stop or /handoff.` }
  })

  on('command.run', { command: 'handoff' }, async ($, e) => {
    const line = e.args.trim()
    if (!line) return { text: 'Usage: /handoff <one line about what happened>' }
    if (line.includes('—')) return { text: NO_EM_DASH }

    const { brain } = await brainDir($)
    const run = await $.process
      .run([`${brain}/bin/brain`, 'handoff', line], { timeoutMs: 120_000 })
      .catch((err: unknown) => ({ exitCode: 1, stdout: '', stderr: String(err) }))
    const out = (run.exitCode === 0 ? run.stdout : run.stderr || run.stdout).trim()

    return { text: run.exitCode === 0 ? `handoff done. ${out}`.trim() : `handoff failed: ${out}` }
  })
}
