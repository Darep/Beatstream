require 'find'

MUSIC_PATH = Rails.application.config.MUSIC_PATH

class SongsController < ApplicationController

  	def index
  		@songs = Rails.cache.fetch('songs')
  		if @songs.nil? || @songs.empty? || params['refresh']
  			refresh
  		end

  		respond_to do |format|
  			format.html
  			format.json { render :json => @songs }
  		end
  	end

  	def refresh
		@songs = []
		Find.find(MUSIC_PATH) do |file|
 			next if file !~ /.*\.mp3$/
			begin
	 			mp3 = Mp3File.new(file)
	 			@songs.push(mp3)
			rescue Mp3InfoError
				# don't take broken mp3s
				# TODO: collect the broken mp3s into a separate array
				# TODO: tell the caller how many broken mp3s found
			end
		end
 		Rails.cache.write('songs', @songs, :time_to_idle => 1.minute, :timeToLive => 1440.minutes)
  	end

  	def play
  		filename = params[:file]
  		filepath = MUSIC_PATH + filename

		response.content_type = Mime::Type.lookup_by_extension("mp3")

  		render :text => File.open(filepath, 'rb') { |f| f.read }
		#send_file filepath, :type => 'audio/mpeg'
  	end
end

class Mp3File

    attr_reader :file, :filename, :path, :artist, :title, :album, :tracknum, :length, :type, :mtime

    def initialize(path)
      	file = File.new(path)
      	info = Mp3Info.open(path)
      	tag = info.tag()
      	
      	@file = path
      	@filename = File.basename(path)
      	@artist = tag['artist']
      	@title = tag['title']
      	@album = tag['album']
      	@tracknum = tag['tracknum']
      	@length = info.length

	    @path = file.path().gsub(MUSIC_PATH, '')
      	@size = file.stat.size()
      	@type = 'audio/mpeg'
      	@mtime = file.stat.mtime()

      	@nice_title = (@artist || @title ? @artist.to_s + " - " + @title.to_s : @filename)
      	@nice_length = (Time.mktime(0)+@length).strftime("%M:%S")
    end

    def to_s
      	@nice_title
    end

end
