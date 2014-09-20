# Beatstream

**IMPORTANT:** I have been experimenting with some re-writes and I'm now slowly porting these changes from my [dev](https://github.com/Darep/Beatstream/tree/dev) branch into `master`. Stay tuned!

Beatstream is an app for streaming music from your computer to anywhere with a modern Web browser!
(Beatstream currently requires Ruby to be installed on your computer)

![Screenshot](http://i.imgur.com/oRGwu.png)

### Installation

    $ git clone --recursive git://github.com/Darep/Beatstream.git
    $ cd Beatstream
    $ bundle
    $ rake db:migrate
    $ cp config/initializers/music_paths.rb.sample config/initializers/music_paths.rb
    $ nano config/initializers/music_paths.rb
    -> Change 'music_path'
    $ rails console
    -> User.create(:username => 'you', :email => 'you@where.ever', :password => 'secret', :password_confirmation => 'secret')
    -> exit
    $ rails server -d

Open Chrome and surf to http://0.0.0.0:3000 address. Log in and wait when indexing ends, refresh page and happy listening!


### Known issues

Check [http://www.beatstream.fi/#quirks](http://www.beatstream.fi/#quirks) for the most up-to-date list of issues and quirks.

**HTTPS/SSL:** When running in production environment, the app forces SSL on. To disable this, change `config.force_ssl` in `config/environments/production.rb` to false and it shouldn't redirect to https.

### License

Copyright (c) 2012&ndash;2014 Antti-Jussi Kovalainen

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
