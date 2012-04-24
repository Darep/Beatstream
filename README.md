# Beatstream #

App for streaming music from any computer running Ruby (and Bundler) to anywhere with a modern browser (Chrome only for now!).

Screenshot: http://i.imgur.com/7P9au.png


### Installation

1. Clone/download & extract this repo somewhere
2. Modify the config/environments/development.rb or production.rb to include the correct MUSIC_PATH
3. Use 'rails console' to create an user: User.create(:username => 'user', :email => 'aa@bb.com', :password => 'asdf', :password_confirmation => 'asdf')
4. Run in Apache+Passenger or WEBrick
5. Log in, go to settings, index the media library, wait and listen to music!

# Installation #

    $ git clone git://github.com/Darep/Beatstream.git
    $ cd Beatstrem
    $ bundle install
    $ rake db:migrate
    $ vim config/enviroments/development.rb
    -> Find config.MUSIC_PATH and change it!
    $ rails console
    -> User.create(:username => 'user', :email => 'aa@testsdfasdf.com', :password => 'asdf', :password_confirmation => 'asdf')
    -> exit
    $ rails server -d 
    
Open Chrome and surf to http://0.0.0.0:3000 address. Log in and wait when indexing ends, refresh page and happy listening!

Copyright (c) 2012 Antti-Jussi Kovalainen (ajk.im)