# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

#### Minor changes

- Reduced the Docker runtime image size by removing the Go toolchain and development libraries

## [2.1.0]

#### New features

- Added a quick'n'dirty ugly password change in Settings
- Media library refresh progress is now preserved across page reloads
- Added disc number metadata and disc-aware song sorting
- Exposed song file extensions in the API
- Broke the settings UI visuals
- New song list UI (Glide Data Grid changed back to SlickGrid)

#### Minor changes

- Added version and revision output with `beatstream --version`

#### Security

- Passwords are now stored with bcrypt; existing plaintext passwords are migrated automatically
- Password changes invalidate the user's other sessions

#### Bug fixes

- Preserves the correct playback order when the player opens
- Scroll to the currently playing song when the player opens
- Render HTML special characters correctly in the song list
- Fixed song list and playlist header styling and alignment

## [2.0.0]

#### BREAKING CHANGES!

- Full rewrite in Golang & React

#### Major changes

- Songlist UI component changed temporarily to a worse one

## [1.1.2]

#### Major changes

- Refresh endpoint is now POST /api/v1/songs/refresh, instead of the old GET /songs?refresh=1
- Redirects back to player after refresh

#### Minor changes

- Made text in the player component non-selectable
- JavaScript is now initialized just before `</body>` instead of in the `<head>`

#### Refactoring

- Sass/CSS cleanup
- JS cleanup
- Added a pub-sub system called Mediator
- Added API JavaScript module
- Added App.Audio singleton for audio playback stuff
- lastfm now uses Mediator and the API module
- Moved initial song list fetching, and song count updation from songlist.js to main.js
- Prefixed API HTTP request with "/api/v1/"
- Scrobbling now uses proper HTTP methods instead of GET

## [1.1.1]

#### Bug fixes

- Fix crash on refresh if library contains a broken MP3 file

## [1.1.0]

#### New features

- Continues playing where you left off when you open the app
- Use Ctrl+A or Cmd+A to select all items

#### Bug fixes

- Don't play the same song in a row when shuffling
- Previous button now actually plays the previous song when shuffling

## [1.0.4]

#### Bug fixes

- Fixed a crash bug on initial login or after logging out

## [1.0.3]

#### Major changes

- Added support for Ruby 2.x
- Removed iconv
- Removed automatic redirect to https

#### Minor changes

- Removed Cross-Site Request protection token
- Replaced mp3info gem with ruby-mp3info
- Updated rockstar gem from 0.7.1 to 0.8.0

## [1.0.2]

This is a "refactor release". Version 1.0.2 does not bring anything new, or even
fix things, but instead contains major changes to the code, which might
introduce new bugs. Because of this, I wanted to make it into a completely
independent release. -ajk

#### Major changes

- Ruby 1.8.7 support maybe broken?

#### Minor changes

- None

#### Refactoring

- Scrobbling related code moved into ScrobblesController
- Renamed Rails app internal name to Beatstream (from BeatStream)

## [1.0.1]

#### Major changes

- Added force_ssl = false as default when running in development and test environments
- Updated Rails from 3.2.12 to 3.2.19
- Updated thin to 1.6.2
- Updated trinidad (for jruby) to 1.4.6

#### Minor changes

- Added changelog
- Refactored Song model
- Refactored SongsController
- Refactored User model
- Removed rtaglib gem (not used anywhere)
- Removed unused template `app/views/sessions/destroy.html.erb`

## [1.0]

- Initial release

[Unreleased]: https://github.com/Darep/Beatstream/compare/2.1.0...HEAD
[2.1.0]: https://github.com/Darep/Beatstream/compare/2.0.0...2.1.0
[2.0.0]: https://github.com/Darep/Beatstream/compare/1.1.2...2.0.0
[1.1.2]: https://github.com/Darep/Beatstream/compare/1.1.1...1.1.2
[1.1.1]: https://github.com/Darep/Beatstream/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/Darep/Beatstream/compare/1.0.4...1.1.0
[1.0.4]: https://github.com/Darep/Beatstream/compare/1.0.3...1.0.4
[1.0.3]: https://github.com/Darep/Beatstream/compare/1.0.2...1.0.3
[1.0.2]: https://github.com/Darep/Beatstream/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/Darep/Beatstream/compare/1.0...1.0.1
[1.0]: https://github.com/Darep/Beatstream/releases/tag/1.0
