#!/usr/bin/env bash
set -euo pipefail

repo_root="${1:-$(pwd)}"
source_image="$repo_root/source-images/cover.jpg"
assets_dir="$repo_root/public/assets"

if ! command -v sips >/dev/null 2>&1; then
  echo "Missing required command: sips" >&2
  exit 1
fi

if ! command -v jpegtran >/dev/null 2>&1; then
  echo "Missing required command: jpegtran" >&2
  exit 1
fi

if [[ ! -f "$source_image" ]]; then
  echo "Missing source image: $source_image" >&2
  exit 1
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

sips --resampleWidth 480 -s format jpeg -s formatOptions 80 "$source_image" --out "$tmp_dir/cover-480.jpg" >/dev/null
sips --resampleWidth 720 -s format jpeg -s formatOptions 70 "$source_image" --out "$tmp_dir/cover-720.jpg" >/dev/null
sips --resampleWidth 1080 -s format jpeg -s formatOptions 60 "$source_image" --out "$tmp_dir/cover-1080.jpg" >/dev/null

jpegtran -copy none -optimize -progressive -outfile "$assets_dir/cover.jpg" "$source_image"
jpegtran -copy none -optimize -progressive -outfile "$assets_dir/cover-480.jpg" "$tmp_dir/cover-480.jpg"
jpegtran -copy none -optimize -progressive -outfile "$assets_dir/cover-720.jpg" "$tmp_dir/cover-720.jpg"
jpegtran -copy none -optimize -progressive -outfile "$assets_dir/cover-1080.jpg" "$tmp_dir/cover-1080.jpg"

du -h "$assets_dir"/cover*.jpg
