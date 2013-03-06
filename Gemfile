source 'https://rubygems.org'

gem 'rails', '3.2.12'

gem 'ruby-mp3info'
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
  gem 'compass'
  gem 'sass-rails'

  gem 'uglifier'
end

group :development do
  gem 'quiet_assets'

  # Better debugging
  gem 'better_errors'
  gem 'binding_of_caller'

  # for RailsPanel
  gem 'meta_request'
end

group :test do

end

group :production do

end
