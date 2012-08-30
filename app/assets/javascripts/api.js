
(function (Beatstream, $, document, window, undefined) {

    Beatstream.Api = {
        baseUrl: '',

        init: function (apiBaseUrl) {
            if (apiBaseUrl) {
                this.baseUrl = apiBaseUrl;
            }
        },

        getSongURI: function (songPath) {
            return this.baseUrl + '/songs/play/?file=' + encodeURIComponent(songPath);
        },

        getAllMusic: function () {
            return $.ajax({
                url: this.baseUrl + '/songs',
                dataType: 'json'
            });
        },

        getPlaylist: function (name) {
            return $.ajax({
                url: this.baseUrl + '/playlists/' + encodeURIComponent(name),
                dataType: 'json'
            });
        },

        createPlaylist: function (name) {
            return $.ajax({
                type: 'POST',
                url: this.baseUrl + '/playlists',
                data: { name: name }
            });
        },

        addToPlaylist: function (playlist, songs) {
            // TODO: finish this
            return $.ajax({
                type: 'POST',
                url: this.baseUrl + '/playlists/' + encodeURIComponent(playlist),
                data: songs
            });
        },

        setPlaylistSongs: function (playlist, songs) {
            // TODO: finish this
            return $.ajax({
                type: 'PUT',
                url: this.baseUrl + '/playlists/' + encodeURIComponent(playlist)
            });
        }
    };

})(window.Beatstream = window.Beatstream || {}, jQuery, document, window);
