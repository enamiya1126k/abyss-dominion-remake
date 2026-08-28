#!/usr/bin/env bash
set -euo pipefail

base=${1:?release172 reconstructed directory is required}
work=${2:-$(cd "$(dirname "$0")" && pwd)}
output=${3:-$(cd "$work/.." && pwd)/abyss-dominion-remake-main-173-patch-from-172.zip}
expected_tree="2a0322e0b431e4fe945bc38d2283a3fc35c3d0aa2411d6958815d159b36f572b"

actual_tree=$(find "$base" -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum | awk '{print $1}')
if [[ "$actual_tree" != "$expected_tree" ]]; then
  echo "release172 baseline mismatch: $actual_tree" >&2
  exit 1
fi

stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
root="$stage/abyss-dominion-remake-main"
mkdir -p "$root"

while IFS= read -r -d '' file; do
  relative=${file#"$work"/}
  mkdir -p "$root/$(dirname "$relative")"
  cp -p "$file" "$root/$relative"
done < <(find "$work" -type f -print0 | sort -z | while IFS= read -r -d '' file; do relative=${file#"$work"/}; if [[ ! -f "$base/$relative" ]] || ! cmp -s "$file" "$base/$relative"; then printf '%s\0' "$file"; fi; done)

find "$root" -type f ! -name PATCH_FILES.txt ! -name PATCH_MANIFEST.sha256 -printf '%P\n' | LC_ALL=C sort > "$root/PATCH_FILES.txt"
(cd "$root" && while IFS= read -r file; do sha256sum "$file"; done < PATCH_FILES.txt) > "$root/PATCH_MANIFEST.sha256"

rm -f "$output"
(cd "$stage" && zip -q -r -X "$output" abyss-dominion-remake-main)
unzip -tq "$output"
sha256sum "$output"
