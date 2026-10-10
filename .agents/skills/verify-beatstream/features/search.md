# Search

The user types in `Find songs` to filter the current list by any column, sees an empty state when nothing matches, and
clears the query to restore the full list.

## Sub-features

- `search-match` narrows the grid to matching rows and updates the song count.
- `search-empty` shows `No songs found.` for a query with no matches.
- `search-clear` restores the full list with the `clear` button.

## How to get to it (user POV)

- Type in the `Find songs` box at the top right of the song list.

## Driving it with Playwright (pw.mjs)

Preconditions:

- Instance from `beatstream.sh up`, `login(page)` and `refreshLibrary(page)` done; `3 songs` listed.

- **Match.** `getByPlaceholder('Find songs').fill('554')`. `#slickgrid .slick-row` has 1 row containing
  `Demo B - 554 Hz.wav`.
- **Empty.** Fill `not-in-the-library`. `getByText('No songs found.')` is visible.
- **Clear.** Click `getByRole('button', { name: 'clear' })`. `No songs found.` is hidden, the box is empty, and
  `getByText('3 songs', { exact: true })` is visible.
- **Proof.** `capture()` as `01-match`, `02-empty`, `03-cleared`.

## Gotchas

- The header count reflects the filtered list; assert on rows and the count together.
- Typing while a grid row has focus does not reach the search box; click or `fill` the box directly.
