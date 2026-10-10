# Library refresh

The user re-scans the server's music directory from the user menu. During the scan the header shows progress; when it
finishes it shows `Done!` and the song list and counts update.

## Sub-features

- `refresh-empty` shows `No songs in playlist.` and `All music –/0` before the first scan.
- `refresh-run` indexes the music directory from the user menu.
- `refresh-result` lists one row per audio file with title, format, and duration.

## How to get to it (user POV)

- Choose the user menu (`admin`) and `Refresh media library…`.

## Driving it with Playwright (pw.mjs)

Preconditions:

- Fresh instance from `beatstream.sh up`, logged in with `login(page)`.

- **Empty state.** `getByText('No songs in playlist.')` is visible. `capture(page, dir, '01-empty')`.
- **Refresh.** Click `getByRole('button', { name: 'admin' })`, then
  `getByRole('button', { name: 'Refresh media library…' })` (or `refreshLibrary(page)`). `getByText('Done!')` appears.
- **Result.** `getByText('3 songs', { exact: true })` is visible and `#slickgrid .slick-row` has 3 rows titled
  `Demo A - 440 Hz.wav`, `Demo B - 554 Hz.wav`, `Demo C - 659 Hz.wav`, format `WAV`, duration `0:06`.
- **Persistence.** `page.reload()`; the 3 rows are still listed without another refresh.
- **Proof.** `capture()` as `01-empty`, `02-refreshed`, `03-reloaded`; the `02` ARIA snapshot lists the three rows.

## Gotchas

- `Done!` disappears after 5 seconds; wait for it immediately after clicking.
- The demo WAVs are untagged, so the Artist and Album columns are empty and Title falls back to the file name.
- Songs are stored in `songs.json` inside the container; `down` + `up` starts empty again.
