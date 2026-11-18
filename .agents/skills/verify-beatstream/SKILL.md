---
name: verify-beatstream
description: Build and run Beatstream (Go music-streaming server + React web UI) from the current checkout in Docker, drive the web UI with Playwright, and capture screenshots/ARIA snapshots as proof. Use when asked to verify, demo, screenshot, or prove a Beatstream change in the real app, and for the AGENTS.md "run it" branch preview on port 8080.
---

# Verify Beatstream

Beatstream's only user surface is the web UI served by the Go binary (`/` plus the `/api/*` JSON endpoints it calls).
There is no CLI beyond `beatstream --version`. Verification always runs the production image from `Dockerfile.hub`,
the same image the e2e test (`frontend/e2e/beatstream.spec.ts`) and Docker Hub use.

Everything goes through one helper, run from the repo root:

```bash
S=.agents/skills/verify-beatstream/scripts
$S/beatstream.sh up | preview | doctor <run-id|preview> | down <run-id> | list
```

## Two modes: verification instance vs. branch preview

| | `up` (verification) | `preview` (AGENTS.md "run it") |
|---|---|---|
| Container | `beatstream-verify-<run-id>` | `beatstream-branch-preview` (replaced) |
| Port | `127.0.0.1:<random>` | `0.0.0.0:8080`, restart `unless-stopped` |
| Music | 3 demo WAVs in `tmp/verify/<run-id>/music`, read-only | 3 demo WAVs copied into volume `beatstream-branch-music` |
| Lifetime | removed by `down` | left running for the user at `http://ajktux:8080` |

Use `up` for proving behavior. It is isolated: any number of runs can coexist, and it never touches the user's preview.
Use `preview` only when the user says "run it" / "start it"; then report `http://ajktux:8080` and `admin` / `admin`.
Do not drive the preview for verification: the user may be using it, and its `users.json` lives inside the
container, so mutations (password changes) would hit their session.

## Launch

```bash
$S/beatstream.sh up
# RUN_ID=20261005-014238-177066
# URL=http://127.0.0.1:32768
# ARTIFACTS=/…/Beatstream/tmp/verify/20261005-014238-177066/artifacts
```

Builds `beatstream:verify-<run-id>` from the working tree (uncommitted changes included; ~20 s cached, several
minutes cold), generates `Demo A - 440 Hz.wav`, `Demo B - 554 Hz.wav`, `Demo C - 659 Hz.wav` (6 s sine tones,
untagged so Artist/Album are empty), and starts the container. It returns only after `GET /api/session` answers `401`,
so the instance is ready when the command exits. Set `RUN_ID=<name>` to choose the id.

The fresh container has the default user `admin` / `admin` and an **empty library**: the songs appear only after
"Refresh media library…" (see [library-refresh](features/library-refresh.md)).

Requires Docker, `python3` (WAV generation), `curl`, and `frontend/node_modules` with Playwright Chromium
(`cd frontend && npm ci && npm run test:e2e:install`).

### Real music

The demo WAVs are untagged. For changes to metadata reading, library refresh, or supported formats, mount the user's
library with `MUSIC_DIR=~/Music` and compare against the base branch built with `REF=master`. See
[real-library.md](real-library.md) for the mount, the comparison recipe, and the files with exotic encodings, scripts,
and formats (Japanese, Finnish, FLAC, Ogg, M4A, damaged MP3s) to check.

## Doctor

Run first, and whenever anything looks off:

```bash
$S/beatstream.sh doctor <run-id>     # or: doctor preview
```

Read-only. Prints container state, URL, the build revision baked into the binary vs. the current checkout
(`STALE` means you edited code after `up`; run `down` + `up` again), and whether `admin`/`admin` can log in.
A changed password (from the settings feature) shows as `login: admin/admin -> HTTP 401`.

## Drive

`scripts/pw.mjs` wraps Playwright from `frontend/node_modules`:

```bash
node $S/pw.mjs <URL> <ARTIFACTS>/smoke   # login → refresh library → captures 01-login, 02-library
```

For a feature, write a short script into the run's artifacts dir (it is part of the proof) and import the helpers:

```js
// tmp/verify/<run-id>/artifacts/playback/drive.mjs
import { open, login, refreshLibrary, capture } from '../../../../../.agents/skills/verify-beatstream/scripts/pw.mjs';
const [url, dir] = process.argv.slice(2);
const { browser, page, errors } = await open(url);
await login(page);
await refreshLibrary(page);
// … feature steps from features/<feature>.md, capture() after each meaningful state …
await browser.close();
if (errors.length) throw new Error(errors.join('; '));
```

```bash
node tmp/verify/<run-id>/artifacts/playback/drive.mjs <URL> tmp/verify/<run-id>/artifacts/playback
```

[`examples/playback.mjs`](examples/playback.mjs) is a complete, proven drive script for the playback feature; copy
its shape (the `until` poll, `waitForResponse` around actions, `notes.txt`) for other features.

Helpers: `open(url, {width, height})` → `{browser, page, errors}` (Chromium with autoplay allowed, page errors
collected); `login(page, user='admin', pass='admin')`; `refreshLibrary(page)`; `capture(page, dir, name)` writes
`<name>.png` and `<name>.aria.txt`.

Stable handles (also used by the e2e spec): login inputs `input[name="username"]` / `input[name="password"]` and button
`Log in`; user menu button named after the user (`admin`) with items `Settings…`, `Refresh media library…`, `Log out`;
song grid `getByRole('grid', { name: 'Songs' })` / `#slickgrid .slick-row`; audio element `#audio`; player buttons
`#prev`, `#play-pause`, `#next`, `#repeat`, `#shuffle`; search `getByPlaceholder('Find songs')` and button `clear`;
settings `getByRole('dialog')` with `Close dialog`. Feature files give the full recipes.

## Evidence

All proof goes to `tmp/verify/<run-id>/artifacts/<feature>/` (gitignored, excluded from the Docker build context,
kept by `down`). A proof contains:

- `capture()` before and after each user action, not only the final screen. The ARIA snapshot is the assertable
  record; the PNG is for humans.
- The drive script itself, so the run can be repeated.
- Side effects observed outside the page where they exist: `/api/songs/play` response status (`206` with `Range`),
  `#audio` `paused`/`currentTime`, a re-login with the new password after a password change,
  `docker logs beatstream-verify-<run-id> > <dir>/server.log` for request lines.
- An empty `errors` array (uncaught page errors fail the proof).

Drive the real UI path: click the menu, double-click rows, type in the search box. Don't call `/api/*` directly or
set store state to reach an end state; the only exception is reading back state (the `#audio` element, server log)
after a user action. Last.fm needs real API keys and an external login; without `LASTFM_API_KEY`/`LASTFM_API_SECRET`
the only verifiable state is "Unavailable". Say so rather than mocking it.

## Cleanup

```bash
$S/beatstream.sh down <run-id>
```

Removes only that run's container, image, and generated music; `tmp/verify/<run-id>/artifacts` survives. Never remove
containers by name pattern or `docker rm` the preview during verification. `$S/beatstream.sh list` shows what exists.
Delete old artifacts with `rm -rf tmp/verify/<run-id>` only when the user no longer needs them.

## Feature map

[`features/README.md`](features/README.md) indexes the user-facing features and their recipes. A proof that drives one
entry point is incomplete when the feature file lists others.
