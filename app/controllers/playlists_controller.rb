class PlaylistsController < ApplicationController
    def index
        playlists = Playlist.all()

        render :text => playlists.to_s
    end

    def new
        # TODO: this
    end
end
