# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure
- This is a dotfiles repository containing configuration for Neovim, Zsh, Tmux, and other tools
- Primary languages: Lua (Neovim config), Shell scripts (Zsh, Bash)

## Commands
- Install dotfiles: `~/dotfiles/dots/.local/bin/dots`
- Install Homebrew packages: `brew bundle`
- Format Lua files: `stylua <file>`

## Code Style Guidelines
- **Neovim Lua**: Follow [stylua](https://github.com/JohnnyMorganz/StyLua) formatting
- **Shell scripts**: Use double quotes for variables, single quotes for literals
- **Naming**: Use snake_case for Lua variables and functions
- **Imports**: Group related Lua imports together
- **Error handling**: Use pcall for error-prone Lua functions

## Configuration Patterns
- Use modular organization with separate files per logical component
- Follow existing formatting and organization patterns when modifying files
- Maintain consistency with existing code style in each file