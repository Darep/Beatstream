# Beatstream [![Code Climate](https://codeclimate.com/github/Darep/Beatstream/badges/gpa.svg)](https://codeclimate.com/github/Darep/Beatstream) [![Build Status](https://travis-ci.org/Darep/Beatstream.svg?branch=master)](https://travis-ci.org/Darep/Beatstream)

> **IMPORTANT:** I have been experimenting with some re-writes and I'm now slowly porting these changes from my [dev](https://github.com/Darep/Beatstream/tree/dev) branch into `master`. Stay tuned!

---

Beatstream is an app for streaming music from your computer to anywhere with a modern Web browser!
(Beatstream currently requires Ruby to be installed on your computer)

![Screenshot](http://i.imgur.com/oRGwu.png)

### Installation

#### Using host

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

#### Using docker

```bash
$ cp config/initializers/music_paths.rb.sample config/initializers/music_paths.rb
$ docker compose build app
$ docker compose run --rm app bundle install
$ docker compose run --rm app bundle exec rake db:migrate
$ docker compose run --rm app bundle exec rake db:seed
$ docker compose up
```

Open Chrome and surf to http://0.0.0.0:3000 address. Log in using the user on seeds **(username: "admin" and passoword: "pass")** and wait when indexing ends, refresh page and happy listening!


### Known issues

**HTTPS/SSL:** When running in production environment, the app forces SSL on. To disable this, change `config.force_ssl` in `config/environments/production.rb` to false and it shouldn't redirect to https.

**Last.fm:** You need to manually go to `https://localhost:3000/settings` and do the authentication there.

**Media Library:** Opens a blank page after refresh is done. Just go back, and start listening :)

**Flash/Firefox crash:** Beatstream's Flash plugin (SoundManager2) crashes sometimes. Restart browser / Flash.

**UTF-8 problems:** Sometimes song info looks garbled. Sometimes Beastream can't play songs with funny characters in filenames or paths.

**Endlessly spinning loader:** You probably have a Flash block of some kind. Allow Beatstream to use Flash.

These are also listed on [http://www.beatstream.fi/#quirks](http://www.beatstream.fi/#quirks).

### License

Copyright (c) 2012&ndash;2015 Antti-Jussi Kovalainen

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
