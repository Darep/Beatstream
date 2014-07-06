source 'https://rubygems.org'

gem 'rails', '3.2.19'

# ID3 info parser
gem 'mp3info', '0.6.18'

# Last.fm
gem 'rockstar', '0.7.1'

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

  # Use Sass
  gem 'sass-rails', '3.2.6'

  # Minify & compact JS
  gem 'uglifier', '2.1.1'

  # Execute JS in Ruby
  gem 'therubyrhino', '2.0.2', :platform => :jruby
  gem 'therubyracer', '0.11.4', :platform => :ruby
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
