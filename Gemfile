source 'https://rubygems.org'

gem 'rails', '3.2.13'

# ID3 info parser
gem 'ruby-mp3info'

# Last.fm
gem 'rockstar'

platforms :jruby do
  gem 'activerecord-jdbcsqlite3-adapter'

  # Tomcat-based server
  gem 'trinidad'
end

platforms :ruby, :mingw, :mswin do
  gem 'sqlite3'

  # Event-machine -based server
  gem 'thin'
end

group :assets do
  # Use Sass
  gem 'sass-rails'

  # Minify & compact JS
  gem 'uglifier'

  # Execute JS in Ruby
  gem 'therubyrhino', :platform => :jruby
  gem 'therubyracer', :platform => :ruby
end

group :development do
  gem 'quiet_assets'
end
