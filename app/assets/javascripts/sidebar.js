//= require helpers
//= require playlists
//= require songlist
//= require transparency.min
/*!
 * Sidebar
 *
 */

(function (Beatstream, $, window, document, undefined) {

    function Sidebar(events_in) {

        var NEW_PLAYLIST_NAME = 'New playlist';

        var events = $.extend({
            onOpenPlaylist: function (listName) {},
            onOpenAllMusic: function () {}
        }, events_in);

        this.events = events;

        var self = this;
        var $sidebar = $('#sidebar');
        var activePlaylist = $sidebar.find('.all-music a');

        this.playlistList = $sidebar.find('.playlists');
        
        // show playlist when playlist name is clicked
        this.getPlaylists().live('click', function (e) {
            e.preventDefault();

            var $this = $(this);

            if ($this.hasClass('insync') || $this.hasClass('act')) {
                return;
            }

            setActivePlaylist($this);

            //alert('Playlists haven\'t been implemented yet. Stay tuned!');

            // load the playlist from URL x
            var name = $this.text();
            events.onOpenPlaylist(name);
        });

        // show "All music" on click
        $sidebar.find('.all-music a').click(function (e) {
            e.preventDefault();

            var $this = $(this);
            if ($this.hasClass('act')) {
                return;
            }

            var name = $this.find('.name').text();

            setActivePlaylist($this);

            events.onOpenAllMusic();
        });


        // New playlist
        var newPlaylistInput = this.playlistList.find('.playlist-input');
        var nameField = newPlaylistInput.find('input');
        var nameErrorField = nameField.next('.error');

        nameField.onEnter(function () {
            var $this = $(this);
            var value = $this.val() || '';
            var list_name = $.trim(value);

            // empty list name, abort
            if (list_name === '') {
                list_item.remove();
                return;
            }

            // TODO: check that there is no list with the same name?
            //       -- or -- do this server-side?

            var playlistInSync = template('.playlist.insync').render({ name: list_name }).clone();
            newPlaylistInput.before(playlistInSync);
            newPlaylistInput.hide();

            // create the playlist
            var req = Beatstream.Api.createPlaylist(list_name);

            req.success(function (data) {
                console.log(playlistInSync);
                playlistInSync.removeClass('insync');
                playlistInSync.find('.sync-icon').remove();
                
                // hide error feedback
                nameField.removeClass('error');
                nameErrorField.hide();
            });

            req.error(function () {
                playlistInSync.remove();
                $('#sidebar .btn-new-list').click();
                
                // show error feedback
                nameField.val(list_name).select().addClass('error');
                nameErrorField.show();
            });

            //  hide "no playlists" text
            self.playlistList.prev('.none').hide();
        });

        $('#sidebar .btn-new-list').click(function (e) {
            e.preventDefault();

            nameField.val(NEW_PLAYLIST_NAME);
            newPlaylistInput.show();
            nameField.focus().select();
        });

        function setActivePlaylist($this) {
            if (activePlaylist !== undefined && activePlaylist.length) {
                activePlaylist.removeClass('act');
            }
            $this.addClass('act');
            activePlaylist = $this;
        }
    }

    Sidebar.prototype.getPlaylists = function () { return this.playlistList.find('a'); };

    Beatstream.Sidebar = Sidebar;

})(window.Beatstream = Beatstream || {}, jQuery, window, document);
