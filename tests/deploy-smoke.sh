#!/usr/bin/env bash
set -euo pipefail
script="${1:?deploy script required}"
root="$(mktemp -d /tmp/shiori-deploy-test.XXXXXX)"
pid=''
trap 'if [[ -n "$pid" ]]; then kill "$pid" || true; fi; rm -rf -- "$root"' EXIT
mkdir -p "$root/releases" "$root/incoming"
python3 - "$root" <<'PY'
import hashlib,json,pathlib,sys
root=pathlib.Path(sys.argv[1])
for c in "ab":
    sha=c*40
    dest=root/"incoming"/sha
    (dest/"articles").mkdir(parents=True)
    for name in ["index.html","404.html","articles/index.html","search/index.html"]:
        p=dest/name
        p.parent.mkdir(exist_ok=True)
        p.write_text("test "+sha)
    (dest/"version.json").write_text(json.dumps({"commit":sha}))
    if c == "a":
        (dest/"withdrawn.html").write_text("withdrawn article")
    (dest/"manifest.json").write_text(json.dumps({str(p.relative_to(dest)):hashlib.sha256(p.read_bytes()).hexdigest() for p in dest.rglob("*") if p.is_file()}))
PY
python3 -m http.server 18983 --bind 127.0.0.1 --directory "$root/current" >"$root/http.log" 2>&1 &
pid=$!
sleep 1
a="$(printf 'a%.0s' {1..40})"
b="$(printf 'b%.0s' {1..40})"
if bash "$script" "$root" "$a" http://127.0.0.1:1; then exit 1; fi
test ! -L "$root/current"
bash "$script" "$root" "$a" http://127.0.0.1:18983
test "$(readlink "$root/current")" = "$root/releases/$a"
bash "$script" "$root" "$b" http://127.0.0.1:18983
test "$(readlink "$root/previous")" = "$root/releases/$a"
test "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:18983/withdrawn.html)" = 404
bash "$script" "$root" "$b" http://127.0.0.1:18983
if bash "$script" "$root" "$a" http://127.0.0.1:1 rollback; then exit 1; fi
test "$(readlink "$root/current")" = "$root/releases/$b"
bash "$script" "$root" "$a" http://127.0.0.1:18983 rollback
test "$(readlink "$root/current")" = "$root/releases/$a"
if bash "$script" / invalid http://127.0.0.1:18983; then exit 1; fi
echo 'PASS: initial release, upgrade, failed health check restoration, manual rollback and argument validation'

# A damaged retained release must never become live.
rm "$root/releases/$b/articles/index.html"
if bash "$script" "$root" "$b" http://127.0.0.1:18983 rollback; then exit 1; fi
test "$(readlink "$root/current")" = "$root/releases/$a"

# Interrupted health verification restores the prior release.
# Restore the exact original bytes required by b's manifest.
printf 'test %s' "$b" > "$root/releases/$b/articles/index.html"
bash "$script" "$root" "$b" http://127.0.0.1:1 rollback >"$root/interrupted.log" 2>&1 &
deployment=$!
for i in {1..50}; do
  [[ "$(readlink "$root/current")" = "$root/releases/$b" ]] && break
  sleep .05
done
kill -TERM "$deployment"
if wait "$deployment"; then exit 1; fi
test "$(readlink "$root/current")" = "$root/releases/$a"
echo 'PASS: corrupt rollback rejection and interrupted release restoration'
