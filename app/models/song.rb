require 'find'
require 'iconv'

class Song
  MUSIC_PATH = Rails.application.config.music_paths.to_s
  SONGS_JSON_FILE = Rails.root.join('data', 'songs.json').to_s

  attr_reader :id, :filename, :path, :artist, :title, :album, :tracknum, :length

  def self.MUSIC_PATH
    MUSIC_PATH
  end

  def self.SONGS_JSON_FILE
    SONGS_JSON_FILE
  end

  def self.absolute_path(path)
    File.join(MUSIC_PATH, path)
  end

  def self.all
    JSON.parse(all_as_json)
  end

  def self.all_as_json
    json = songs_file.read
    json.present? ? json : '[]'
  end

  def self.find(param)
    song_hash = all.find { |s| s['id'].to_i == param }
    if song_hash.blank?
      raise ActiveRecord::RecordNotFound, "Couldn't find Song with id=#{param}"
    else
      song_hash
    end
  end

  def self.refresh
    songs = []

    Find.find(MUSIC_PATH) do |file|
      if File.directory?(file) || file !~ /.*\.mp3$/i || file =~ /^\./
        next
      end

      begin
        song = new(file, (songs.length + 1))
        songs.push(song)
      rescue Exception => e
        Rails.logger.info 'Failed to load MP3: ' + file
        Rails.logger.info e
      end
    end

    songs = songs.sort_by { |song| song.to_natural_sort_string }

    songs_as_json = songs.to_json
    songs_file('w').write(songs_as_json)
  end

  def self.songs_file(mode = 'r')
    begin
      file = File.open(SONGS_JSON_FILE, mode)
      Rails.logger.info "Songs JSON last modified on #{file.mtime.to_s}"
    rescue Errno::ENOENT => e
      # File not found
      FileUtils.touch(SONGS_JSON_FILE)
      file = File.open(SONGS_JSON_FILE, mode)
      Rails.logger.info "Songs JSON last modified on #{file.mtime.to_s}"
    end

    return file
  end

  def initialize(path, id)
    @id = id
    @filename = File.basename(path)
    @path = path.gsub(MUSIC_PATH, '')

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

    # convert outgoing strings into valid utf-8

    @title = to_utf8(@title)
    @artist = to_utf8(@artist) if !@artist.nil?
    @album = to_utf8(@album) if !@album.nil?
    @nice_title = to_utf8(@nice_title)
  end

  def absolute_path
    Song.absolute_path(self.path)
  end

  def as_binary_stream
    File.open(self.absolute_path, 'rb').read
  end

  def to_s
    @nice_title
  end

  def to_natural_sort_string
    sortables = []

    sortables << artist if artist.present?
    sortables << album if album.present?
    sortables << ("%03d" % tracknum) if tracknum.present?

    if sortables.any?
      sortables.join(' ')
    else
      filename
    end
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
