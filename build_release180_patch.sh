#!/usr/bin/env bash
set -euo pipefail

base=${1:?release179 baseline directory is required}
work=${2:-$(cd "$(dirname "$0")" && pwd)}
output=${3:-$(cd "$work/.." && pwd)/abyss-dominion-remake-main-180-patch-from-179.zip}
expected_tree="d4ef30c669366e92212a02093919f8b9608bcd106c4dd3570c217d7d68f0cc60"

if [[ ! -d "$base" ]]; then
  echo "release179 baseline directory not found: $base" >&2
  exit 1
fi
if [[ ! -d "$work" ]]; then
  echo "release180 working directory not found: $work" >&2
  exit 1
fi

base=$(cd "$base" && pwd)
work=$(cd "$work" && pwd)
output_name=$(basename "$output")
output_parent=$(dirname "$output")
mkdir -p "$output_parent"
output_parent=$(cd "$output_parent" && pwd)
output="$output_parent/$output_name"

is_excluded() {
  case "$1" in
    .git/*|*/.git/*|assets/*|*/assets/*|artifacts/*|*/artifacts/*|node_modules/*|*/node_modules/*|online-server/data/*|coverage/*|*/coverage/*|.nyc_output/*|*/.nyc_output/*|.cache/*|*/.cache/*|.tmp/*|*/.tmp/*|tmp/*|*/tmp/*|temp/*|*/temp/*|.pytest_cache/*|*/.pytest_cache/*|__pycache__/*|*/__pycache__/*|PATCH_FILES.txt|PATCH_MANIFEST.sha256|*/PATCH_FILES.txt|*/PATCH_MANIFEST.sha256|*.zip|*.log|*.pid|*.tmp|*.temp|*.bak|*.swp|*.pyc|*.pyo|*~|.DS_Store|*/.DS_Store)
      return 0
      ;;
  esac
  return 1
}

