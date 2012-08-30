task :test_mp3info => :environment do
    MUSIC_PATH = '/Users/ajk/Music/'
    hells = Song.new(MUSIC_PATH + 'ACDC/acdc-hells_bells-aaf.mp3', 0)
    puts '--------------------------------------------------'
    rnr = Song.new(MUSIC_PATH + "ACDC/AC-DC - High Voltage/02. Rock 'N' Roll Singer.mp3", 1)
end
