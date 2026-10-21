export type VercelDeploysDeploy = {
  uid: string
  state: string
  target: 'production' | 'preview'
  url: string
  inspectorUrl: string
  branch: string
  sha: string
  message: string
  createdAt: number
  readyAt: number | undefined
}

// `missing-token` when the repo is linked but no usable token was found.
export type VercelDeploysStatus = 'unlinked' | 'missing-token' | 'error' | 'ok'

declare module 'claude-code' {
  interface PluginState {
    'vercel-deploys': {
      project: string
      status: VercelDeploysStatus
      error: string
      deploys: VercelDeploysDeploy[]
      checkedAt: number
    }
  }
}
