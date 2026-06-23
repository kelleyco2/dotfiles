<div align="center">

# 🔮 dotfiles

**Terminal-first, agent-first macOS dotfiles.**

Neovim · tmux · Zsh · kitty · git · Claude Code — managed with [GNU Stow](https://www.gnu.org/software/stow/).

![macOS](https://img.shields.io/badge/macOS-000000?style=flat-square&logo=apple&logoColor=white)
![Neovim](https://img.shields.io/badge/Neovim-57A143?style=flat-square&logo=neovim&logoColor=white)
![tmux](https://img.shields.io/badge/tmux-1BB91F?style=flat-square&logo=tmux&logoColor=white)
![Zsh](https://img.shields.io/badge/Zsh-F15A24?style=flat-square&logo=zsh&logoColor=white)
![Claude Code](https://img.shields.io/badge/Claude%20Code-D97757?style=flat-square&logo=anthropic&logoColor=white)
![GNU Stow](https://img.shields.io/badge/GNU%20Stow-4E9A06?style=flat-square&logo=gnu&logoColor=white)

</div>

---

I live in the terminal and work almost entirely through **Claude Code** across many repos.
This setup is tuned for that: fast pane/session switching, a session hub that shows what each
agent is doing, parallel git worktrees, and a Claude Code config that travels between machines.

<!-- Tip: drop a terminal screenshot at docs/preview.png and uncomment:
<div align="center"><img src="docs/preview.png" width="820" alt="preview" /></div>
-->

## ✨ Highlights

- **🔮 Session hub** (`prefix + s`) — one fzf popup over running tmux sessions *and* launchable
  projects. Each running session shows what Claude is doing in it; `Ctrl-X` kills one.

  ```
  🔮 ▮
  ● proof      waiting        ┌ preview: git status ─────────
  ● dotfiles   working        │   main ↑2   7 changed
  ○ alaska2                   │  M src/app/page.tsx
  ○ peptide                   │  ?? BLOG_STYLE.md
  ○ ...                       │  ── recent ──
                              │  a1b2c3  3d  Fix nav overflow
    ● waiting  ● working  ○ launch  ^X kill
  ```

- **🌲 Parallel worktrees** (`wt add <branch>`) — sibling git worktree with your gitignored
  `.env*` copied in, a free dev `PORT` assigned, and a Claude/nvim/shell session opened.
- **🤖 Portable Claude Code config** — settings, stack-aware `CLAUDE.md`, skills, agents,
  a powerline statusline, and a post-edit formatter hook, all synced via Stow.
- **⚡ Tuned editing** — Neovim on the `vim.lsp.config` API (vtsls, elixir-ls, tailwind, biome),
  format-on-save, diffview + octo for in-terminal review; tmux vi copy-mode → system clipboard.

## 📦 What's inside

| Package | Sets up |
| --- | --- |
| `nvim/` | Neovim — lazy.nvim, LSP (vtsls · elixir-ls · tailwindcss · biome), telescope, gitsigns, diffview, octo, treesitter, format-on-save |
| `tmux/` | tmux — `C-a` prefix, the session **hub**, smug templates, `wt` worktrees, vi copy-mode, vim-tmux-navigator |
| `zsh/` | Zsh — oh-my-zsh, mise, zoxide, fzf keys, autosuggestions + syntax highlighting, `bat`/`fd`/`eza` |
| `kitty/` | kitty terminal — JetBrains Mono + Nerd Font |
| `git/` | git — GPG signing, `delta` pager, lazygit, handy aliases |
| `claude/` | Claude Code — portable config, statusline, format hook, `claude-bootstrap` |
| `dots/` | One-shot installer |

## 🚀 Install

```sh
# 1. Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Clone + install (brew bundle, then `stow --no-folding */`)
git clone https://github.com/kelleyco2/dotfiles.git ~/dotfiles
~/dotfiles/dots/.local/bin/dots
```

Then, once per machine:

```sh
claude-bootstrap                # register Claude plugins/marketplaces + user-scope MCP servers
~/dotfiles/git/setup-gpg.sh     # generate a signing key + wire up git signing
# in a tmux session, press `C-a I` to install tmux plugins
```

## ⌨️ Cheatsheet

**tmux** (prefix `C-a`)

| Key | Action |
| --- | --- |
| `prefix s` | Session hub (switch ● / launch ○ / `Ctrl-X` kill) |
| `prefix \|` · `prefix -` | Split vertical · horizontal |
| `C-h/j/k/l` | Move between panes (vim-tmux-navigator) |
| `prefix !` | Kill session |
| `prefix r` | Reload `tmux.conf` |
| `v` · `y` (copy-mode) | Select · yank to clipboard |

**Neovim** (leader `Space`, `;`↔`:` swapped)

| Key | Action |
| --- | --- |
| `<CR>` · `K` | Go to definition · hover |
| `<leader>gd` | Diffview (working tree) |
| `<leader>gr` · `<leader>gi` | Octo: GitHub PRs · issues |
| `<leader>e` | File picker (nnn) |

**Shell**

| Command | Does |
| --- | --- |
| `wt add\|rm\|ls <branch>` | Parallel git worktrees |
| `icat <img>` | Render an image inline (kitty) |
| `lazygit` · `lazysql` | Git / database TUIs |

## 🛠 How it works

Each top-level directory is a Stow package whose contents mirror `$HOME`; `stow --no-folding */`
symlinks them in per-file, so files Claude or a tool regenerates stay out of the repo. See
[`CLAUDE.md`](CLAUDE.md) for the full architecture and conventions.
