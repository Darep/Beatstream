# Login and session

A visitor must log in before seeing the library. Wrong credentials show an error, a valid login opens the player, the
session survives a page reload, and logging out returns to the login form.

## Sub-features

- `login-reject` shows `Invalid username or password` for bad credentials.
- `login-accept` opens the player with the user menu named after the user.
- `login-persist` keeps the user logged in across a reload (session cookie).
- `logout` returns to the `Log in` heading and drops the session.

## How to get to it (user POV)

- Open the app URL while logged out; the login form is the first screen.
- Choose the user menu (`admin`) and `Log out`.

## Driving it with Playwright (pw.mjs)

Preconditions:

- Fresh instance from `beatstream.sh up`; `doctor` reports `admin/admin ok`.

- **Reject.** Fill `input[name="username"]` with `admin`, `input[name="password"]` with `wrong`, click
  `getByRole('button', { name: 'Log in' })`. `getByText('Invalid username or password')` is visible.
- **Accept.** Fill the password with `admin` and click `Log in` again (or call `login(page)`).
  `getByRole('button', { name: 'admin' })` is visible.
- **Persist.** `page.reload()`. The `admin` button is visible again without the login form.
- **Logout.** Click `admin`, then `getByRole('button', { name: 'Log out' })`.
  `getByRole('heading', { name: 'Log in' })` is visible; another `page.reload()` still shows the login form.
- **Proof.** `capture()` after each step: `01-rejected`, `02-logged-in`, `03-reloaded`, `04-logged-out`.

## Gotchas

- With `DISABLE_LOGIN=true` the login form never appears; `beatstream.sh up` does not set it.
- The login form is a modal over the app shell, so the shell's banner text is in the ARIA snapshot; assert on the
  `Log in` heading, not on the absence of `Beatstream`.
