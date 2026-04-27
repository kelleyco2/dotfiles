# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is
Personal dotfiles managed with [GNU Stow](https://www.gnu.org/software/stow/). Each top-level directory (`nvim/`, `zsh/`, `tmux/`, `kitty/`, `git/`, `dots/`) is a stow package — its contents mirror the home directory structure and get symlinked into `~`.

## Commands
- **Install everything**: `~/dotfiles/dots/.local/bin/dots` (runs `brew bundle` then `stow --no-folding */`)
- **Install Homebrew packages only**: `brew bundle`
- **Stow a single package**: `stow --no-folding <package>` (e.g., `stow --no-folding nvim`)
- **Format Lua files**: `stylua <file>`
- **Launch project sessions**: `rally` (tmux popup via `prefix + s` — uses fzf to pick a project, then starts a smug session)
- **Install tmux plugins**: In a tmux session, press `C-a I` (capital I)
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
- Key aliases: `ac` (add+commit), `cob` (checkout -b), `pwl` (push --force-with-lease), `quickfix` (amend no-edit), `reset` (soft reset HEAD~1), `build` (empty commit for CI triggers)

## Code Style
- **Lua**: Format with `stylua`; use `snake_case`; wrap error-prone calls in `pcall`
- **Shell scripts**: Double quotes for variables, single quotes for literals
- When modifying configs, match the existing style of that file
