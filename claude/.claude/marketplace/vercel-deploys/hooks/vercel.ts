// Pure helpers for the Vercel deployments API. No `$` here, so tests can call them.
import type { VercelDeploysDeploy } from '../types'

export const ACTIVE = new Set(['QUEUED', 'INITIALIZING', 'BUILDING'])

type ApiDeployment = {
  uid?: string
  state?: string
  readyState?: string
  target?: string | null
  url?: string
  inspectorUrl?: string
  created?: number
  createdAt?: number
  ready?: number
  meta?: Record<string, string | undefined>
}

// `.vercel/project.json`, or null when the folder is not linked.
export function parseProject(text: string): { projectId: string; orgId: string; name: string } | null {
  try {
    const p = JSON.parse(text) as { projectId?: string; orgId?: string; projectName?: string }
    if (!p.projectId || !p.orgId) return null
    return { projectId: p.projectId, orgId: p.orgId, name: p.projectName ?? p.projectId }
  } catch {
    return null
  }
}

// `.vercel/repo.json`, written by newer CLIs that link a whole repo; uses the
// project rooted at the repo top, or the only one listed.
export function parseRepo(text: string): { projectId: string; orgId: string; name: string } | null {
  try {
    const r = JSON.parse(text) as {
      projects?: Array<{ id?: string; orgId?: string; name?: string; directory?: string }>
    }
    const list = r.projects ?? []
    const p = list.find(x => x.directory === '.') ?? (list.length === 1 ? list[0] : undefined)
    if (!p?.id || !p.orgId) return null
    return { projectId: p.id, orgId: p.orgId, name: p.name ?? p.id }
  } catch {
    return null
  }
}

// The CLI's token, unless it has expired (the CLI refreshes it; we can't).
export function cliToken(text: string, nowMs: number): string | undefined {
  try {
    const a = JSON.parse(text) as { token?: string; expiresAt?: number }
    if (!a.token) return undefined
    if (a.expiresAt && a.expiresAt * 1000 < nowMs) return undefined
    return a.token
  } catch {
    return undefined
  }
}

export function deploymentsUrl(projectId: string, orgId: string, limit = 10): string {
  // Personal accounts have a `user_` orgId and no teamId.
  const team = orgId.startsWith('team_') ? `&teamId=${orgId}` : ''
  return `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=${limit}${team}`
}

export function parseDeployments(text: string): VercelDeploysDeploy[] {
  const body = JSON.parse(text) as { deployments?: ApiDeployment[] }
  return (body.deployments ?? []).map(d => {
    const meta = d.meta ?? {}
    return {
      uid: d.uid ?? '',
      state: d.state ?? d.readyState ?? 'UNKNOWN',
      target: d.target === 'production' ? 'production' : 'preview',
      url: d.url ? `https://${d.url}` : '',
      inspectorUrl: d.inspectorUrl ?? '',
      branch: meta.githubCommitRef ?? meta.gitlabCommitRef ?? meta.bitbucketCommitRef ?? '',
      sha: (meta.githubCommitSha ?? meta.gitlabCommitSha ?? meta.bitbucketCommitSha ?? '').slice(0, 7),
      message: (meta.githubCommitMessage ?? meta.gitlabCommitMessage ?? meta.bitbucketCommitMessage ?? '').split('\n')[0] ?? '',
      createdAt: d.created ?? d.createdAt ?? 0,
      readyAt: d.ready,
    }
  })
}

// What the band shows: the latest production deploy, plus the latest preview when it is newer.
export function headline(deploys: VercelDeploysDeploy[]): VercelDeploysDeploy[] {
  const sorted = [...deploys].sort((a, b) => b.createdAt - a.createdAt)
  const prod = sorted.find(d => d.target === 'production')
  const preview = sorted.find(d => d.target === 'preview')
  if (!prod) return preview ? [preview] : []
  return preview && preview.createdAt > prod.createdAt ? [prod, preview] : [prod]
}

export function ago(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}s`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  if (h < 48) return `${h}h`
  return `${Math.round(h / 24)}d`
}

// Shell commands after which a new deploy is likely to show up.
export function triggersDeploy(command: string): boolean {
  return /\bgit\s+push\b|\bgh\s+pr\s+merge\b|\bvercel\b/.test(command)
}

// Deploys that left the building states since the last poll: the ones worth a toast.
export function finished(before: VercelDeploysDeploy[], after: VercelDeploysDeploy[]): VercelDeploysDeploy[] {
  const wasActive = new Set(before.filter(d => ACTIVE.has(d.state)).map(d => d.uid))
  return after.filter(d => wasActive.has(d.uid) && !ACTIVE.has(d.state))
}
