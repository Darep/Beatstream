#!/usr/bin/env bash
# Build and run Beatstream from the current checkout with Dockerfile.hub.
#
#   beatstream.sh up                 isolated verification instance on 127.0.0.1:<random>
#                                    MUSIC_DIR=<dir> mounts that directory instead of the demo tracks
#                                    REF=<git-ref> builds that ref instead of the working tree
#   beatstream.sh preview            the AGENTS.md "run it" preview on 0.0.0.0:8080
#   beatstream.sh doctor <run-id|preview>
#   beatstream.sh down <run-id>      remove a verification instance, keep its artifacts
#   beatstream.sh list               show instances this script started
set -euo pipefail

repo=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
verify_root="$repo/tmp/verify"
preview_name=beatstream-branch-preview
preview_volume=beatstream-branch-music

die() {
	echo "error: $*" >&2
	exit 1
}

revision() {
	local src=${1:-$repo} rev
	rev=$(git -C "$src" rev-parse --short HEAD)
	if [ -n "$(git -C "$src" status --porcelain --untracked-files=no)" ]; then rev="$rev-dirty"; fi
	echo "$rev"
}

build() {
	local src=${2:-$repo}
	docker build --quiet --file "$src/Dockerfile.hub" --tag "$1" \
		--build-arg VERSION=verify --build-arg REVISION="$(revision "$src")" \
		--label beatstream.verify=1 "$src" >/dev/null
}

# Three 6-second mono sine-wave WAVs with distinct names and pitches.
make_demo_tracks() {
	python3 - "$1" <<'PY'
import math, struct, sys, wave
from pathlib import Path

out = Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
for name, freq in [("Demo A - 440 Hz", 440), ("Demo B - 554 Hz", 554), ("Demo C - 659 Hz", 659)]:
    rate = 8000
    with wave.open(str(out / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(b"".join(
            struct.pack("<h", int(3000 * math.sin(2 * math.pi * freq * i / rate))) for i in range(rate * 6)
        ))
PY
}

wait_ready() {
	local url=$1
	for _ in $(seq 60); do
		if [ "$(curl -s -o /dev/null -w '%{http_code}' "$url/api/session")" = 401 ]; then return 0; fi
		sleep 0.5
	done
	die "Beatstream did not answer at $url"
}

host_url() {
	local port
	port=$(docker port "$1" 8080/tcp | head -n1)
	echo "http://127.0.0.1:${port##*:}"
}

cmd_up() {
	local run_id="${RUN_ID:-$(date +%Y%m%d-%H%M%S)-$$}"
	local dir="$verify_root/$run_id"
	local name="beatstream-verify-$run_id"
	local music="${MUSIC_DIR:-$dir/music}"
	mkdir -p "$dir/artifacts"
	if [ -z "${MUSIC_DIR:-}" ]; then make_demo_tracks "$music"; fi
	[ -d "$music" ] || die "MUSIC_DIR $music is not a directory"
	local src=$repo
	if [ -n "${REF:-}" ]; then
		src="$dir/src"
		git -C "$repo" worktree add --force --detach "$src" "$REF" >/dev/null 2>&1 || die "cannot check out $REF"
	fi
	build "beatstream:verify-$run_id" "$src"
	docker run --detach --name "$name" --label beatstream.verify=1 \
		--publish 127.0.0.1::8080 --volume "$(realpath "$music"):/music:ro" \
		"beatstream:verify-$run_id" >/dev/null
	local url
	url=$(host_url "$name")
	wait_ready "$url"
	echo "$url" >"$dir/url"
	echo "RUN_ID=$run_id"
	echo "URL=$url"
	echo "ARTIFACTS=$dir/artifacts"
}

cmd_preview() {
	build "$preview_name:latest"
	docker rm --force "$preview_name" >/dev/null 2>&1 || true
	local tracks
	tracks=$(mktemp -d)
	make_demo_tracks "$tracks"
	docker volume create "$preview_volume" >/dev/null
	docker run --rm --entrypoint cp --volume "$preview_volume:/music" --volume "$tracks:/demo:ro" \
		"$preview_name:latest" -r /demo/. /music/
	rm -rf "$tracks"
	docker run --detach --name "$preview_name" --restart unless-stopped \
		--publish 0.0.0.0:8080:8080 --volume "$preview_volume:/music" "$preview_name:latest" >/dev/null
	wait_ready http://127.0.0.1:8080
	echo "URL=http://ajktux:8080 (login admin / admin)"
}

cmd_doctor() {
	local target=${1:?usage: doctor <run-id|preview>} name url
	if [ "$target" = preview ]; then
		name=$preview_name
		url=http://127.0.0.1:8080
	else
		name="beatstream-verify-$target"
		url=$(host_url "$name" 2>/dev/null) || die "$name has no published port (not running?)"
	fi
	local state
	state=$(docker inspect --format '{{.State.Status}}' "$name" 2>/dev/null) || die "no container $name"
	[ "$state" = running ] || die "$name is $state"
	echo "container: $name running"
	echo "url:       $url"
	local built current
	built=$(docker exec "$name" /beatstream --version)
	if [ -d "$verify_root/$target/src" ]; then current=$(revision "$verify_root/$target/src"); else current=$(revision); fi
	echo "build:     $built"
	case "$built" in
	*"($current)"*) echo "checkout:  $current (matches)" ;;
	*) echo "checkout:  $current (STALE: rebuild before verifying this checkout)" ;;
	esac
	local code
	code=$(curl -s -o /dev/null -w '%{http_code}' -u admin:admin -X POST "$url/api/session")
	if [ "$code" = 200 ]; then echo "login:     admin/admin ok"; else echo "login:     admin/admin -> HTTP $code"; fi
}

cmd_down() {
	local run_id=${1:?usage: down <run-id>}
	docker rm --force "beatstream-verify-$run_id" >/dev/null 2>&1 || true
	docker image rm --force "beatstream:verify-$run_id" >/dev/null 2>&1 || true
	if [ -d "$verify_root/$run_id/src" ]; then git -C "$repo" worktree remove --force "$verify_root/$run_id/src"; fi
	rm -rf "$verify_root/$run_id/music" "$verify_root/$run_id/url"
	echo "removed beatstream-verify-$run_id; artifacts kept in $verify_root/$run_id/artifacts"
}

cmd_list() {
	docker ps --all --filter label=beatstream.verify=1 --format '{{.Names}}\t{{.Status}}\t{{.Ports}}'
	docker ps --all --filter name="^$preview_name\$" --format '{{.Names}}\t{{.Status}}\t{{.Ports}}'
}

cmd=${1:-}
shift || true
case "$cmd" in
up | preview | doctor | down | list) "cmd_$cmd" "$@" ;;
*) sed -n '2,8p' "$0" | sed 's/^# \{0,1\}//' && exit 1 ;;
esac
