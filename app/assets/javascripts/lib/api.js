var App = window.App || {};

var api = {
    cache: {},
    baseUrl: '/api/v1',

    ajax: function () {
        var url, args;

        /**
          Parse arguments. Supports e.g. `ajax('/some-uri', { type: 'GET' })`
          and `ajax({ url: '/some-uri', type: 'GET' })` and so on.
        */
        if (arguments.length === 1) {
            if (typeof arguments[0] === 'string') {
                url = arguments[0];
                args = {};
            } else {
                args = arguments[0];
                url = args.url;
                delete args.url;
            }
        } else if (arguments.length === 2) {
            url = arguments[0];
            args = arguments[1];
        }

        // Default to GET
        if (!args.type) {
            args.type = 'GET';
        }

        // Default to JSON with GET
        if (!args.dataType && args.type === 'GET') {
            args.dataType = 'json';
        }

        if (!args.errorHandler) {
            args.errorHandler = this.errorHandler;
        }

        return $.ajax(this.buildURL(url), args);
    },

    buildURL: function(url) {
        // If it's an absolute URL, return it
        if (url.indexOf('http') === 0) {
            return url;
        }

        return this.baseUrl + url;
    },

    errorHandler: function(req, textStatus, errorThrown) {
        console.log('Api AJAX error:');
        console.log(req);
        var _this = this;
        if (req.status === 401) {
            // TODO: what do?
        }
    },


    //
    // Songs
    //

    getAllMusic: function() {
        return this.ajax('/songs');
    },

    getSongURI: function(song) {
        return this.buildURL('/songs/play/?file=' + encodeURIComponent(song.path));
    },

    refreshMediaLibrary: function() {
        return this.ajax('/songs?refresh=1', {
            type: 'GET'
        });
    },


    //
    // LastFM
    //

    updateNowPlaying: function(artist, title) {
        var data = 'artist=' + encodeURIComponent(artist) + '&title=' + encodeURIComponent(title);

        return this.ajax('/songs/now_playing', {
            type: 'PUT',
            dataType: 'text',
            data: data
        });
    },

    scrobble: function(artist, title) {
        var data = 'artist=' + encodeURIComponent(artist) + '&title=' + encodeURIComponent(title);

        return this.ajax('/songs/scrobble', {
            type: 'POST',
            dataType: 'text',
            data: data
        });
    }
};

App.API = api;
