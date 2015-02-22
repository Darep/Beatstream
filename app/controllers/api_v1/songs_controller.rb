module ApiV1
  class SongsController < ApiController
    # GET /api/v1/songs
    def index
      songs_as_json = Song.all_as_json

      if songs_as_json == '[]'
        Song.refresh
        songs_as_json = Song.all_as_json
      end

      render :text => songs_as_json
    end

    # GET /api/v1/songs/play?file=song.mp3
    def play
      song = Song.new_from_mp3_file(params[:file], -1)
      response.content_type = Mime::Type.lookup_by_extension("mp3")
      render :text => song.as_binary_stream
    end

    # POST /api/v1/songs/refresh
    def refresh
      Song.refresh
      redirect_to :root
    end

    private

      def refresh_and_get_all
        Song.refresh
        Song.all_as_json
      end

  end
end
