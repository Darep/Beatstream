# -*- encoding : utf-8 -*-
require 'find'
require 'logger'

module ApiV1
  class SongsController < ApiController

    def index
      songs_json = '';

      if params[:refresh]
        Rails.logger.info 'Forced song list refresh'
        refresh(songs_json)
      else
        begin
          f = File.open(Song.SONGS_JSON_FILE, 'r')
          Rails.logger.info 'Songs JSON modified: ' + f.mtime.to_s
          songs_json = f.read
        rescue Errno::ENOENT
          Rails.logger.info 'Songs JSON file not found --> refreshing songs list'
          refresh(songs_json)
        end
      end

      render :text => songs_json
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

      def refresh(songs_as_json)
        Song.refresh
        songs_as_json = Song.all_as_json
      end

  end
end
