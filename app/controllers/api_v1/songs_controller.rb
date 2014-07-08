# -*- encoding : utf-8 -*-
require 'find'
require 'logger'

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
      filepath = Song.MUSIC_PATH + params[:file]

      response.content_type = Mime::Type.lookup_by_extension("mp3")

      render :text => File.open(filepath, 'rb') { |f| f.read }
      #send_file filepath, :type => 'audio/mpeg'
    end

    def now_playing
      expires_now # don't cache

      artist = params[:artist]
      title = params[:title]

      @user = User.find(session[:user_id])

      if @user != nil && @user.lastfm_session_key != nil
        Rails.logger.info 'Update Now Playing to "' + artist + ' - ' + title + '" for user ' + @user.username

        track = Rockstar::Track.new(artist, title)
        track.updateNowPlaying(Time.now, @user.lastfm_session_key)
      end

      respond_to do |format|
        format.json { render :nothing => true }
      end
    end

    def scrobble
      expires_now # don't cache

      artist = params[:artist]
      title = params[:title]

      @user = User.find(session[:user_id])

      if @user != nil && @user.lastfm_session_key != nil
        Rails.logger.info 'Scrobbling track "' + artist + ' - ' + title + '" for user ' + @user.username

        track = Rockstar::Track.new(artist, title)
        track.scrobble(Time.now, @user.lastfm_session_key)
      end

      respond_to do |format|
        format.json { render :nothing => true }
      end
    end

    private

      def refresh_and_get_all
        Song.refresh
        Song.all_as_json
      end

  end
end
