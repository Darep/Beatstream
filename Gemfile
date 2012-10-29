source 'https://rubygems.org'

ruby '1.9.3'

gem 'rails', '3.2.8'

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
  gem 'sass-rails'

  gem 'uglifier'
end

group :development do
  gem 'quiet_assets'
end

group :test do

end

group :production do

end
