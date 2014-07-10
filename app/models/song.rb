require 'find'
require 'iconv'

class Song
  attr_reader :id, :filename, :path, :artist, :title, :album, :tracknum, :length

  def self.absolute_path(path)
    File.join(MediaReader.MUSIC_PATH, path)
  end

  def self.all
    JSON.parse(all_as_json)
  end

  def self.all_as_json
    json = songs_file.read
    json.present? ? json : '[]'
  end

  def self.create_from_mp3_file(path, id)
    info = Mp3Info.open(path)
    tag = info.tag

    song = Song.new(
      :id       => id,
      :filename => File.basename(path),
      :path     => path.gsub(MediaReader.MUSIC_PATH, ''),
      :title    => to_utf8(tag['title']),
      :artist   => to_utf8(tag['artist']),
      :album    => to_utf8(tag['album']),
      :tracknum => tag['tracknum'],
      :length   => info.length
    )
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
        song = create_from_mp3_file(file, (songs.length + 1))
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

  # Iconv UTF-8 helper
  # Converts string into valid UTF-8
  #
  # @param [String] untrusted_string the string to convert to UTF-8
  # @return [String] passed string in UTF-8
  def self.to_utf8(untrusted_string)
    return untrusted_string if untrusted_string.blank?

    ic = Iconv.new('UTF-8//IGNORE', 'ISO-8859-15')
    ic.iconv(untrusted_string + ' ')[0..-2]
  end

  def initialize(params)
    @id = params[:id]
    @filename = params[:filename] || File.basename(params[:path])
    @path = params[:path]

    @title = params[:title] || @filename
    @artist = params[:artist] || ''
    @album = params[:album] || ''
    @tracknum = params[:tracknum]
    @length = params[:length] || 0
    @nice_title = self.to_s
    @nice_length = (Time.mktime(0) + @length).strftime("%M:%S")
  end

  def absolute_path
    Song.absolute_path(self.path)
  end

  def as_binary_stream
    File.open(self.absolute_path, 'rb').read
  end

  def to_s
    nice_title = []
    nice_title << @artist if @artist.present?
    nice_title << @title
    nice_title.join ' - '
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

end
