//= require lib/jquery_onenter
//= require playlists
//= require songlist
/*!
 * Sidebar
 *
 */

$(document).ready(function () {
    'use strict';

    var $sidebar = $('#sidebar');
    var NEW_PLAYLIST_NAME = 'New playlist';

    for (var i = 0; i < Playlists.count(); i++) {
        var playlist = Playlists.getAtIndex(i);
        var id = playlist.id;
        var name = playlist.name;
        $sidebar.find('.playlists').append('<li><a href="#" data-id="' + id + '">' + name + '</a></li>');
    }

    $sidebar.find('.playlists a').click(function () {
        var id = $(this).attr('data-id');

        return false;
    });

    $sidebar.find('.new-list').click(function () {
        var list_item  = $('<li></li>');
        var rename_field = $('<input type="text" name="list-name" value="' + NEW_PLAYLIST_NAME + '" />');

        rename_field.onEnter(function () {
            var $this = $(this),
                value = $this.val() || '',
                list_name = $.trim(value);

            if (list_name === '') {
                list_item.remove();
                return;
            }

            var playlist = {
                id: Playlists.nextId(),
                name: list_name,
                data: {}
            };

            Playlists.add(playlist);

            rename_field.replaceWith('<a href="#" data-id="' + playlist.id + '">' + playlist.name + '</a>');
        });

        list_item.append(rename_field);
        $sidebar.find('.playlists').append(list_item);
        rename_field.focus();

        return false;
    });

});
