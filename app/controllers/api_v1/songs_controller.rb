module ApiV1
  class SongsController < ApiController
    def index
      songs_as_json = nil
     
      if params[:refresh]
        Rails.logger.info 'Forced song list refresh'
        songs_as_json = refresh_and_get_all
      else
        songs_as_json = Song.all_as_json
        songs_as_json = refresh_and_get_all if songs_as_json == '[]'
      end

      render :text => songs_as_json
    end

    def play

      song = Song.new_from_mp3_file(params[:file], -1)
      response.content_type = Mime::Type.lookup_by_extension("mp3")
      render :text => song.as_binary_stream
      # begin
      #   @history.push(song.id)
      # rescue StandardError => e
      #   @history = Array.new
      #   @history.push(song.id)
      # end
      # cookies[:history] = JSON.generate(@history)
    end

    private

      def refresh_and_get_all
        Song.refresh
        Song.all_as_json
      end

  end
end
