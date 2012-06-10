//= require helpers
//= require playlists
//= require songlist
//= require transparency.min
/*!
 * Sidebar
 *
 */

$(document).ready(function () {

    var NEW_PLAYLIST_NAME = 'New playlist';
    var playlists = $('#sidebar .playlists');

    $('#sidebar .playlists a').live('click', function (e) {
        e.preventDefault();

        var $this = $(this);

        if ($this.hasClass('insync')) {
            return;
        }

        //alert('Playlists haven\'t been implemented yet. Stay tuned!');

        var name = $this.text();

        var url = 'playlists/show/' + encodeURIComponent(name);

        $.ajax({
            url: url,
            dataType: 'json',
            success: function () {

            },
            error: function () {
                alert('Playlist cannot be opened right now');
            }
        });
        
    });

    var newPlaylistInput = playlists.find('.playlist-input');
    var nameField = newPlaylistInput.find('input');

    nameField.onEnter(function () {
        var $this = $(this);
        var value = $this.val() || '';
        var list_name = $.trim(value);

        // empty list name, abort
        if (list_name === '') {
            list_item.remove();
            return;
        }

        // TODO: check that there is no list with the same name

        var playlistInSync = template('.playlist.insync').render({ name: list_name }).clone();
        newPlaylistInput.before(playlistInSync);
        newPlaylistInput.hide();

        // TODO: ajax post: create playlist with name list_name
        var data = { name: list_name };
        $.ajax({
            type: 'POST',
            url: 'playlists/new',
            data: data,
            success: function (data) {
                console.log(playlistInSync);
                playlistInSync.removeClass('insync');
                playlistInSync.find('.sync-icon').remove();
            }
        });

        //  hide "no playlists" text
        playlists.prev('.none').hide();
    });

    $('#sidebar .btn-new-list').click(function (e) {
        e.preventDefault();

        nameField.val(NEW_PLAYLIST_NAME);
        newPlaylistInput.show();
        nameField.focus().select();
    });

});
