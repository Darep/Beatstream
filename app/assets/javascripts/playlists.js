//= require helpers
//= require store.min

/*
 * NOTE! This module might seem super dumb and not-needed, but I had plans to
 * add some localStorage optimization to this stuff and so on. Playlists can
 * be really heavy on the memory.
 */

(function (Beatstream, $, window, document, undefined) {

    Beatstream.Playlists = (function () {

        var playlists = {};

        return {
            add: function (name, data) {
                playlists[name] = data;
                console.log(playlists);
            },

            getByName: function (name) {
                var playlist = playlists[name];
                return playlist;
            },

            load: function (name, callback) {
                var req = Beatstream.Api.getPlaylist(name);
                req.success(function (data) {
                    Beatstream.Playlists.add(name, data);

                    if (callback) {
                        var playlist = Beatstream.Playlists.getByName(name);
                        callback(playlist);
                    }
                });
            }
        };
    }());

})(window.Beatstream = window.Beatstream || {}, jQuery, window, document);
