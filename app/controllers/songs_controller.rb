# -*- encoding : utf-8 -*-
require 'find'
require 'logger'

MUSIC_PATH = Rails.application.config.music_paths['music_path']

SONGS_JSON_FILE = Rails.root.join('public/songs.json')

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
                mp3 = Mp3File.new(file, songs.length)
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

class Mp3File

    attr_reader :id, :filename, :path, :artist, :title, :album, :tracknum, :length

    def initialize(path, id)
        #file = File.new(path)
        #@size = file.stat.size()

        @filename = File.basename(path)
        @path = path.gsub(MUSIC_PATH, '')
        @id = id

        @title = @filename
        @artist = ''
        @album = ''
        @tracknum = nil
        @length = 0

        # ID3 tag info
        info = Mp3Info.open(path)
        tag = info.tag()
        @title = tag['title'] if (!tag['title'].nil?)
        @artist = tag['artist'] if (!tag['title'].nil?)
        @album = tag['album']
        @tracknum = tag['tracknum']
        @length = info.length
        
        @nice_title = ''
        @nice_title += (@artist.to_s + ' - ') if !@artist.nil?
        @nice_title += @title.to_s

        @nice_length = (Time.mktime(0)+@length).strftime("%M:%S")

        # convert outgoing strings into valid utf-8

        @title = to_utf8(@title)
        @artist = to_utf8(@artist) if !@artist.nil?
        @album = to_utf8(@album) if !@album.nil?
        @nice_title = to_utf8(@nice_title)
    end

    def to_s
        @nice_title
    end

    def to_natural_sort_string
        str = ""
        str += artist if !artist.nil?
        str += ' ' + album if !album.nil?

        # dumb ass way to achieve natural sorting
        if !tracknum.nil?
            track = tracknum.to_s
            
            if tracknum < 100
                track = "0" + track
            end
            if tracknum < 10
                track = "0" + track
            end

            str += ' ' + track
        end

        if str.empty?
            str = filename
        end

        str
    end

    private

    # Iconv UTF-8 helper
    # Converts string into valid UTF-8
    #
    # @param [String] untrusted_string the string to convert to UTF-8
    # @return [String] passed string in UTF-8
    def to_utf8 untrusted_string=""
        ic = Iconv.new('UTF-8//IGNORE', 'ISO-8859-15')
        ic.iconv(untrusted_string)
        #ic.iconv(untrusted_string + ' ')[0..-2]
    end
end
