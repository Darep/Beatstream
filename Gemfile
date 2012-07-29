source 'https://rubygems.org'

gem 'rails', '3.2.1'

# Last.fm API
gem 'rockstar' #, :git => 'git://github.com/bitboxer/rockstar.git'

# ?
gem 'dynamic_form'

gem 'rtaglib'

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
  gem 'jquery-rails'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  gem 'therubyracer', :platforms => :ruby

  # Javascript minifier
  gem 'uglifier'
end

group :development do
  # Hide asset requests from logs
  gem 'quiet_assets'
end

#group :test do
#end
