require 'find'

#MUSIC_PATH = '/Users/ajk/Music/'
MUSIC_PATH = '/Volumes/work/Musa/'

class SongsController < ApplicationController

  	def index
  		@songs = Rails.cache.fetch('songs')
  		if @songs.nil? || @songs.empty? || params['refresh']
  			@songs = []
  			Find.find(MUSIC_PATH) do |file|
	  			next if file !~ /.*mp3$/
  				#mp3info = Mp3Info.open(file)
  				@songs << file.gsub(MUSIC_PATH, '') #+ "(" + mp3info.length.to_s + ")"
  			end
  			@songs.sort!
  			Rails.cache.write('songs', @songs, :time_to_idle => 1.minute, :timeToLive => 10.minutes)
  		end
  	end

  	def play
  		filename = params[:file]
  		filepath = MUSIC_PATH + filename

		send_file filepath, :type => 'audio/mpeg'
  	end
end

class Mp3File

    attr_reader :artist, :album, :title, :file, :path, :length, :type, :mtime
    attr_writer :artist, :album, :title, :file, :path, :length, :type, :mtime

    def initialize(path)
      	file = File.new(path)
      	info = Mp3Info.open(path)
      	tag = info.tag()
      	@file = path
      	@artist = tag['artist']
      	@album = tag['album']
      	@title = tag['title']
	    @path = file.path()
      	@length = file.stat.size()
      	@mtime = file.stat.mtime()
      	@type = 'audio/mpeg'
    end

    def to_s
      	@title
    end

end
