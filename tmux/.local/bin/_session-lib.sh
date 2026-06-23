# Shared helpers for the session launchers (hub, rally, wt). Sourced, not run.
# Written in POSIX sh so both bash (hub, wt) and /bin/sh (rally) can source it.

# Emit candidate project directories, one absolute path per line.
project_dirs() {
  printf '%s\n' "$HOME/dotfiles"
  for d in "$HOME"/Code/*/; do
    [ -d "$d" ] && printf '%s\n' "${d%/}"
  done
}

# Launch (or switch into) a smug session for a project.
#   smug_launch <name> <root>
# Tries a named smug template first (e.g. ozone.yml), falling back to the
# default template. Uses -a (switch client) only inside tmux; outside tmux
# smug attaches normally.
smug_launch() {
  _sl_name=$(printf '%s' "$1" | tr '.' '_')
  _sl_root=$2
  _sl_attach=""
  [ -n "${TMUX:-}" ] && _sl_attach="-a"
  # shellcheck disable=SC2086
  smug start "$_sl_name" $_sl_attach 2>/dev/null \
    || smug start default name="$_sl_name" root="$_sl_root" $_sl_attach
}
