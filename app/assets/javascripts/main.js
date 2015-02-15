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
    var $header = $('#header');
    var $currentSong = $('#player-song');
    var $playerTime = $('#player-time');
    var $playerOptions = $('#player-buttons-2');

    // resize the main-area to correct height
    resizeMain();
    $(window).resize(function () { resizeMain(); });

    function resizeMain() {
        var h = $(window).height() - $header.outerHeight() - $('#player').outerHeight();
        var w = $(window).width() - $sidebar.outerWidth();
        $('#main').css('height', h);
        $('#content-wrap').css('width', w);

        var h2 = h - $('.page-header').innerHeight();
        $('.grid-container').css('height', h2);

        if (songlist) {
            songlist.resizeCanvas();
        }
    }


    // ::: ROUTING :::
    $(window).hashchange(function () {
        Routing.ResolveCurrent();
    });


    // ::: REACT TRANSITION :::
    App.songs = [];

    var reactRender = function () {
        React.render(React.createElement(App.Header, {
            user: App.user
        }), $header[0]);

        React.render(React.createElement(App.Sidebar, {
            count: App.songs.length
        }), $sidebar[0]);

        React.render(React.createElement(App.CurrentSong, {
            song: App.currentSong
        }), $currentSong[0]);

        React.render(React.createElement(App.PlayerTime, {
            elapsed: App.elapsed,
            duration: App.duration
        }), $playerTime[0]);

        React.render(React.createElement(App.PlayerOptions, {

        }), $playerOptions[0]);
    };

    reactRender();


    // ::: INIT songlist / GRID OMG SO BIG SECTION :::
    var songlist = new Songlist({
        onPlay: function (song) {
            var uri = App.API.getSongURI(song);

            App.Audio.play(uri);

            App.lastfm.newSong(song);
            App.currentSong = song;
            reactRender();
        }
    });

    App.Mediator.subscribe(MediatorEvents.AUDIO_STOPPED, function () {
      songlist.nextSong(getShuffle(), getRepeat());
    });

    App.Mediator.subscribe(MediatorEvents.AUDIO_ERROR, function () {
      songlist.nextSong(getShuffle(), getRepeat());
    });


    var playerTrack = $currentSong.find('.track');
    var playPause = $('#play-pause');
    var prevButton = $('#prev');
    var nextButton = $('#next');
    var elapsed = $playerTime.find('.elapsed');
    var duration = $playerTime.find('.duration');
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


    // repeat & shuffle buttons

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
        App.songs = data;

        songlist.loadData(data);
        reactRender();

        $('.preloader').remove();

        // update song counts
        var count = commify( parseInt( data.length, 10 ) );
        $('.page-header .count').text(count);

        // update count text
        $('.page-header .text').html(data.length == 1 ? 'song' : 'songs');
    }, function fail(xhr, status, error) {
        console.log('Failed to fetch songs');
        console.log(xhr, status, error);
    });


    // enable buttons
    $('#player-buttons button').removeAttr('disabled');

    function durationChanged(duration) {
        App.duration = duration;
        reactRender();
    }

    function elapsedTimeChanged(elapsed) {
        App.elapsed = elapsed;
        reactRender();
    }

    App.Mediator.subscribe(MediatorEvents.AUDIO_DURATION_PARSED, durationChanged);
    App.Mediator.subscribe(MediatorEvents.AUDIO_TIME, elapsedTimeChanged);

}); });
