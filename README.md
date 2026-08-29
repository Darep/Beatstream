# Beatstream

Beatstream is an app for streaming music from your computer or server to anywhere with a modern Web browser!

![Screenshot](http://i.imgur.com/oRGwu.png)

## Installation

### Docker (Quick Start)

Requirements: Docker

```bash
docker run -d -p 8080:8080 \
  -v /path/to/your/music:/music \
  -v /path/to/your/data:/data \
  -e DATA_PATH=/data \
  darep/beatstream:latest
```

For reproducible deployments, replace `latest` with an exact release version from
[GitHub Releases](https://github.com/Darep/Beatstream/releases).

Open http://0.0.0.0:8080 on your browser. Log in and wait when indexing ends, refresh page and happy listening!

### Manual Install

Requirements: Go 1.26 or newer. Node.js 20 or newer. TagLib (C bindings) e.g. libtagc

```bash
git clone https://github.com/Darep/Beatstream
cd frontend
npm install
npm run build
cd ..
go run .
```

Open http://0.0.0.0:8080 on your browser. Log in and wait when indexing ends, refresh page and happy listening!

## Development

Copy base env vars and modify as you see fit:

```bash
cp .env.example .env
```

Start the Beatstream app:

```bash
go run .
```

Start the frontend development server:

```bash
cd frontend
npm install
npm run dev
```

### Docker

Development with docker:

```bash
cp .env.example .env
docker compose up
```

### Integration test

The Playwright test builds the production Docker image, starts it with a generated audio fixture, and exercises login,
library indexing, streaming, playback controls, search, and logout in headless Chromium. Docker must be running.

```bash
cd frontend
npm ci
npm run test:e2e:install
npm run test:e2e
```

Failed runs keep a screenshot, browser trace, and application logs in `frontend/test-results`. The same test runs on
every push and pull request to `master`.

### Checks

Before committing changes, run:

```bash
make format
make check
```

`make check` verifies Go formatting, vet, tests, development and production builds, frontend formatting and build,
and the Docker Compose image. GitHub Actions runs the same command on every push and pull request to `master`.

### Releasing

Releases follow Semantic Versioning and are published from GitHub Releases.

1. Update `CHANGELOG.md`: move items from `Unreleased` into a new versioned section.
2. Go to https://github.com/Darep/Beatstream/releases/new and publish a new release.
3. The GitHub action workflow will publish the new version to Docker Hub.

To run the Docker release locally, check out the exact release tag and ensure Docker Buildx is available. Publishing
requires a Docker Hub account with permission to push `darep/beatstream`; authenticate it with `docker login` before
running:

```bash
make release
```

The script publishes Linux images for amd64, arm64, and arm/v7 by default. To test the build without Docker Hub
credentials or pushing an image, build only one platform (change it to match the host if needed):

```bash
PUSH=false PLATFORMS=linux/amd64 make release
```

Both commands require `HEAD` to have an exact semantic-version tag, such as `2.2.0`, and publishing also requires a
clean worktree. In GitHub Actions, Docker Hub authentication comes from the `DOCKERHUB_USERNAME` repository variable
and `DOCKERHUB_TOKEN` repository secret.
