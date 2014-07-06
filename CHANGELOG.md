Changelog
=========

## 1.0.1

### Major changes

- Added force_ssl = false as default when running in development and test environments
- Updated Rails from 3.2.12 to 3.2.19
- Updated thin to 1.6.2
- Updated trinidad (for jruby) to 1.4.6

### Minor changes

- Added changelog
- Refactored Song model
- Refactored SongsController
- Refactored User model
- Removed rtaglib gem (not used anywhere)
- Removed unused template `app/views/sessions/destroy.html.erb`
