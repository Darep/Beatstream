# Playback

The user plays a song from the list, sees it as the current song, and controls it with the player bar: play/pause,
previous/next, seek, volume, repeat, and shuffle. Audio streams from the server with HTTP range requests.

## Sub-features

- `play-dblclick` starts a song by double-clicking its row.
- `play-enter` starts the selected row with `Enter`.
- `play-pause` toggles playback with the play/pause button.
- `play-next-prev` moves through the list with `Next` / `Prev`.
- `play-seek` jumps within the track via the seekbar slider.
- `play-volume` changes volume via the volume slider.
- `play-repeat-shuffle` toggles repeat and shuffle modes.

## How to get to it (user POV)

- Double-click a row in the song grid, or click a row and press `Enter`.
- Use the buttons and sliders in the bottom player bar.

## Driving it with Playwright (pw.mjs)

Preconditions:

- Instance from `beatstream.sh up`, `login(page)` and `refreshLibrary(page)` done; 3 rows listed.
- `open()` already launches Chromium with `--autoplay-policy=no-user-gesture-required`.

- **Double-click.** Start
  `page.waitForResponse(r => r.url().includes('/api/songs/play'))`, then
  `page.locator('#slickgrid .slick-row').filter({ hasText: 'Demo B' }).dblclick()`. The response status is `206`,
  `getByText('Current song:').locator('..')` contains `Demo B - 554 Hz.wav`, and
  `#audio` `paused` becomes `false` (poll `page.locator('#audio').evaluate(a => a.paused)`).
- **Pause.** Click `#play-pause` (`Play/pause`). `#audio` `paused` becomes `true`; click again to resume.
- **Next / Prev.** Click `#next`. Current song becomes the next row in the grid's sort order; `#prev` returns.
- **Enter.** Click the first cell of the `Demo A` row, press `Enter`. A new `/api/songs/play` response is `206` and the
  current song is `Demo A - 440 Hz.wav`.
- **Seek.** Click at 50% of the seekbar track (`getByRole('slider').nth(1).locator('..')`, use its `boundingBox()`
  with `page.mouse.click`). `#audio` `currentTime` becomes `3` and `.elapsed` shows `00:03`.
- **Volume.** Click at 10% of the volume track (`getByRole('slider').nth(0).locator('..')`). `#audio` `volume` drops
  from the default `0.25` to about `0.1`.
- **Repeat / Shuffle.** Click `#repeat` and `#shuffle`. Their accessible names change from `Repeat Off` /
  `Shuffle Off` to `Repeat On` / `Shuffle On` and the buttons gain class `enabled`.
- **Proof.** `capture()` before playing, while playing, after pause, after seek, and after toggles. Record each
  `/api/songs/play` status and the `#audio` state you asserted in a `notes.txt`.
  [`examples/playback.mjs`](../examples/playback.mjs) does all of the above:
  `node .agents/skills/verify-beatstream/examples/playback.mjs <URL> <ARTIFACTS>/playback`.

## Gotchas

- Wait for the response promise before double-clicking, or you can miss the request.
- Tracks are 6 s long; with repeat off, playback ends and advances quickly. Pause before slow assertions.
- Slider order: `getByRole('slider').nth(0)` is volume, `.nth(1)` is the seekbar. The `slider` role is the thumb;
  click its parent (the track) to set a position.
- Headless Chromium plays silently; prove playback with `#audio` state and the `206` response, not sound.
