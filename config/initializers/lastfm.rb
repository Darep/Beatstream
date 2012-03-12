rails_root = ENV['RAILS_ROOT'] || File.dirname(__FILE__) + '/../..'
Rockstar.lastfm =  YAML.load_file(rails_root + '/config/lastfm.yml')
