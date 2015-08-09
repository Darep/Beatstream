Changelog
=========

## vNext

#### Major changes

- Added (or re-added?) preloader with a notice if Flash doesn't work

#### Minor changes

#### Refactoring

- Frontend now uses React!
- CSS now loaded with BEMs!
- Removed the non-functioning code to re-open Settings when refreshing with the Settings open


## 1.1.2

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


## 1.1.1

#### Bug fixes

- Fix crash on refresh if library contains a broken MP3 file


## 1.1.0

#### New features

- Continues playing where you left off when you open the app
- Use Ctrl+A or Cmd+A to select all items

#### Bug fixes

- Don't play the same song in a row when shuffling
- Previous button now actually plays the previous song when shuffling


## 1.0.4

#### Bug fixes

- Fixed a crash bug on initial login or after logging out


## 1.0.3

#### Major changes

- Added support for Ruby 2.x
- Removed iconv
- Removed automatic redirect to https

#### Minor changes

- Removed Cross-Site Request protection token
- Replaced mp3info gem with ruby-mp3info
- Updated rockstar gem from 0.7.1 to 0.8.0


## 1.0.2

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


## 1.0.1

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
