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
//= require components/player

$(document).ready(function () { soundManager.onready(function () {

    var $header = $('#header');
    var $sidebar = $('#sidebar');
    var $currentSong = $('#player-song');
    var $player = $('#player');
    var $playlistHeader = $('.page-header')

    App.songs = [];

    // ::: ROUTING :::
    $(window).hashchange(function () {
        Routing.ResolveCurrent();
    });


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


    // ::: REACT TRANSITION :::
    var reactRender = function () {
        React.render(React.createElement(App.Header, {
            user: App.user
        }), $header[0]);

        React.render(React.createElement(App.Sidebar, {
            count: App.songs.length
        }), $sidebar[0]);

        React.render(React.createElement(App.PlaylistHeader, {
            count: App.songs.length,
            filter: function (filter) {
                songlist.setFilter(filter);
            }
        }), $playlistHeader[0]);

        React.render(React.createElement(App.Player, {
            songlist: songlist
        }), $player[0]);
    };

    reactRender();


    // repeat & shuffle

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

}); });
