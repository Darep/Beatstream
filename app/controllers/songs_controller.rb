require 'find'

MUSIC_PATH = Rails.application.config.MUSIC_PATH

class SongsController < ApplicationController

  	def index
  		@songs = Rails.cache.fetch('songs')
  		if @songs.nil? || @songs.empty? || params['refresh']
  			refresh
  		end

  		respond_to do |format|
  			format.json { render :json => @songs }
  		end
  	end

  	def play
  		filename = params[:file]
  		filepath = MUSIC_PATH + filename

		response.content_type = Mime::Type.lookup_by_extension("mp3")

  		render :text => File.open(filepath, 'rb') { |f| f.read }
		#send_file filepath, :type => 'audio/mpeg'
  	end

	private

  	def refresh
		@songs = []
		Find.find(MUSIC_PATH) do |file|
 			next if file !~ /.*\.mp3$/
 			next if File.directory?(file)
 			mp3 = Mp3File.new(file)
 			@songs.push(mp3)
		end
 		Rails.cache.write('songs', @songs, :time_to_idle => 1.minute, :timeToLive => 1440.minutes)
  	end
end

class Mp3File

    attr_reader :filename, :path, :artist, :title, :album, :tracknum, :length

    def initialize(path)
      	file = File.new(path)

      	@filename = File.basename(path)
	    @path = path.gsub(MUSIC_PATH, '')
      	#@size = file.stat.size()

      	@title = @filename
		@artist = ''
		@album = ''
		@tracknum = ''
		@length = 0

      	# ID3 tag info
		begin
      		info = Mp3Info.open(path)
	      	tag = info.tag()
	      	@title = tag['title'] if (!tag['title'].nil?)
	      	@artist = tag['artist'] if (!tag['title'].nil?)
	      	@album = tag['album']
	      	@tracknum = tag['tracknum']
	      	@length = info.length
		rescue Mp3InfoError
			# don't take broken mp3s
			# TODO: collect the broken mp3s into a separate array
			# TODO: tell the caller how many broken mp3s found
		end
      	
        @nice_title = ''
      	@nice_title += (@artist.to_s + ' - ') if (!@artist.nil?)
      	@nice_title += @title.to_s

      	@nice_length = (Time.mktime(0)+@length).strftime("%m:%S")
    end

    def to_s
      	@nice_title
    end

end
