# GPG configuration
export GPG_TTY=$(tty)
# Restart the gpg-agent
alias gpg-restart="pkill -f gpg-agent; gpg-agent --daemon"