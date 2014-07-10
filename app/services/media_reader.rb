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
end
