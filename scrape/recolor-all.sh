#!/bin/zsh
set -e
ROOT="/Users/paulbridges/Desktop/Medway Basketball Association"
SRC="$ROOT/scrape/orig-frames"
OUT="$ROOT/site-orange/assets/ball-orange"
BASE="https://raw.githubusercontent.com/psantos-duall/artdunk-assets/main/webp/ball_sequence"
mkdir -p "$SRC" "$OUT"

echo "downloading 239 original frames..."
seq -w 0 238 | xargs -P 10 -I {} sh -c '
  f="$1"; src="$2"; base="$3"
  [ -s "$src/ball_sequence$f.webp" ] || curl -fsSL "$base$f.webp" -o "$src/ball_sequence$f.webp"
' _ {} "$SRC" "$BASE"
echo "downloaded: $(ls "$SRC"/*.webp | wc -l)"

echo "removing old (Blender) frames..."
rm -f "$OUT"/*.png

echo "recoloring grey -> orange..."
cd "$SRC"
magick mogrify -path "$OUT" -format png -fill "#ef6c1a" -tint 100 *.webp
echo "recolored frames: $(ls "$OUT"/*.png | wc -l)"
