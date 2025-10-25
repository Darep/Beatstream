#!/bin/bash

set -euo pipefail

# build & push
docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t darep/beatstream:latest -f Dockerfile.hub --push .

# load image to local docker
docker buildx build --load -t darep/beatstream:latest -f Dockerfile.hub .
