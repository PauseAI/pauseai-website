#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Clear the TRANSLATIONS.md file
echo "" > "$SCRIPT_DIR/TRANSLATIONS.md"

# Function to extract frontmatter property
extract_property() {
    local file="$1"
    local property="$2"
    sed -n '/^---$/,/^---$/p' "$file" | grep "^$property:" | sed "s/^$property:[[:space:]]*//"
}

# Function to extract nested property
extract_nested_property() {
    local file="$1"
    local parent="$2"
    local child="$3"
    sed -n '/^---$/,/^---$/p' "$file" | sed -n "/^$parent:/,/^[a-z]/p" | grep "^[[:space:]]*$child:" | sed "s/^[[:space:]]*$child:[[:space:]]*//"
}

# Search for .md files in src/posts/ and its subdirectories
find "$SCRIPT_DIR/src/posts" -type f -name "*.md" | while read -r file; do
    # Check if the file has an "original" property in the frontmatter
    if grep -q "^original:" "$file"; then
        # Extract the necessary information
        current_title=$(extract_property "$file" "title")
        original_title=$(extract_nested_property "$file" "original" "title")
        original_url=$(extract_nested_property "$file" "original" "url")
        
        # Format the file path for markdown
        file_path=$(realpath --relative-to="$SCRIPT_DIR" "$file")
        
        # Append the information to TRANSLATIONS.md
        echo "- [$current_title]($file_path) - Original: [$original_title]($original_url)" >> "$SCRIPT_DIR/TRANSLATIONS.md"
    fi
done

echo "TRANSLATIONS.md has been updated."
