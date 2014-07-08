require 'test_helper'

class SongTest < ActiveSupport::TestCase
  setup do
    mock_mp3s
    FakeFS.activate!
  end

  def populate
    Song.refresh
  end

  test 'all returns nil when Songs are not populated' do
    assert_empty Song.all
  end

  test 'all returns Songs as Hashes when Songs are populated' do
    populate
    assert_equal '1sec.mp3', Song.all.first['filename']
  end

  test 'all_as_json returns empty JSON array if Songs are not populated' do
    assert_equal '[]', Song.all_as_json, 'should return empty array [] when there are no Songs loaded into the system'
  end

  test 'all_as_json returns Songs as json when they are populated' do
    populate
    assert_match /"filename": ?"1sec\.mp3"/, Song.all_as_json
  end

  test 'find returns Song with a specific id' do
    populate
    song = Song.find(0)
    assert_equal '1sec.mp3', song['filename']
  end

  test 'find raises ActiveRecord::RecordNotFound for non-existing song' do
    populate
    assert_raise ActiveRecord::RecordNotFound do
      Song.find(1337)
    end
  end

  test 'initialize parses ID3 info' do
    song = Song.new(@one_path, 1)
    assert_equal '1sec silence', song.title
  end

  test 'initialize uses filename if ID3 does not contain title' do
    FakeFS.deactivate!
    id3less = File.join(@fixtures_files_dir, 'id3less.mp3')
    song = Song.new(id3less, 1)
    assert_equal 'id3less.mp3', song.title
  end

  test 'refresh populates the Songs' do
    Song.refresh
    assert_not_empty Song.all_as_json
  end
end