tree_hash() {
  local root_dir=$1
  (
    cd "$root_dir"
    while IFS= read -r -d '' file; do
      local relative=${file#./}
      if ! is_excluded "$relative"; then
        sha256sum "$relative"
      fi
    done < <(find . -type f -print0 | LC_ALL=C sort -z)
  ) | sha256sum | awk '{print $1}'
}

actual_tree=$(tree_hash "$base")
if [[ "$actual_tree" != "$expected_tree" ]]; then
  echo "release179 baseline mismatch: $actual_tree" >&2
  exit 1
fi

payload_files=(
  "BUILD239_PUBLIC_ONLINE_SAFETY_UPDATE.md"
  "README.md"
  "README_180.txt"
  "README_PATCH_180.txt"
  "build_release180_patch.sh"
  "index.html"
  "online-server/00_READ_ME_FIRST.txt"
  "online-server/ONLINE_SETUP_GUIDE.md"
  "online-server/server.js"
  "online-server/src/FriendCoordinator.js"
  "online-server/src/GuildCoordinator.js"
  "online-server/src/RoomStore.js"
  "online-server/src/TradeCoordinator.js"
  "online-server/tests/build232-friends.test.js"
  "online-server/tests/build239-online-safety.test.js"
  "src/Styles/build239.css"
  "src/main.js"
  "src/online/OnlinePartyClient.js"
  "src/online/OnlineViews.js"
  "src/ui/screens/OnlinePartyScreen.js"
  "tests/build162-online-rebuild-regression.mjs"
  "tests/build225-online-integration-regression.mjs"
  "tests/build227-coop-boss-regression.mjs"
  "tests/build228-link-arts-regression.mjs"
  "tests/build229-resonance-restoration-regression.mjs"
  "tests/build229-room-board-regression.mjs"
  "tests/build230-online-mobile-connection-regression.mjs"
  "tests/build231-team-battle-2-regression.mjs"
  "tests/build232-friends-regression.mjs"
  "tests/build233-guilds-regression.mjs"
  "tests/build234-guild-recruitment-regression.mjs"
  "tests/build235-guild-activity-history-regression.mjs"
  "tests/build236-guild-plans-regression.mjs"
  "tests/build237-guild-plan-gathering-regression.mjs"
  "tests/build239-online-safety-client-regression.mjs"
)

declare -A listed=()
for relative in "${payload_files[@]}"; do
  if [[ -z "$relative" || "$relative" = /* || "$relative" = .* || "$relative" == */../* || "$relative" == ../* || "$relative" == */.. ]]; then
    echo "unsafe release180 payload path: $relative" >&2
    exit 1
  fi
  if [[ -n "${listed[$relative]:-}" ]]; then
    echo "duplicate release180 payload path: $relative" >&2
    exit 1
  fi
  if is_excluded "$relative"; then
    echo "excluded path cannot be included in release180: $relative" >&2
    exit 1
  fi
  listed[$relative]=1
done

unexpected=()
while IFS= read -r -d '' file; do
  relative=${file#"$work"/}
  if is_excluded "$relative"; then
    continue
  fi
  if [[ ! -f "$base/$relative" ]] || ! cmp -s "$file" "$base/$relative"; then
    if [[ -z "${listed[$relative]:-}" ]]; then
      unexpected+=("$relative")
    fi
  fi
done < <(find "$work" -type f -print0 | LC_ALL=C sort -z)

deleted=()
while IFS= read -r -d '' file; do
  relative=${file#"$base"/}
  if ! is_excluded "$relative" && [[ ! -f "$work/$relative" ]]; then
    deleted+=("$relative")
  fi
done < <(find "$base" -type f -print0 | LC_ALL=C sort -z)

if ((${#unexpected[@]})); then
  echo "release180 has changed files missing from the explicit payload list:" >&2
  printf '  %s\n' "${unexpected[@]}" >&2
  exit 1
fi
if ((${#deleted[@]})); then
  echo "release180 contains deletions, but this patch supports replacement files only:" >&2
  printf '  %s\n' "${deleted[@]}" >&2
  exit 1
fi

stage=$(mktemp -d)
verify=$(mktemp -d)
trap 'rm -rf "$stage" "$verify"' EXIT
root="$stage/abyss-dominion-remake-main"
mkdir -p "$root"

printf '%s\n' "${payload_files[@]}" | LC_ALL=C sort > "$root/PATCH_FILES.txt"
while IFS= read -r relative; do
  source_file="$work/$relative"
  if [[ ! -f "$source_file" ]]; then
    echo "release180 payload file is missing: $relative" >&2
    exit 1
  fi
  if [[ ! -s "$source_file" ]]; then
    echo "release180 payload file is empty: $relative" >&2
    exit 1
  fi
  if [[ -f "$base/$relative" ]] && cmp -s "$source_file" "$base/$relative"; then
    echo "release180 payload file is unchanged from release179: $relative" >&2
    exit 1
  fi
  mkdir -p "$root/$(dirname "$relative")"
  cp -p "$source_file" "$root/$relative"
done < "$root/PATCH_FILES.txt"

(cd "$root" && while IFS= read -r file; do sha256sum "$file"; done < PATCH_FILES.txt) > "$root/PATCH_MANIFEST.sha256"

if find "$root" -type f -empty -print -quit | grep -q .; then
  echo "release180 patch contains an empty file" >&2
  exit 1
fi

echo "release180 patch payload:"
sed 's/^/  /' "$root/PATCH_FILES.txt"

rm -f "$output"
(cd "$stage" && zip -q -r -X "$output" abyss-dominion-remake-main)
unzip -tq "$output"
unzip -q "$output" -d "$verify"

verify_root="$verify/abyss-dominion-remake-main"
if [[ ! -f "$verify_root/PATCH_FILES.txt" || ! -f "$verify_root/PATCH_MANIFEST.sha256" ]]; then
  echo "release180 patch metadata is missing after extraction" >&2
  exit 1
fi

expected_files="$verify/expected-files.txt"
actual_files="$verify/actual-files.txt"
{
  sed 's#^#abyss-dominion-remake-main/#' "$root/PATCH_FILES.txt"
  printf '%s\n' \
    "abyss-dominion-remake-main/PATCH_FILES.txt" \
    "abyss-dominion-remake-main/PATCH_MANIFEST.sha256"
} | LC_ALL=C sort > "$expected_files"
(cd "$verify" && find abyss-dominion-remake-main -type f -print | LC_ALL=C sort) > "$actual_files"
if ! cmp -s "$expected_files" "$actual_files"; then
  echo "release180 ZIP contains missing or unexpected files" >&2
  diff -u "$expected_files" "$actual_files" >&2 || true
  exit 1
fi

if ! cmp -s "$root/PATCH_FILES.txt" "$verify_root/PATCH_FILES.txt"; then
  echo "release180 PATCH_FILES changed during ZIP roundtrip" >&2
  exit 1
fi
if ! cmp -s "$root/PATCH_MANIFEST.sha256" "$verify_root/PATCH_MANIFEST.sha256"; then
  echo "release180 PATCH_MANIFEST changed during ZIP roundtrip" >&2
  exit 1
fi
(cd "$verify_root" && sha256sum -c PATCH_MANIFEST.sha256)

echo "release180 patch verified:"
sha256sum "$output"
