# Settings

The Settings dialog shows the logged-in account, lets the user change their password, and lists listening-service
connections (Last.fm).

## Sub-features

- `settings-account` shows the username in the `Account` panel.
- `settings-password` changes the password; mismatched or wrong passwords show an alert.
- `settings-connections` shows Last.fm status: `Unavailable`, `Not connected`, `Pending`, or `Connected`.
- `settings-close` closes the dialog with `Close dialog`.

## How to get to it (user POV)

- Choose the user menu (`admin`) and `Settings…`.
- Inside the dialog, use the `Settings sections` nav: `Account` and `Connections`.

## Driving it with Playwright (pw.mjs)

Preconditions:

- Instance from `beatstream.sh up`, logged in with `login(page)`. Use a dedicated run: the password change persists in
  the container until `down`.

- **Open.** Click `admin`, then `getByRole('button', { name: 'Settings…' })`. `getByRole('dialog')` shows heading
  `Account` and `dialog.getByRole('code')` reads `admin`.
- **Mismatch.** Click `Change password`. Fill `#current-password` `admin`, `#new-password` `new-pass-1`,
  `#new-password-2` `other`, click `Update password`. `getByRole('alert')` reads `New passwords do not match`.
- **Wrong current.** Fill `#current-password` `nope`, both new fields `new-pass-1`, submit. The alert reads
  `Current password is incorrect`.
- **Change.** Fill `#current-password` `admin`, both new fields `new-pass-1`, submit. The form closes back to `Account`.
- **Confirm persistence.** Log out, then `login(page, 'admin', 'new-pass-1')` succeeds; `admin`/`admin` shows
  `Invalid username or password`. `beatstream.sh doctor <run-id>` now reports `login: admin/admin -> HTTP 401`.
- **Connections.** Reopen Settings, click `getByRole('button', { name: 'Connections' })`. Heading `Connections` and
  `Last.fm` are visible. Without API keys the status is `Unavailable` with the text "this server has not configured API
  credentials".
- **Close.** Click `getByRole('button', { name: 'Close dialog' })`. The dialog is gone.
- **Proof.** `capture()` each panel and alert; the re-login is the side-effect proof for the password change.

## Gotchas

- `beatstream.sh up` does not pass Last.fm credentials, so `Connect Last.fm` is unreachable. Connecting needs real
  `LASTFM_API_KEY`/`LASTFM_API_SECRET` and a Last.fm login in a real browser; report it as unverified instead.
- Never change the password on `beatstream-branch-preview`; the user logs in there with `admin`/`admin`.
- The dialog must stay within the viewport on mobile (`open(url, { width: 390, height: 844 })`); the e2e test asserts
  height under 700 px.
