#!/usr/bin/env bash
set -euo pipefail

base=${1:?release175 baseline directory is required}
work=${2:-$(cd "$(dirname "$0")" && pwd)}
output=${3:-$(cd "$work/.." && pwd)/abyss-dominion-remake-main-176-patch-from-175.zip}
expected_tree="d7dfae17b86d566c983103fa7feae8e0600614241f90f379bc976e59d353e096"

if [[ ! -d "$base" ]]; then
  echo "release175 baseline directory not found: $base" >&2
  exit 1
fi
if [[ ! -d "$work" ]]; then
  echo "release176 working directory not found: $work" >&2
  exit 1
fi

actual_tree=$(cd "$base" && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum | sha256sum | awk '{print $1}')
if [[ "$actual_tree" != "$expected_tree" ]]; then
  echo "release175 baseline mismatch: $actual_tree" >&2
  exit 1
fi

is_excluded() {
  case "$1" in
    .git/*|*/.git/*|assets/*|*/assets/*|artifacts/*|*/artifacts/*|node_modules/*|*/node_modules/*|online-server/data/*|coverage/*|*/coverage/*|.nyc_output/*|*/.nyc_output/*|.cache/*|*/.cache/*|.tmp/*|*/.tmp/*|tmp/*|*/tmp/*|temp/*|*/temp/*|.pytest_cache/*|*/.pytest_cache/*|__pycache__/*|*/__pycache__/*|PATCH_FILES.txt|PATCH_MANIFEST.sha256|*/PATCH_FILES.txt|*/PATCH_MANIFEST.sha256|*.zip|*.log|*.pid|*.tmp|*.temp|*.bak|*.swp|*.pyc|*.pyo|*~|.DS_Store|*/.DS_Store)
      return 0
      ;;
  esac
  return 1
}

stage=$(mktemp -d)
verify=$(mktemp -d)
trap 'rm -rf "$stage" "$verify"' EXIT
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
  echo "release176 patch has no changed files" >&2
  exit 1
fi

(cd "$root" && while IFS= read -r file; do sha256sum "$file"; done < PATCH_FILES.txt) > "$root/PATCH_MANIFEST.sha256"

echo "release176 patch payload:"
sed 's/^/  /' "$root/PATCH_FILES.txt"

rm -f "$output"
(cd "$stage" && zip -q -r -X "$output" abyss-dominion-remake-main)
unzip -tq "$output"
unzip -q "$output" -d "$verify"
(cd "$verify/abyss-dominion-remake-main" && sha256sum -c PATCH_MANIFEST.sha256)

echo "release176 patch verified:"
sha256sum "$output"
