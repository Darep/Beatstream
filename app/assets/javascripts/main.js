//= require helpers
//= require store.min
//= require jquery.ba-hashchange.min
//= require slick.grid
//= require routing
//= require lastfm
//= require songlist
//= require pretty-numbers
//= require audio-modules/html5audio
//= require audio-modules/soundmanager2

var keyCode = {
    ENTER: 13
};

soundManager.url = '/swf/';
soundManager.flashVersion = 8; // optional: shiny features (default = 8)
soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
soundManager.useHTML5Audio = true;

$(document).ready(function () { soundManager.onready(function () {

    // resize the main-area to correct height
    resizeMain();
    $(window).resize(function () { resizeMain(); });

    function resizeMain() {
        var h = $(window).height() - $('#wrap > header').outerHeight() - $('#player').outerHeight();
        var w = $(window).width() - $('#sidebar').outerWidth();
        $('#main').css('height', h);
        $('#content-wrap').css('width', w);

        var h2 = h - $('.page-header').innerHeight();
        $('.grid-container').css('height', h2);

        if (songlist) {
            songlist.resizeCanvas();
        }
    }


    // ::: USER MENU :::

    $(window).hashchange(function () {
        Routing.ResolveCurrent();
    });
    

    // ::: INIT songlist / GRID OMG SO BIG SECTION :::
    var songlist = new Songlist({
        onPlay: function (song) {
            var uri = '/songs/play/?file=' + encodeURIComponent(song.path);
            BeatAudio.play(uri);

            playerTrack.text(song.nice_title);
            lastfm.newSong(song);
        }
    });

    var playerTrack = $('#player-song .track');
    var playPause = $('#play-pause');
    var prevButton = $('#prev');
    var nextButton = $('#next');
    var elapsed = $('#player-time .elapsed');
    var duration = $('#player-time .duration');
    var volume_label = $('#player-volume-label');
    var seekbar = $('#seekbar-slider');

    // init audio player
    var error_counter = 0;

    var eventHandlers = {
        onPlay: function () {
            playPause.addClass('playing');
        },
        onPaused: function () {
            playPause.removeClass('playing');
        },
        onSongEnd: function () {
            songlist.nextSong(getShuffle(), getRepeat());
        },
        onTimeChange: function (elaps) {
            elapsedTimeChanged(elaps);

            if (!user_is_seeking) {
                seekbar.slider('option', 'value', elaps);
            }
        },
        onDurationParsed: function (duration_in_seconds) {
            durationChanged(duration_in_seconds);
            seekbar.slider('option', 'disabled', false);
        },
        onError: function () {
            if (error_counter > 2) {
                BeatAudio.pause();
                error_counter = 0;
                return;
            }

            songlist.nextSong(getShuffle(), getRepeat());

            error_counter = error_counter + 1;
        }
    };

    var BeatAudio = null;
    if (location.search == '?a=html5') {
        BeatAudio = new HTML5Audio(eventHandlers);
    }
    else {
        BeatAudio = new SM2Audio(eventHandlers);
    }


    // volume slider
    var volume = 20;

    if (store.get('volume')) {
        volume = parseFloat(store.get('volume'));
    }

    if (volume >= 0 && volume <= 100) {
        BeatAudio.setVolume(volume);
        volume_label.attr('title', volume);
    }

    $('#player-volume-slider').slider({
        orientation: 'horizontal',
        value: volume,
        max: 100,
        min: 0,
        range: 'min',
        slide: function (event, ui) {
            BeatAudio.setVolume(ui.value);
            volume_label.attr('title', ui.value);
        },
        stop: function (event, ui) {
            store.set('volume', ui.value);
        }
    });

    // seekbar
    var user_is_seeking = false;
    seekbar.slider({
        orientation: 'horizontal',
        disabled: true,
        value: 0,
        max: 100,
        min: 0,
        range: 'min',
        slide: function (event, ui) {

        },
        start: function(event, ui) {
            user_is_seeking = true;
        },
        stop: function(event, ui) {
            BeatAudio.seekTo(ui.value);
            user_is_seeking = false;
        }
    });

    // playback buttons
    playPause.click(function (e) {
        e.preventDefault();

        // if not playing anything, start playing the first song on the playlist
        if (!songlist.isPlaying()) {
            songlist.nextSong(getShuffle(), getRepeat());
            return;
        }

        BeatAudio.togglePause();
    });

    nextButton.click(function (e) {
        e.preventDefault();
        songlist.nextSong(getShuffle(), getRepeat(), true);
    });

    prevButton.click(function (e) {
        e.preventDefault();
        songlist.prevSong();
    });

    playerTrack.dblclick(function (e) {
        e.preventDefault();
        
        songlist.scrollNowPlayingIntoView();
    });


    // repeat & shuffle buttons

    var repeatButton = $('#repeat');
    var shuffleButton = $('#shuffle');
    var shuffle = false;
    var repeat = false;

    function newToggleButton(button, key, value) {
        if (store.get(key)) {
            value = store.get(key);
        }
        
        if (value) {
            button.addClass('enabled');
        }

        button.click(function (e) {
            e.preventDefault();

            value = !value;
            store.set(key, value);

            $(this).toggleClass('enabled');
        });
    }

    newToggleButton(repeatButton, 'repeat', repeat);
    newToggleButton(shuffleButton, 'shuffle', shuffle);

    function storeGet(key) {
        if (key && store.get(key)) {
            return store.get(key);
        }
        
        return false;
    }

    function getShuffle() {
        return storeGet('shuffle');
    }

    function getRepeat() {
        return storeGet('repeat');
    }


    // open the current playlist (according to the url)
    // NOTE: atm. always open the "All music" -playlist
    songlist.loadPlaylistByUrl('/songs/index');


    // enable buttons
    $('#player-buttons button').removeAttr('disabled');

    function stop() {
        BeatAudio.stop();
        songlist.resetPlaying();
        
        // TODO: hide now playing icon from slickgrid

        elapsedTimeChanged(0);
        durationChanged(0);
        seekbar.slider('value', 0);
        seekbar.slider('option', 'disabled', true);
        playerTrack.text('None');
    }

    function durationChanged(dur) {
        var mins = Math.floor(dur/60, 10),
            secs = dur - mins*60;

        duration.text((mins > 9 ? mins : '0' + mins) + ':' + (secs > 9 ? secs : '0' + secs));

        seekbar.slider('option', 'max', dur);
    }

    function elapsedTimeChanged(elaps) {
        var mins = Math.floor(elaps/60, 10),
            secs = elaps - mins*60;

        elapsed.text((mins > 9 ? mins : '0' + mins) + ':' + (secs > 9 ? secs : '0' + secs));

        lastfm.scrobble(elaps);
    }

}); });
