class Song
  attr_reader :id, :filename, :path, :artist, :title, :album, :tracknum, :length

  def self.all
    JSON.parse(all_as_json)
  end

  def self.all_as_json
    json = MediaReader.all
    json.present? ? json : '[]'
  end

  def self.new_from_mp3_file(path, id)
    # Try to find a non-existing file by appending MUSIC_PATH
    path = File.join(MediaReader.MUSIC_PATH, path) unless File.exists?(path)

    info = Mp3Info.open(path)
    tag = info.tag

    song = Song.new(
      :id       => id,
      :filename => File.basename(path),
      :path     => path.gsub(MediaReader.MUSIC_PATH, ''),
      :title    => tag['title'],
      :artist   => tag['artist'],
      :album    => tag['album'],
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
    MediaReader.refresh
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
    File.join(MediaReader.MUSIC_PATH, self.path)
  end

  def as_binary_stream
    File.open(absolute_path, 'rb').read
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

  def to_s
    nice_title = []
    nice_title << @artist if @artist.present?
    nice_title << @title
    nice_title.join ' - '
  end

end
