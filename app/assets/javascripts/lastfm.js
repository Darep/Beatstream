/*!
 * Beatstream Scrobbling
 */

(function ($, window, document, undefined) {

var lastfm = (function () {

    var scrobble_time = 240,
        song_scrobbled = false,
        song = null;

    function updateNowPlaying() {
        var uri = '/songs/now_playing/?artist=' +
                  encodeURIComponent(song.artist) +
                  '&title=' + encodeURIComponent(song.title);

        $.ajax({
            url: uri,
            success: function () {
                //console.log('Updated now playing to: ' + song.artist + ' - ' + song.title);
            },
            error: function () {
                //console.log('Now playing update failed!');
            }
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

            var uri = '/songs/scrobble/?artist=' +
                      encodeURIComponent(song.artist) +
                      '&title=' + encodeURIComponent(song.title);

            $.ajax({
                url: uri,
                success: function (data) {
                    //console.log('Scrobbled song: ' + song.artist + ' - ' + song.title);
                    //console.log(data);
                },
                error: function () {
                    //console.log('Scrobbling failed!');
                }
            });

            song_scrobbled = true;
        }
    };

}());

window.lastfm = lastfm;

})(jQuery, window, document);
