# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is
Personal dotfiles managed with [GNU Stow](https://www.gnu.org/software/stow/). Each top-level directory (`nvim/`, `zsh/`, `tmux/`, `kitty/`, `git/`, `claude/`, `dots/`) is a stow package — its contents mirror the home directory structure and get symlinked into `~`.

## Commands
- **Install everything**: `~/dotfiles/dots/.local/bin/dots` (runs `brew bundle` then `stow --no-folding */`)
- **Install Homebrew packages only**: `brew bundle`
- **Stow a single package**: `stow --no-folding <package>` (e.g., `stow --no-folding nvim`)
- **Format Lua files**: `stylua <file>`
- **Session hub**: `prefix + s` (tmux popup running `hub`) — fzf over running tmux sessions (● switch into) and projects (○ launch a smug `claude`/`nvim`/`shell` session). Replaces the old rally/switch/Claude bindings. The `rally` script still exists for direct project launch.
- **Parallel worktrees**: `wt add <branch>` (creates a sibling git worktree, copies gitignored `.env*` files into it, assigns a free `PORT` in `.env.local`, and opens a smug/Claude session); `wt rm <branch>`, `wt ls`
- **Install tmux plugins**: In a tmux session, press `C-a I` (capital I)
- **Set up Claude Code on a new machine**: `claude-bootstrap` (idempotent — registers plugin marketplaces, installs plugins, adds the Sanity user-scope MCP server from `$SANITY_MCP_TOKEN`)
- **Set up GPG**: `~/dotfiles/git/setup-gpg.sh` (interactive — generates key and configures git signing)

## Architecture

### Stow Layout
Each top-level directory maps to `$HOME`. For example:
- `nvim/.config/nvim/` → `~/.config/nvim/`
- `tmux/.config/tmux/` → `~/.config/tmux/`
- `zsh/.zshrc` → `~/.zshrc`
- `git/.config/git/config` → `~/.config/git/config`

The `--no-folding` flag ensures stow creates individual symlinks rather than symlinking entire directories (important so local files don't end up in the repo).

### Neovim (`nvim/.config/nvim/`)
- Plugin manager: **lazy.nvim** (auto-bootstrapped in `init.lua`)
- Entry point: `init.lua` → loads `options`, `mappings`, then `lazy.setup("plugins")`
- Plugins live in `lua/plugins/` as individual files returned as lazy.nvim spec tables (e.g., `lsp.lua`, `ui.lua`, `git.lua`, `complete.lua`, `editing.lua`, `filesystem.lua`, `treesitter.lua`)
- `plugin/` directory contains auto-loaded scripts (diagnostics config, window resize)
- LSP servers configured: `elixirls`, `tailwindcss`, `ts_ls`, `biome`
- Format-on-save is wired through LSP `textDocument/formatting`
- Key integrations: **Obsidian.nvim** (vault at `~/Code/Oracle`, mappings under `<leader>o`), **Copilot** (`<C-l>` to accept), **pomo.nvim** (`<leader>p` prefix)
- Mapping conventions: `;`/`:` swapped, `<BS>` swaps alternate buffer, quickfix via arrow keys, search results auto-centered with `zz`

### Tmux (`tmux/`)
- Prefix is `C-a` (not default `C-b`)
- Plugin manager: **tpm** (installed via Homebrew, run line at bottom of `tmux.conf`)
- `rally` script (`tmux/.local/bin/rally`): fzf-based project launcher that picks from `~/dotfiles/`, `~/Journal/<year>/`, `~/Code/*` and opens a smug session
- Smug templates in `tmux/.config/smug/` define session layouts (default opens nvim + shell)
- Key bindings: `prefix + A` opens Claude Code in a split, `prefix + !` kills session, `|`/`-` for splits
- Pane/window indexes start at 1, mouse enabled, vim-tmux-navigator for seamless pane movement

### Zsh (`zsh/`)
- Uses **oh-my-zsh** with `gnzh` theme
- Runtime version management: **mise** (takes precedence over nvm); also has **asdf**, **rbenv**, **bun**
- Common aliases: `cat` → `bat`, `find` → `fd`, `nnn -H`
- Navigation: **zoxide** for smart directory jumping
- Shell startup: Google Cloud SDK sourced, custom `TMPDIR=$HOME/tmp`, FZF with reverse layout and custom colors

### Kitty (`kitty/`)
- JetBrains Mono 14pt with RobotoMono Nerd Font for symbols

### Git (`git/`)
- Commit and tag signing via GPG (`/opt/homebrew/bin/gpg`)
- Merge conflict style: `diff3` (three-way diffs)
- Pager: **delta** (`core.pager`, `interactive.diffFilter`, with `navigate` + line numbers); **lazygit** available as a TUI
- Key aliases: `ac` (add+commit), `cob` (checkout -b), `pwl` (push --force-with-lease), `quickfix` (amend no-edit), `reset` (soft reset HEAD~1), `build` (empty commit for CI triggers)

### Claude Code (`claude/.claude/`)
Portable, version-controlled Claude Code config, symlinked into `~/.claude/`. **Only portable config is synced** — machine-local/secret state (sessions, history, `projects/`, `plugins/cache/`, credentials, `~/.claude.json`) is deliberately left out (kept in real dirs under `~/.claude` by `--no-folding`, with a safety-net blocklist in the repo-root `.gitignore`).
- `settings.json` — portable prefs + `enabledPlugins` (which plugins are on)
- `CLAUDE.md` — global instructions / stack context (Next.js-first, Elixir secondary)
- `skills/` — personal skills incl. the custom `nextjs-conventions` and `elixir-architect` plus the design-skill set
- `agents/nextjs-reviewer.md`, `commands/run-tests.md` — custom global subagent + slash command
- `statusline.js` — statusline (model · dir · git branch · lines · cost), wired via `settings.json` `statusLine`
- `hooks/format.mjs` — PostToolUse hook; after Claude edits a file it runs the project's own formatter (Biome/Prettier for web, `mix format`, `stylua`) — only when that tooling is already configured, never imposed
- `.local/bin/claude-bootstrap` — re-installs plugins/marketplaces and re-adds user-scope MCP servers on a new machine (run once after stow)
- **Caveat**: a symlinked `settings.json` can be replaced by Claude's in-app writes; treat the repo copy as source of truth and re-run `stow --no-folding claude` if the symlink is orphaned.

## Code Style
- **Lua**: Format with `stylua`; use `snake_case`; wrap error-prone calls in `pcall`
- **Shell scripts**: Double quotes for variables, single quotes for literals
- When modifying configs, match the existing style of that file
