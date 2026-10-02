#!/bin/bash
# Wrapper script for elixir-ls that properly activates mise environment
export PATH="$HOME/.local/share/mise/shims:$PATH"
eval "$(mise activate bash)"
# `latest` is a symlink mise repoints on each install, so a version bump here
# doesn't silently break go-to-definition. Pin an explicit version only to debug.
exec ~/.local/share/mise/installs/elixir-ls/latest/language_server.sh "$@"