#!/bin/bash

# Check if a file was provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <markdown_file>"
    exit 1
fi

FILE="$1"

# Check if the file exists
if [ ! -f "$FILE" ]; then
    echo "Error: File '$FILE' not found."
    exit 1
fi

# Check if the file has YAML frontmatter (starts with ---)
if ! grep -q "^---" "$FILE"; then
    echo "Error: File does not have YAML frontmatter."
    exit 1
fi

# Get current timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Find the first two occurrences of --- in the file to identify the frontmatter section
FIRST_LINE=$(grep -n "^---" "$FILE" | head -1 | cut -d':' -f1)
SECOND_LINE=$(grep -n "^---" "$FILE" | head -2 | tail -1 | cut -d':' -f1)

if [ -z "$FIRST_LINE" ] || [ -z "$SECOND_LINE" ] || [ "$FIRST_LINE" -eq "$SECOND_LINE" ]; then
    echo "Error: Could not properly identify YAML frontmatter boundaries."
    exit 1
fi

# Create a temporary file for processing
TMP_FILE=$(mktemp)

# Extract the frontmatter, modify it, then reconstruct the file
head -n "$FIRST_LINE" "$FILE" > "$TMP_FILE"
sed -n "$((FIRST_LINE+1)),$((SECOND_LINE-1))p" "$FILE" > "$TMP_FILE.frontmatter"

# Check if git-touch already exists in frontmatter
if grep -q "git-touch:" "$TMP_FILE.frontmatter"; then
    # Update the git-touch line
    sed -i "s/^git-touch:.*$/git-touch: $TIMESTAMP/" "$TMP_FILE.frontmatter"
else
    # Add git-touch as a new line
    echo "git-touch: $TIMESTAMP" >> "$TMP_FILE.frontmatter"
fi

# Append modified frontmatter to the temp file
cat "$TMP_FILE.frontmatter" >> "$TMP_FILE"
echo "---" >> "$TMP_FILE"

# Append the rest of the original file after the frontmatter
tail -n +$((SECOND_LINE+1)) "$FILE" >> "$TMP_FILE"

# Replace original with modified file
mv "$TMP_FILE" "$FILE"
rm -f "$TMP_FILE.frontmatter"

# Stage the file
git add "$FILE"

# Commit with message
git commit -m "git-touch $(basename "$FILE")"

echo "Successfully touched and committed $(basename "$FILE")"