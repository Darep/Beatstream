source 'https://rubygems.org'

gem 'rails', '3.2.1'

gem 'json'

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  #gem 'therubyracer'

  gem 'uglifier', '>= 1.0.3'
end

gem 'jquery-rails'

platforms :jruby do
  gem 'activerecord-jdbcsqlite3-adapter', :require => 'jdbc-sqlite3', :require =>'arjdbc'
#  gem 'ruby-mp3info'
end
platforms :ruby, :mingw, :mswin do
  gem 'sqlite3'
#  gem 'taglib-ruby'
end

gem 'mp3info'
gem 'rtaglib'

gem 'rockstar', :git => 'git://github.com/bitboxer/rockstar.git'

gem 'dynamic_form'

#gem 'mongo_mapper'

# To use ActiveModel has_secure_password
# gem 'bcrypt-ruby', '~> 3.0.0'

# To use Jbuilder templates for JSON
# gem 'jbuilder'

# Use unicorn as the web server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'ruby-debug'
