require 'mp3info'

class Song
  MUSIC_PATH = Rails.application.config.music_paths
  SONGS_JSON_FILE = Rails.root.join('data/songs.json')

  attr_reader :id, :filename, :path, :artist, :title, :album, :tracknum, :length, :year

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
    @year = nil

    # ID3 tag info
    Mp3Info.open(path) do |file|
      tag = file.tag
      @title = tag['title'] if (!tag['title'].nil?)
      @artist = tag['artist'] if (!tag['title'].nil?)
      @album = tag['album']
      @tracknum = tag['tracknum']
      @year = tag['year']
      @length = file.length
    end

    @nice_title = ''
    @nice_title += (@artist.to_s + ' - ') if !@artist.nil?
    @nice_title += @title.to_s

    @nice_length = (Time.mktime(0)+@length).strftime("%M:%S")
  end

  def binary_stream
    File.open(Song.get_path(@path), 'rb') { |f| f.read }
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

  def self.refresh
    songs = []

    Rails.logger.info 'Refreshing songs...'

    Dir.chdir(MUSIC_PATH)
    Dir.glob('**/*').each do |file|
      @invalid = false
      file = Song.sanitize(file)

      if @invalid
        Rails.logger.warn "#{file} Contains Invalid UTF-8 byte sequences"
        # TODO: collect files with invalid UTF-8 and show them to the user
      end

      # Skip directories
      if File.directory?(file)
        next
      end

      # Skip non-mp3 files
      if file !~ /.*\.mp3$/i || file =~ /^\./
        # Rails.logger.info 'Skipping file as not MP3 file: ' + file
        next
      end

      begin
        song = Song.new(file, songs.length)
        songs.push(song)
      rescue Exception => e
        Rails.logger.info 'Failed to load MP3: ' + file
        Rails.logger.info e
        # TODO: collect the broken mp3s into a separate array?
      end
    end

    songs.sort_by! { |song| song.to_natural_sort_string }
    File.open(SONGS_JSON_FILE, 'w') { |f| f.write(songs.to_json) }

    Rails.logger.info 'Done!'
  end

  def self.all
    begin
      self.read_all
    rescue Errno::ENOENT
      Rails.logger.info 'Songs JSON file not found --> refreshing songs list'
      self.refresh
      self.read_all
    end
  end

  def self.read_all
    f = File.open(SONGS_JSON_FILE, 'r')
    Rails.logger.info 'Songs JSON last refreshed on ' + f.mtime.to_s
    f.read
  end

  def self.find_by_path(path)
    Song.new(path, -1)
  end

  def self.get_path(filepath)
    MUSIC_PATH + filepath
  end

  private
    def self.sanitize(str)
      str.each_char.map do |char|
        begin
          char if !!char.unpack('U')
        rescue
          @invalid = true
          "\xEF\xBF\xBD" # => "\uFFFD"
        end
      end.join
    end
end
