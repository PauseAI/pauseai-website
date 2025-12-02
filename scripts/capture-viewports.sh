#!/bin/bash
OUTPUT_DIR=~/Pictures/viewport-tests

for page in "" "outcomes" "sayno"; do
  if [ -z "$page" ]; then
    pagename="home"
  else
    pagename="$page"
  fi
  for width in 1920 1400 1000 800 600 400 320; do
    npx playwright screenshot --viewport-size=${width},900 "http://localhost:37572/${page}" "${OUTPUT_DIR}/${pagename}-${width}px.png" 2>/dev/null
    echo "Captured ${pagename} @ ${width}px"
  done
done

echo "Done - $(ls "$OUTPUT_DIR"/*.png | wc -l) screenshots"
