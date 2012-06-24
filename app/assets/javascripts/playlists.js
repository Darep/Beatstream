//= require helpers
//= require store.min

/*
 * NOTE! This module might seem super dumb and not-needed, but I had plans to
 * add some localStorage optimization to this stuff and so on. Playlists can
 * be really heavy on the memory.
 */

(function ($, window, document, undefined) {

    var Playlists = (function () {

        var playlists = {};

        return {
            add: function (name, data) {
                playlists[name] = data;
            },

            getByName: function (name) {
                var playlist = playlists[name];
                return playlist;
            },

            load: function (name, callback) {
                var url = 'playlists/show/' + encodeURIComponent(name);

                $.ajax({
                    url: url,
                    dataType: 'json',
                    success: function(data) {
                        Playlists.add(name, data);

                        if (callback) {
                            var playlist = Playlists.getByName(name);
                            callback(playlist);
                        }
                    }
                });
            }
        };

    })();

    window.Playlists = Playlists;

})(jQuery, window, document);
