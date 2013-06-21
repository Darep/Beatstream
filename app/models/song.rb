MUSIC_PATH = Rails.application.config.music_paths

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
