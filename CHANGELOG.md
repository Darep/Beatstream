Changelog
=========

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
