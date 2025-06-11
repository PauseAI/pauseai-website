#!/bin/bash

# Script to remove the git-touch field from markdown frontmatter in posts and translations
# Usage: ./git-untouch.sh

set -e

echo "Removing git-touch from markdown files..."

# Process main posts directory
echo "Processing src/posts/*.md"
find src/posts -name "*.md" | xargs sed -i '/^git-touch:/d'

# Process translation directories
echo "Processing l10n-cage/md/*/*.md"
find l10n-cage/md -path "l10n-cage//md/*/*.md" | xargs sed -i '/^git-touch:/d'

echo "Complete! Git-touch fields have been removed."
