#!/usr/bin/env bash
set -euo pipefail
root="${1:?deployment root required}"
release="${2:?release ID required}"
url="${3:?health URL required}"
mode="${4:-deploy}"
[[ "$root" = /* && "$root" != / && "$root" != *..* ]] || exit 2
[[ "$release" =~ ^[a-f0-9]{40}$ ]] || exit 2
[[ "$mode" = deploy || "$mode" = rollback ]] || exit 2
cd "$root"
exec 9>.deploy.lock
flock -w 180 9
target="$root/releases/$release"
validate() {
  python3 - "$1" "$release" <<'PY'
import hashlib, json, pathlib, sys
root = pathlib.Path(sys.argv[1])
assert not any(p.is_symlink() for p in root.rglob("*")), "symlinks in artifact"
manifest = json.loads((root / "manifest.json").read_text())
assert manifest, "empty manifest"
actual = {str(p.relative_to(root)) for p in root.rglob("*") if p.is_file() and p.name != "manifest.json"}
assert actual == set(manifest), "manifest does not cover the complete artifact"
for name, digest in manifest.items():
    path = root / name
    assert path.resolve().is_relative_to(root.resolve()), "invalid manifest path"
    assert hashlib.sha256(path.read_bytes()).hexdigest() == digest, name
assert json.loads((root / "version.json").read_text())["commit"] == sys.argv[2]
for name in ["index.html", "404.html", "articles/index.html", "search/index.html"]:
    assert (root / name).is_file(), name
PY
}
if [[ "$mode" = deploy && ! -d "$target" ]]; then
  incoming="$root/incoming/$release"
  test -d "$incoming"
  validate "$incoming"
  mkdir -p releases shared/_astro shared/pagefind
  # Content-hashed assets remain available to tabs opened before a release switch.
  if [[ -d "$incoming/_astro" ]]; then
    rsync -a --ignore-existing "$incoming/_astro/" "$root/shared/_astro/"
  fi
  if [[ -d "$incoming/pagefind" ]]; then
    rsync -a --ignore-existing "$incoming/pagefind/" "$root/shared/pagefind/"
  fi
  mv "$incoming" "$target"
fi
validate "$target"
old="$(readlink current || true)"
switch_to() { ln -sfn "$1" current.next; mv -Tf current.next current; }
verified=0
recover() {
  if [[ "$verified" != 1 ]]; then
    if [[ -n "$old" ]]; then switch_to "$old"; elif [[ -L current ]]; then unlink current; fi
    echo 'Unverified release; restored the previous version.' >&2
  fi
}
trap recover EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
switch_to "$target"
healthy=0
for attempt in 1 2 3; do
  if curl --fail --silent --show-error --max-time 15 "$url/version.json" |
    python3 -c 'import json,sys; assert json.load(sys.stdin)["commit"] == sys.argv[1]' "$release" &&
    curl --fail --silent --max-time 15 "$url/" -o /dev/null &&
    curl --fail --silent --max-time 15 "$url/articles/" -o /dev/null; then
    healthy=1
    break
  fi
  sleep 1
done
if [[ "$healthy" != 1 ]]; then
  echo 'Health check failed.' >&2
  exit 1
fi
verified=1
if [[ -n "$old" && "$old" != "$target" ]]; then
  ln -sfn "$old" previous.next
  mv -Tf previous.next previous
fi
echo "Active release: $release"
