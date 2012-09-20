require "mp3info"

class Song
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
        Mp3Info.open(path) do |info|
            tag = info.tag
            @title = tag['title'] if (!tag['title'].nil?)
            @artist = tag['artist'] if (!tag['title'].nil?)
            @album = tag['album']
            @tracknum = tag['tracknum']
            @length = info.length
        end

        @nice_title = ''
        @nice_title += (@artist.to_s + ' - ') if !@artist.nil?
        @nice_title += @title.to_s

        @nice_length = (Time.mktime(0)+@length).strftime("%M:%S")
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
end
