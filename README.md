# Beatstream #

App for streaming music from any computer running Ruby on Rails to anywhere with a modern browser.

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