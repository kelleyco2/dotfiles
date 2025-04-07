#!/bin/bash

# Setup GPG key generator script
set -e
echo "Setting up new GPG key for git signing..."

# Ensure GPG_TTY is set
export GPG_TTY=$(tty)

# Use interactive mode instead of batch mode
echo "You'll be prompted to:"
echo "1. Select RSA and RSA (option 1)"
echo "2. Set keysize to 4096"
echo "3. Set expiration (0 = no expiration)"
echo "4. Enter your details (use email: $(git config user.email))"
echo "5. Create a secure passphrase"
echo ""
echo "Starting GPG key generation..."
echo ""

# Generate key interactively
gpg --full-generate-key

# Get the new key ID
key_id=$(gpg --list-secret-keys --keyid-format=long | grep -B 1 "$(git config user.email)" | head -n 1 | sed 's/.*\/\([A-F0-9]\{16\}\).*/\1/')

if [ -z "$key_id" ]; then
  echo "Could not find newly generated key. Please configure git manually."
  exit 1
fi

# Configure git to use the new key
git config --global user.signingkey $key_id
git config --global commit.gpgsign true
git config --global tag.gpgsign true
git config --global gpg.program $(which gpg)

echo "GPG key setup complete!"
echo "Your key ID is: $key_id"
echo "Test with: git commit --allow-empty -m \"Test signing\""