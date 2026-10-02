// Pure helpers for reading and editing brain project pages. No `$` here, so tests can call them.

// The frontmatter block of a markdown file, or null when it has none.
function frontmatter(text: string): string | null {
  const m = text.match(/^---\n([\s\S]*?)\n---/)
  return m?.[1] ?? null
}

// One frontmatter field, unquoted. Matches the awk `fm` in bin/brain.
export function field(text: string, key: string): string {
  const fm = frontmatter(text)
  if (fm === null) return ''
  const line = fm.split('\n').find(l => l.startsWith(key + ':'))
  if (!line) return ''
  return line
    .slice(key.length + 1)
    .trim()
    .replace(/^["']|["']$/g, '')
}

// `repos: [~/Code/a, ~/Code/b]` as absolute paths. Entries that are not local paths are dropped.
export function repos(text: string, home: string): string[] {
  return field(text, 'repos')
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(r => r.trim().replace(/^~(?=\/|$)/, home).replace(/\/+$/, ''))
    .filter(r => r.startsWith('/'))
}

export function isInside(dir: string, root: string): boolean {
  return dir === root || dir.startsWith(root + '/')
}

// Rewrite (or add) one frontmatter field, leaving the body alone.
export function setField(text: string, key: string, value: string): string {
  const m = text.match(/^---\n([\s\S]*?)\n---/)
  if (!m) return text
  const lines = (m[1] ?? '').split('\n')
  const i = lines.findIndex(l => l.startsWith(key + ':'))
  if (i >= 0) lines[i] = `${key}: ${value}`
  else lines.push(`${key}: ${value}`)
  return `---\n${lines.join('\n')}\n---` + text.slice(m[0].length)
}

export function today(now: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

// Which project a `/next` call means: a leading slug wins, else the only match.
export function pickProject<T extends { slug: string }>(
  projects: T[],
  args: string,
): { project: T; text: string } | { error: string } {
  const [first, ...rest] = args.trim().split(/\s+/)
  const named = projects.find(p => p.slug === first)
  if (named) return { project: named, text: rest.join(' ') }
  const only = projects.length === 1 ? projects[0] : undefined
  if (only) return { project: only, text: args.trim() }
  if (projects.length === 0) return { error: 'No active brain project lists this repo.' }
  return { error: `Several projects match; start with one: ${projects.map(p => p.slug).join(', ')}` }
}
