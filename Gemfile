source 'https://rubygems.org'

ruby '2.2.5'

gem 'rails', '3.2.22.4'

# ID3 info parser
gem 'ruby-mp3info', '0.8.10', :require => 'mp3info'

# Last.fm
gem 'rockstar', '0.8.0'

platforms :jruby do
  gem 'activerecord-jdbcsqlite3-adapter', '1.2.9'

  # Tomcat-based server
  gem 'trinidad', '1.4.6'
end

platforms :ruby, :mingw, :mswin do
  gem 'sqlite3', '1.3.12'
end

group :assets do
  gem 'jquery-rails', '2.0.2'
  gem 'jquery-cookie-rails'

  # Use Sass
  gem 'sass-rails', '3.2.6'

  # Use react
  gem 'react-rails', '0.12.2'

  # Minify & compact JS
  gem 'uglifier', '2.1.1'
end

group :development do
  gem 'quiet_assets'
end

group :test do
  # Mock the filesystem
  gem 'fakefs', '0.5.2', :require => 'fakefs/safe'

  # Mock web requests
  gem 'webmock', '1.18.0'

  gem 'test-unit', '~> 3.0'
end
