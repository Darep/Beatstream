//= require jquery.cookie
//= require store.min
//= require jquery.ba-hashchange.min
//= require slick.grid
//= require lib/audio
//= require lib/lastfm
//= require lib/mediator
//= require lib/mediator_events
//= require lib/utils
//= require routing
//= require songlist

$(document).ready(function () { soundManager.onready(function () {

    var $sidebar = $('#sidebar');

    // resize the main-area to correct height
    resizeMain();
    $(window).resize(function () { resizeMain(); });

    function resizeMain() {
        var h = $(window).height() - $('#wrap > header').outerHeight() - $('#player').outerHeight();
        var w = $(window).width() - $sidebar.outerWidth();
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


    // ::: SIDEBAR :::
    React.render(React.createElement(App.Sidebar, {
        count: '-'
    }), $sidebar[0]);


    // ::: INIT songlist / GRID OMG SO BIG SECTION :::
    var songlist = new Songlist({
        onPlay: function (song) {
            var uri = App.API.getSongURI(song);

            App.Audio.play(uri);

            playerTrack.text(song.nice_title);
            App.lastfm.newSong(song);
        }
    });

    App.Mediator.subscribe(MediatorEvents.AUDIO_STOPPED, function () {
      songlist.nextSong(getShuffle(), getRepeat());
    });

    App.Mediator.subscribe(MediatorEvents.AUDIO_ERROR, function () {
      songlist.nextSong(getShuffle(), getRepeat());
    });


    var playerTrack = $('#player-song .track');
    var playPause = $('#play-pause');
    var prevButton = $('#prev');
    var nextButton = $('#next');
    var elapsed = $('#player-time .elapsed');
    var duration = $('#player-time .duration');
    var volume_label = $('#player-volume-label');
    var seekbar = $('#seekbar-slider');

    // volume slider
    var volume = 20;

    if (store.get('volume')) {
        volume = parseFloat(store.get('volume'));
    }

    if (volume >= 0 && volume <= 100) {
        App.Audio.setVolume(volume);
        volume_label.attr('title', volume);
    }

    $('#player-volume-slider').slider({
        orientation: 'horizontal',
        value: volume,
        max: 100,
        min: 0,
        range: 'min',
        slide: function (event, ui) {
            App.Audio.setVolume(ui.value);
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
            App.Audio.seekTo(ui.value);
            user_is_seeking = false;
        }
    });

    App.Mediator.subscribe(MediatorEvents.AUDIO_TIME, function (elapsed) {
        if (!user_is_seeking) {
            seekbar.slider('option', 'value', elapsed);
        }
    });

    App.Mediator.subscribe(MediatorEvents.AUDIO_DURATION_PARSED, function (durationInSeconds) {
        seekbar.slider('option', 'disabled', false);
        seekbar.slider('option', 'max', durationInSeconds);
    });


    // playback buttons
    playPause.click(function (e) {
        e.preventDefault();

        // if not playing anything, start playing the first song on the playlist
        if (!songlist.isPlaying()) {
            songlist.nextSong(getShuffle(), getRepeat());
            $.cookie('isPlaying', true);
            return;
        }

        App.Audio.togglePause();

        $.cookie('isPlaying', ($.cookie('isPlaying') == 'false'));
    });

    App.Mediator.subscribe(MediatorEvents.AUDIO_PLAYING, function () {
        playPause.addClass('playing');
    });

    App.Mediator.subscribe(MediatorEvents.AUDIO_PAUSED, function () {
        playPause.removeClass('playing');
    });

    nextButton.click(function (e) {
        e.preventDefault();
        songlist.nextSong(getShuffle(), getRepeat(), true);
    });

    prevButton.click(function (e) {
        e.preventDefault();
        songlist.prevSong(getShuffle());
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


    // ::: LOAD SONGS :::
    App.API.getAllMusic().then(function (data) {
        songlist.loadData(data);
        $('.preloader').remove();

        // update song counts
        var count = commify( parseInt( data.length, 10 ) );
        $('.medialibrary.count').text(count);
        $('.page-header .count').text(count);

        // update count text
        $('.page-header .text').html(data.length == 1 ? 'song' : 'songs');
    }, function fail(xhr, status, error) {
        console.log('Failed to fetch songs');
        console.log(xhr, status, error);
    });


    // enable buttons
    $('#player-buttons button').removeAttr('disabled');

    function durationChanged(dur) {
        var mins = Math.floor(dur/60, 10),
            secs = dur - mins*60;

        duration.text((mins > 9 ? mins : '0' + mins) + ':' + (secs > 9 ? secs : '0' + secs));
    }

    function elapsedTimeChanged(elaps) {
        var mins = Math.floor(elaps/60, 10),
            secs = elaps - mins*60;

        elapsed.text((mins > 9 ? mins : '0' + mins) + ':' + (secs > 9 ? secs : '0' + secs));

        $.cookie('time', elaps);  // TODO: use this somewhere
    }

    App.Mediator.subscribe(MediatorEvents.AUDIO_DURATION_PARSED, durationChanged);
    App.Mediator.subscribe(MediatorEvents.AUDIO_TIME, elapsedTimeChanged);

}); });
