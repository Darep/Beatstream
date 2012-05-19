//= require store.min

var Playlists = (function () {

    var playlists = store.get('playlists') || [];
    var playlists_next_id = store.get('playlists_next_id') || 0;

    return {
        add: function (playlist) {
            playlists.push(playlist);
            store.set('playlists', playlists);

            playlists_next_id = playlists_next_id + 1;
            store.set('playlists_next_id', playlists_next_id);
        },

        count: function () {
            return playlists.length;
        },

        nextId: function () {
            return playlists_next_id;
        },

        getAtIndex: function (index) {
            return playlists[index];
        }
    };

})();
