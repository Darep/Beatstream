# Beatstream verification map

This directory is the maintained source for verifying the user-facing behavior of Beatstream's web UI. Read the index
before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Start an isolated instance with `.agents/skills/verify-beatstream/scripts/beatstream.sh up` and note `RUN_ID`, `URL`,
  and `ARTIFACTS`.
- `beatstream.sh doctor <run-id>` reports `running`, a build revision that matches the checkout, and `admin/admin ok`.
- The music directory holds exactly `Demo A - 440 Hz.wav`, `Demo B - 554 Hz.wav`, and `Demo C - 659 Hz.wav`.
- The library starts empty. Every recipe except login assumes the library was refreshed once (`refreshLibrary`).
- Never drive `beatstream-branch-preview` or any instance this run did not start.

## Driving conventions

- Drive with Playwright through `scripts/pw.mjs` (`open`, `login`, `refreshLibrary`, `capture`).
- Prefer roles and accessible names; fall back to the element ids listed in each file.
- Wait for a visible state (`waitFor`, `expect.poll`-style loops), never fixed sleeps.
- Save each drive script next to its artifacts in `<ARTIFACTS>/<feature>/`.

## Proof and skip reporting

- Capture before and after each user action with `capture(page, dir, name)`.
- Include side-effect evidence named in the feature file (HTTP status, `#audio` state, re-login, server log).
- Fail the proof on any collected page error.
- Report an unverifiable path (for example, Last.fm without API keys) with the missing precondition. Do not report it
  as verified through a different path.

## Features

- [Login and session](./login.md) covers invalid and valid login, session persistence on reload, and logout.
- [Library refresh](./library-refresh.md) covers indexing the music directory from the user menu.
- [Playback](./playback.md) covers starting songs by double-click and keyboard, pause, next/prev, seek, volume,
  repeat, and shuffle.
- [Search](./search.md) covers filtering the song list, the empty state, and clearing.
- [Settings](./settings.md) covers the account panel, password change, and the Last.fm connections panel.
