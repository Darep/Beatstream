class SongsController < ApplicationController

  # GET /songs
  def index
    # Backwards compatibility:
    if params[:refresh]
      Rails.logger.info 'Forced songs JSON refresh'
      Song.refresh
    end

    render :json => Song.all
  end

  # GET /songs/play
  def play
    if params[:file].nil?
      render :status => :bad_request, :text => "missing required parameter 'file'" and return
    end

    # Old, simple file-as-text -rendering:
    # song = Song.find_by_path(params[:file])
    # response.content_type = Mime::Type.lookup_by_extension("mp3")
    # render :text => song.binary_stream

    filepath = Song.get_path(params[:file])
    extension = File.extname(filepath)[1..-1]
    content_type = Mime::Type.lookup_by_extension(extension)
    content_type = content_type.to_s unless content_type.nil?
    # render :file => filepath, :content_type => content_type
    send_file filepath, :type => content_type
  end

  # POST /songs
  def create
    # refresh the song list and return new list of songs
    Song.refresh
    render :json => Song.all
  end

end
