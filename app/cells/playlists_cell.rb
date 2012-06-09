class PlaylistsCell < Cell::Base 
    def index
        # TODO: get users playlists
        @playlists = []
        render
    end
end