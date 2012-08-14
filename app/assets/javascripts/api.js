
(function (App, $, document, window, undefined) {

    var Api = {
        baseUrl: '/api/v1',

        init: function (apiBaseUrl) {
            baseUrl = apiBaseUrl;
        },

        reorderListTasks: function (list_id, data) {
            return $.ajax({
                type: 'POST',
                url: baseUrl + '/lists/' + list_id + '/tasks/reorder',
                data: data
            });
        },

        getSongURI: function (songPath) {
            return baseUrl + 'songs/play/?file=' + encodeURIComponent(song.path);
        }
    };

    window.Api = Api;

})(window.App = window.App || {}, jQuery, document, window);
