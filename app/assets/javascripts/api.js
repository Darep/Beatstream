
(function (Beatstream, $, document, window, undefined) {

    Beatstream.Api = {
        baseUrl: '',

        init: function (apiBaseUrl) {
            if (apiBaseUrl) {
                this.baseUrl = apiBaseUrl;
            }
        },

        reorderListTasks: function (list_id, data) {
            return $.ajax({
                type: 'POST',
                url: this.baseUrl + '/lists/' + list_id + '/tasks/reorder',
                data: data
            });
        },

        getSongURI: function (songPath) {
            return this.baseUrl + '/songs/play/?file=' + encodeURIComponent(songPath);
        },

        getAllMusic: function () {
            return $.ajax({
                url: this.baseUrl + '/songs',
                dataType: 'json'
            });
        }
    };

})(window.Beatstream = window.Beatstream || {}, jQuery, document, window);
