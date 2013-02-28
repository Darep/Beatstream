source 'https://rubygems.org'

gem 'rails', '3.2.12'

gem 'mp3info'
gem 'rtaglib'
gem 'rockstar' #, :git => 'git://github.com/bitboxer/rockstar.git'

platforms :jruby do
  gem 'therubyrhino'
  gem 'activerecord-jdbcsqlite3-adapter', :require => 'jdbc-sqlite3', :require =>'arjdbc'
  gem 'trinidad'
end

platforms :ruby, :mingw, :mswin do
  gem 'therubyracer'
  gem 'sqlite3'
  gem 'thin'
end

group :assets do
  gem 'jquery-rails', '2.0.2'
  gem 'sass-rails'
  gem 'uglifier'
end

group :development do
  gem 'quiet_assets'
end
