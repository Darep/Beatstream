class SongsController < ApplicationController

  # GET /songs
  def index
    # Backwards compatibility:
    if params[:refresh]
      Rails.logger.info 'Forced songs JSON refresh'
      Song.refresh
    end

    @songs = Song.all
  end

  # GET /songs/:id
  def show
    @song = Song.find(params[:id])
  end

  # GET /songs/:id/play
  def play
    if params[:file].present?
      filepath = params[:file]
    else
      filepath = Song.find(params[:id])['path']
    end

    # Old, simple file-as-text -rendering:
    # song = Song.find_by_path(params[:file])
    # response.content_type = Mime::Type.lookup_by_extension("mp3")
    # render :text => song.binary_stream

    filepath = Song.MUSIC_PATH + filepath
    extension = File.extname(filepath)[1..-1]
    content_type = Mime::Type.lookup_by_extension(extension)
    content_type = content_type.to_s unless content_type.nil?
    # render :file => filepath, :content_type => content_type
    send_file filepath, :type => content_type
  end

  # POST /songs
  def create
    # TODO: song uploading
  end

  # POST /songs/refresh
  def refresh
    # refresh the song list and return new list of songs
    Song.refresh
    render 'index'
  end

end
