#!/usr/bin/env bash
# Regenerates public/fonts/archivo-greeting.woff2 — the width-axis subset used
# ONLY by the hero greeting.
#
# Why this exists: adding Archivo's wdth axis to the primary font measured
# +0.396s LCP and +53 KiB (spec v3.1 §6.1 kill condition is 0.1s). Subsetting
# to just the greeting's glyphs takes the file from 90,096 to ~4,700 bytes.
#
# RUN THIS IF YOU CHANGE THE GREETING TEXT. The subset contains only the
# characters listed below; anything else falls back to the primary face and
# silently loses the width axis.
#
#   brew install fonttools   (or: pip install fonttools brotli)
#   ./scripts/build-greeting-font.sh
set -euo pipefail

TEXT="Hi,'mFatih. "   # keep in sync with profile.greeting + profile.greetingName

CSS=$(curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap")
URL=$(echo "$CSS" | grep -o "https://[^)]*woff2" | tail -1)
curl -sL "$URL" -o /tmp/archivo-var.woff2

pyftsubset /tmp/archivo-var.woff2 \
  --text="$TEXT" \
  --flavor=woff2 \
  --layout-features='*' \
  --output-file=public/fonts/archivo-greeting.woff2

ls -la public/fonts/archivo-greeting.woff2
