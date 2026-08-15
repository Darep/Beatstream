#!/usr/bin/env bash

set -euo pipefail

push=${PUSH:-true}
platforms=${PLATFORMS:-linux/amd64,linux/arm64,linux/arm/v7}

if [[ "$push" != true && "$push" != false ]]; then
  echo "PUSH must be true or false" >&2
  exit 1
fi

if [[ "$push" == true && -n "$(git status --porcelain)" ]]; then
  echo "refusing to publish from a dirty worktree" >&2
  exit 1
fi

tag=$(git describe --tags --exact-match HEAD 2>/dev/null) || {
  echo "HEAD must have an exact version tag" >&2
  exit 1
}

if [[ ! "$tag" =~ ^v?([0-9]+)\.([0-9]+)\.([0-9]+)(-[0-9A-Za-z.-]+)?$ ]]; then
  echo "tag must be a semantic version, such as 2.1.0" >&2
  exit 1
fi

version=${tag#v}
major=${BASH_REMATCH[1]}
minor=${BASH_REMATCH[2]}
revision=$(git rev-parse HEAD)
created=$(git show -s --format=%cI HEAD)

tags=(--tag "darep/beatstream:$version")
if [[ -z "${BASH_REMATCH[4]}" ]]; then
  tags+=(
    --tag "darep/beatstream:$major.$minor"
    --tag "darep/beatstream:$major"
    --tag "darep/beatstream:latest"
  )
fi

output=()
if [[ "$push" == true ]]; then
  output+=(--push)
fi

docker buildx build \
  --file Dockerfile.hub \
  --platform "$platforms" \
  --build-arg "VERSION=$version" \
  --build-arg "REVISION=$revision" \
  --label "org.opencontainers.image.created=$created" \
  --label "org.opencontainers.image.description=Music streaming server/app" \
  --label "org.opencontainers.image.licenses=MIT" \
  --label "org.opencontainers.image.revision=$revision" \
  --label "org.opencontainers.image.source=https://github.com/Darep/Beatstream" \
  --label "org.opencontainers.image.title=Beatstream" \
  --label "org.opencontainers.image.url=https://github.com/Darep/Beatstream" \
  --label "org.opencontainers.image.version=$version" \
  --provenance=mode=max \
  "${tags[@]}" \
  "${output[@]}" \
  .
