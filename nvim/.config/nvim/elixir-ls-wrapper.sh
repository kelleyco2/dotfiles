#!/bin/bash
# Wrapper script for elixir-ls that properly activates mise environment
export PATH="$HOME/.local/share/mise/shims:$PATH"
eval "$(mise activate bash)"
exec ~/.local/share/mise/installs/elixir-ls/0.29.3/language_server.sh "$@"