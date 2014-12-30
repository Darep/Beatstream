require 'find'

class MediaReader
  MUSIC_PATH = Rails.application.config.music_paths.to_s
  SONGS_JSON_FILE = Rails.root.join('data', 'songs.json').to_s

  def self.MUSIC_PATH
    MUSIC_PATH
  end

  def self.SONGS_JSON_FILE
    SONGS_JSON_FILE
  end

  def self.all
    songs_file.read
  end

  def self.create_song(path, index)
    begin
      Song.new_from_mp3_file(path, index + 1)
    rescue Exception => e
      Rails.logger.info "Failed to load media: #{path}"
      Rails.logger.info e
    end
  end

  def self.files(path)
    Dir.chdir(path)
    return Dir['**/*.{mp3,MP3}']
  end

  def self.refresh
    songs = files(MUSIC_PATH).each_with_index.map {|f,i| create_song(f, i)}
      .select {|s| s.is_a?(Song)}
      .sort_by &:to_natural_sort_string

    songs_file('w').write(songs.to_json)
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
end
