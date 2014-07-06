source 'https://rubygems.org'

gem 'rails', '3.2.19'

# ID3 info parser
gem 'mp3info'

# Last.fm
gem 'rockstar'

platforms :jruby do
  gem 'activerecord-jdbcsqlite3-adapter'

  # Tomcat-based server
  gem 'trinidad', '1.4.6'
end

platforms :ruby, :mingw, :mswin do
  gem 'sqlite3'

  # Event-machine -based server
  gem 'thin', '1.6.2'
end

group :assets do
  gem 'jquery-rails', '2.0.2'

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
