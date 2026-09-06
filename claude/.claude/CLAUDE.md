# Global instructions

## Working style
- **Never use em dashes (—) in anything you write for me:** chat replies, prose, code
  comments, commit messages, docs, PR descriptions. Use a colon, a comma, parentheses, or
  two sentences instead. This is a hard rule.
- Don't commit or push without me saying so.
- For anything web-facing, verify in a real browser: go back and forth between browser and
  code to refine until it's right. Use the **Playwright** plugin when you need the DOM,
  console, or network, and open a **terminal-browser** split pane so I can watch the page
  while you work instead of reading your description of it.
- Chromium is not iOS Safari. When something is mobile-facing, ask me to check it on my
  phone before you call it done.
- Match the existing style of whatever file you're in. Run the project's formatter and test
  command before calling something done.
- Per-project `CLAUDE.md` files (most of my repos have one) own the specifics, so defer to them.

## Brain (second brain, shared across every repo and agent)
- My notes, projects, and areas live in `~/brain` (private git repo, PARA layout, plain
  markdown). Its `AGENTS.md` is the schema; `brain` on `$PATH` is the CLI. The
  `SessionStart` hook already prints `brain status` (open projects and their next actions).
- When the task touches a project or area listed there, read its main page
  (`projects/<slug>/<slug>.md` or `areas/<slug>/<slug>.md`) before acting. `~/brain/index.md`
  is the map. Don't load the whole vault.
- At the end of substantive work: update the project's main page (state, decisions, `next`,
  `updated`), put durable facts on the area or wiki page, then `brain handoff "<one line>"`.
  If no project exists for the work, create one from the template in `AGENTS.md`.
- Per-repo auto-memory is still fine for repo-local gotchas; anything another repo or agent
  would want goes in `~/brain` instead.

## Primary stack: Next.js
Most of my work is Next.js apps. Defaults unless a repo says otherwise:
- **Next 16 / React 19 / TypeScript** (strict), **App Router**, `@/*` to `src/*`.
- **Tailwind v4**, configured in CSS via `@theme`, **not** `tailwind.config.js`. Don't add a
  JS Tailwind config or reach for v3 patterns.
- **Custom UI, hand-built in `src/components/ui/`; do NOT scaffold or assume shadcn/ui** (no
  Radix, no `components.json`). Build primitives directly.
- Icons: **lucide-react**. Animation: **GSAP + @gsap/react** (my go-to; some framer-motion).
- Data mutations via **server actions**, not API routes or tRPC. Drizzle where an ORM is used.
- Lint/format with **ESLint** (`eslint-config-next`), **not** Biome.
- Tests with **vitest** where present.
- These libraries moved past your knowledge cutoff, so look up specifics (Tailwind v4, Next 16,
  GSAP, Drizzle) with the **context7** plugin instead of guessing.

## Secondary: Elixir/Phoenix
Phoenix + Ecto + LiveView + **Ash**. Use `mix test` / `mix format`. The
`claude-elixir-phoenix` plugin's agents cover Phoenix/LiveView/Ash work.

## Occasional
Salesforce (`sf` CLI, Apex/LWC), Lua/Neovim (`stylua`). Runtimes are managed with **mise**.
