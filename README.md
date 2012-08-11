# Beatstream #

![Screenshot](http://i.imgur.com/oRGwu.png)

Web app for streaming music from any computer running Ruby (and Bundler) to anywhere with a modern browser (Chrome only for now!).

### Installation

    $ git clone git://github.com/Darep/Beatstream.git
    $ cd Beatstream
    $ bundle install
    $ rake db:migrate
    $ nano config/musicpaths.yml
    -> Change 'music_path'
    $ rails console
    -> User.create(:username => 'user', :email => 'aa@testsdfasdf.com', :password => 'asdf', :password_confirmation => 'asdf')
    -> exit
    $ rails server -d 
    
Open Chrome and surf to http://0.0.0.0:3000 address. Log in and wait when indexing ends, refresh page and happy listening!


### License

Copyright (c) 2012 Antti-Jussi Kovalainen

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software with only one restriction: selling
of the Software, or software and associated documentation files derived from it (the
"Derived software"), is only permitted with the
permission of the copyright owner.

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
