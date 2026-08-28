#!/usr/bin/env bash
set -euo pipefail

base=${1:?release173 baseline directory is required}
work=${2:-$(cd "$(dirname "$0")" && pwd)}
output=${3:-$(cd "$work/.." && pwd)/abyss-dominion-remake-main-174-patch-from-173.zip}
expected_tree="f59b2951fba1bf546251dea96abdabc78e93f6444634bd46d2aa4ea19049b8d5"

if [[ ! -d "$base" ]]; then
  echo "release173 baseline directory not found: $base" >&2
  exit 1
fi
if [[ ! -d "$work" ]]; then
  echo "release174 working directory not found: $work" >&2
  exit 1
fi

actual_tree=$(find "$base" -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum | sha256sum | awk '{print $1}')
if [[ "$actual_tree" != "$expected_tree" ]]; then
  echo "release173 baseline mismatch: $actual_tree" >&2
  exit 1
fi

is_excluded() {
  case "$1" in
    .git/*|*/.git/*|node_modules/*|*/node_modules/*|online-server/data/*|coverage/*|*/coverage/*|.cache/*|*/.cache/*|PATCH_FILES.txt|PATCH_MANIFEST.sha256|*/PATCH_FILES.txt|*/PATCH_MANIFEST.sha256|*.zip|*.log|*.tmp|*.temp|*.bak|*.swp|*~|.DS_Store|*/.DS_Store)
      return 0
      ;;
  esac
  return 1
}

stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
root="$stage/abyss-dominion-remake-main"
mkdir -p "$root"

while IFS= read -r -d '' file; do
  relative=${file#"$work"/}
  if is_excluded "$relative"; then
    continue
  fi
  if [[ ! -f "$base/$relative" ]] || ! cmp -s "$file" "$base/$relative"; then
    mkdir -p "$root/$(dirname "$relative")"
    cp -p "$file" "$root/$relative"
  fi
done < <(find "$work" -type f -print0 | LC_ALL=C sort -z)

find "$root" -type f ! -name PATCH_FILES.txt ! -name PATCH_MANIFEST.sha256 -printf '%P\n' | LC_ALL=C sort > "$root/PATCH_FILES.txt"
if [[ ! -s "$root/PATCH_FILES.txt" ]]; then
  echo "release174 patch has no changed files" >&2
  exit 1
fi
(cd "$root" && while IFS= read -r file; do sha256sum "$file"; done < PATCH_FILES.txt) > "$root/PATCH_MANIFEST.sha256"

rm -f "$output"
(cd "$stage" && zip -q -r -X "$output" abyss-dominion-remake-main)
unzip -tq "$output"
sha256sum "$output"
