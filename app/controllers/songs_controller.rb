# -*- encoding : utf-8 -*-
require 'find'
require 'logger'

MUSIC_PATH = Rails.application.config.music_paths

SONGS_JSON_FILE = Rails.root.join('data/songs.json').to_s

class SongsController < ApplicationController

  def index
    songs_json = '';

    if params[:refresh]
      Rails.logger.info 'Forced song list refresh'
      refresh(songs_json)
    else
      begin
        f = File.open(SONGS_JSON_FILE, 'r')
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
    filepath = MUSIC_PATH + params[:file]

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
      songs = []

      Find.find(MUSIC_PATH) do |file|
        if File.directory?(file) || file !~ /.*\.mp3$/i || file =~ /^\./
          #Rails.logger.info 'Skipping file: ' + file
          next
        end

        begin
          mp3 = Song.new(file, songs.length)
          songs.push(mp3)
        rescue Exception => e
          Rails.logger.info e
          Rails.logger.info 'Failed to load MP3: ' + file
          # TODO: collect the broken mp3s into a separate array
          # TODO: count the broken mp3s
        end
      end

      songs = songs.sort_by { |song| song.to_natural_sort_string }

      songs_as_json = songs.to_json
      File.open(SONGS_JSON_FILE, 'w') { |f| f.write(songs_as_json) }
    end

end
