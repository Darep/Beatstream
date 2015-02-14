source 'https://rubygems.org'

gem 'rails', '3.2.19'

# ID3 info parser
gem 'ruby-mp3info', '0.8.4', :require => 'mp3info'

# Last.fm
gem 'rockstar', '0.8.0'

platforms :jruby do
  gem 'activerecord-jdbcsqlite3-adapter', '1.2.9'

  # Tomcat-based server
  gem 'trinidad', '1.4.6'
end

platforms :ruby, :mingw, :mswin do
  gem 'sqlite3', '1.3.7'

  # Event-machine -based server
  gem 'thin', '1.6.2'
end

group :assets do
  gem 'jquery-rails', '2.0.2'
  gem 'jquery-cookie-rails'

  # Use Sass
  gem 'sass-rails', '3.2.6'

  # User react
  gem 'react-rails', '~> 0.12.0'

  # Minify & compact JS
  gem 'uglifier', '2.1.1'
end

group :development do
  gem 'quiet_assets'
end

group :test do
  # Mock the filesystem
  gem 'fakefs', :require => 'fakefs/safe'

  # Mock web requests
  gem 'webmock'
end
