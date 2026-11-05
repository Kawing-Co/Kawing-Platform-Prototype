#!/usr/bin/env bash
set -euo pipefail
# Run from repository root. Node >=22, FFmpeg and Chromium are required.
HYPERFRAMES_BROWSER_PATH="${HYPERFRAMES_BROWSER_PATH:-/usr/bin/chromium}" npx --yes hyperframes@0.9.15 render motion --output /tmp/kawing-story-render.mp4 --fps 30 --workers 1 --no-browser-gpu --quality standard
ffmpeg -y -v error -i /tmp/kawing-story-render.mp4 -c:v libx264 -crf 24 -preset medium -pix_fmt yuv420p -movflags +faststart -an public/motion/kawing-story.mp4
ffmpeg -y -v error -ss 1.8 -i public/motion/kawing-story.mp4 -frames:v 1 -q:v 3 public/images/story-poster.jpg

ffmpeg -y -v error -ss 1.8 -i public/motion/kawing-story.mp4 -vf 'crop=560:480:660:120' -frames:v 1 -q:v 3 public/images/story-scene.jpg
