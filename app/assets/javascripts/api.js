
(function (App, $, document, window, undefined) {

    var Api = {
        baseUrl: '/api/v1',

        init: function (apiBaseUrl) {
            if (baseUrl) {
                baseUrl = apiBaseUrl;
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
        }
    };

    window.Api = Api;

})(window.App = window.App || {}, jQuery, document, window);
