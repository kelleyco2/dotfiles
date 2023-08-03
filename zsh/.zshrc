 # If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

#######################################################################
# Greeting
#######################################################################
color=$(( ( RANDOM % 6 ) + 1 ))
tput setaf $color && toilet -F border -t -f pagga "Always do your best!"

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Path to brew
export PATH=/opt/homebrew/bin:$PATH

export PATH=$HOME/.local/bin:$PATH

# GPG
export GPG_TTY=$TTY

# asdf
# . "$HOME/.asdf/asdf.sh"

# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="gnzh"

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(git)

source $ZSH/oh-my-zsh.sh

# For a full list of active aliases, run `alias`.
alias zshconfig="code ~/.zshrc"
alias gitconfig="code ~/.gitconfig"
alias pdq="yarn dev:pdq"
alias smdm="yarn dev:simplemdm"
alias sd="yarn dev:smartdeploy"
alias ui="yarn dev:ui"
alias templates="auth0 universal-login templates update"

alias pdqui='
cd ~/Code/ozone
tmux new-session -s pdq \; \
split-window -v \; \
send-keys 'ui' C-m \; \
split-window -h \; \
send-keys 'pdq' C-m \; \
'

alias smdmui='
cd ~/Code/ozone
tmux new-session -s smdm \; \
split-window -v \; \
send-keys 'ui' C-m \; \
split-window -h \; \
send-keys 'smdm' C-m \; \
'

alias sdui='
cd ~/Code/ozone
tmux new-session -s sd \; \
split-window -v \; \
send-keys 'ui' C-m \; \
split-window -h \; \
send-keys 'sd' C-m \; \
'
eval "$(rbenv init - zsh)"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

