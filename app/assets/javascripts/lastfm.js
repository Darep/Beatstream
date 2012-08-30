/*!
 * Beatstream Scrobbling
 */

(function ($, window, document, undefined) {

    var lastfm = (function () {

        var scrobble_time = 240,
            song_scrobbled = false,
            song = null;

        function updateNowPlaying() {
            var data = 'artist=' + encodeURIComponent(song.artist) +
                       '&title=' + encodeURIComponent(song.title);

            $.ajax({
                type: 'PUT',
                url: '/api/v1/now-playing',
                data: data
            });
        }

        return {
            newSong: function (song_in) {
                if (!song_in) return;

                song = song_in;

                scrobble_time = Math.floor(song.length/2, 10);
                
                if (scrobble_time > 240) {
                    scrobble_time = 240;
                }

                // don't scrobble songs that are under 30 secs (last.fm rule)
                if (scrobble_time <= 15) {
                    song_scrobbled = true;
                }
                else {
                    song_scrobbled = false;
                    updateNowPlaying();
                }
            },

            scrobble: function (elaps) {
                if (song_scrobbled === true || elaps < scrobble_time || !song) {
                    return;
                }

                var data = 'artist=' + encodeURIComponent(song.artist) +
                           '&title=' + encodeURIComponent(song.title);

                $.ajax({
                    type: 'POST',
                    url: '/api/v1/scrobble',
                    data: data
                });

                song_scrobbled = true;
            }
        };

    }());

    window.lastfm = lastfm;

})(jQuery, window, document);
