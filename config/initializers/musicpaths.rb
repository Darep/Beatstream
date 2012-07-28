rails_root = ENV['RAILS_ROOT'] || File.dirname(__FILE__) + '/../..'
Rails.application.config.music_paths =  YAML.load_file(rails_root + '/config/musicpaths.yml')
