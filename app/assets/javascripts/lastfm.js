//= require lib/api

;(function ($, window, document, App, undefined) {

    var scrobble_time = 240,
        song_scrobbled = false,
        song_scrobbling = false;

    window.lastfm = {
        song: undefined,

        newSong: function (song) {
            if (!song) {
                return;
            }

            this.song = song;

            scrobble_time = Math.floor(song.length/2, 10);

            // don't scrobble songs that are under 30 secs (last.fm rule)
            if (scrobble_time <= 15) {
                song_scrobbled = true;
                return;
            }

            // Always scrobble at 4 min mark if song is e.g. 60 minutes long
            if (scrobble_time > 240) {
                scrobble_time = 240;
            }

            App.API.updateNowPlaying(song.artist, song.title).then(function () {
                song_scrobbled = false;
                song_scrobbling = false;
            }, function () {
                song_scrobbled = false;
                song_scrobbling = false;
            });
        },

        scrobble: function (elaps) {
            if (song_scrobbling || song_scrobbled || elaps < scrobble_time || !this.song) {
                return;
            }

            song_scrobbling = true;

            App.API.scrobble(this.song.artist, this.song.title).then(function () {
                song_scrobbled = true;
                song_scrobbling = false;
            }, function () {
                song_scrobbled = true;
                song_scrobbling = false;
            });
        }
    };

})(jQuery, window, document, window.App);
