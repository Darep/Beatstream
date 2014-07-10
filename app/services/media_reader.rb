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

  def self.refresh
    songs = []

    Find.find(MUSIC_PATH) do |file|
      if File.directory?(file) || file !~ /.*\.mp3$/i || file =~ /^\./
        next
      end

      begin
        song = Song.create_from_mp3_file(file, (songs.length + 1))
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
end
