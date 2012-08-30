source 'https://rubygems.org'

ruby '1.9.3'

gem 'rails', '3.2.8'

gem 'ruby-mp3info'
gem 'rockstar' #, :git => 'git://github.com/bitboxer/rockstar.git'

gem 'thin'

platforms :jruby do
  gem 'activerecord-jdbcsqlite3-adapter', :require => 'jdbc-sqlite3', :require =>'arjdbc'
end

platforms :ruby, :mingw, :mswin do
  gem 'sqlite3'
end

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails'
  gem 'coffee-rails'
  gem 'jquery-rails', '2.0.2'

  gem 'uglifier'
end

group :development do
  gem 'quiet_assets'
end
