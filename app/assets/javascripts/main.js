//= require store.min
//= require jquery.ba-hashchange.min
//= require slick.grid
//= require lib/api
//= require lib/audio
//= require lib/lastfm
//= require lib/mediator
//= require lib/mediator_events
//= require lib/utils
//= require songlist
//= require components/main

$(document).ready(function () {
  App.songs = [];

  var reactRender = function () {
    React.render(React.createElement(App.Main, {
      loading: !App.songsLoaded || !App.sm2Ready || App.sm2TimedOut,
      sm2TimedOut: App.sm2TimedOut,
      user: App.user,
      songs: App.songs,
      songlist: songlist
    }), document.getElementById('app'));
  };
  reactRender();

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

  App.Mediator.subscribe(MediatorEvents.SM2_READY, function () {
    App.sm2Ready = true;
    App.sm2TimedOut = false;
    reactRender();
  });

  App.Mediator.subscribe(MediatorEvents.SM2_TIMED_OUT, function () {
    App.sm2Ready = false;
    App.sm2TimedOut = true;
    reactRender();
  });

  // Load songs
  App.API.getAllMusic().then(function (data) {
    App.songsLoaded = true;
    App.songs = data;
    songlist.loadData(data);

    reactRender();

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
    var h = $(window).height() - $('#header').outerHeight() - $('#player').outerHeight();
    var w = $(window).width() - $('#sidebar').outerWidth();
    $('#main').css('height', h);
    $('#content-wrap').css('width', w);

    var h2 = h - $('.page-header').innerHeight();
    $('.grid-container').css('height', h2);

    if (songlist) {
      songlist.resizeCanvas();
    }
  }


  // ::: HELPERS :::

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
});
