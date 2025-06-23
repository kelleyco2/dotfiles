# macOS Development Environment Setup

This repository contains my personal dotfiles for setting up a new macOS development machine with all the tools and configurations I use.

## New Machine Setup Steps

### 1. Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Clone this repository
```bash
git clone https://github.com/cooperkelley/dotfiles.git ~/dotfiles
cd ~/dotfiles
```

### 3. Run the setup script
```bash
# First make the script executable
chmod +x ~/dotfiles/dots/.local/bin/dots

# Run the dots script
~/dotfiles/dots/.local/bin/dots
```

This script will:
- Install all packages from the Brewfile (including Node.js, Elixir, tmux, Neovim, etc.)
- Use GNU Stow to create symbolic links for all configuration directories

### 4. Set up GPG for Git commit signing
```bash
# Run the GPG setup script
chmod +x ~/dotfiles/git/setup-gpg.sh
~/dotfiles/git/setup-gpg.sh
```
Follow the interactive prompts to:
1. Generate a new GPG key
2. Configure Git to use the key for signing commits

### 5. Install tmux plugins
```bash
# Source tmux configuration
tmux source ~/.config/tmux/tmux.conf

# In any tmux session, press: Ctrl+a + I (capital i)
# This installs all plugins including vim-tmux-navigator for seamless Vim/tmux navigation
```

### 6. Reload your shell configuration
```bash
source ~/.zshrc
```

## Key Features

### Terminal Environment
- Kitty terminal with custom theme
- tmux configuration with custom prefix (Ctrl+a)
- Neovim setup with LSP support and plugins
- ZSH shell configuration

### Development Tools
- Programming languages: Node.js, Elixir, Erlang
- Terminal utilities: fzf, ripgrep, eza, nnn
- Project navigation: rally script (access with tmux prefix + s)
