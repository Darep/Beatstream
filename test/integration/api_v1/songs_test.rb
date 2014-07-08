require 'test_helper'
require 'api_test_helper'

require 'iconv' if RUBY_VERSION.starts_with? '1.8'

class ApiV1::SongsTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:jack)

    # Mock last.fm requests
    fixtures_dir = Rails.root.join('test', 'fixtures')
    stub_request(:post, /https?:\/\/ws\.audioscrobbler\.com\/.*method=track\.updateNowPlaying.*/).
      to_return(:status => 200, :headers => {}, :body => File.new(File.join(fixtures_dir, 'xml/lfm_track_updateNowPlaying.xml')))

    stub_request(:post, /https?:\/\/ws\.audioscrobbler\.com\/.*method=track\.scrobble.*/).
      to_return(:status => 200, :headers => {}, :body => File.new(File.join(fixtures_dir, 'xml/lfm_track_scrobble.xml')))

    mock_mp3s
    FakeFS.activate!

    # Populate the Songs
    Song.refresh

    @songs_json = "[{\"id\":0,\"filename\":\"1sec.mp3\",\"path\":\"1sec.mp3\",\"title\":\"1sec silence\",\"artist\":\"Sample\",\"album\":\"Silence is golden\",\"tracknum\":1,\"length\":1.071,\"nice_title\":\"Sample - 1sec silence\",\"nice_length\":\"00:01\"},{\"id\":1,\"filename\":\"30sec.mp3\",\"path\":\"30sec.mp3\",\"title\":\"30sec silence\",\"artist\":\"Sample\",\"album\":\"Silence is golden\",\"tracknum\":30,\"length\":30.066833333333335,\"nice_title\":\"Sample - 30sec silence\",\"nice_length\":\"00:30\"}]"
  end

  def in_binary(string)
    if RUBY_VERSION.starts_with? '1.8'
      ::Iconv.conv('UTF-8//IGNORE', 'ASCII-8BIT', string)
    else
      @one.force_encoding('ASCII-8BIT')
    end
  end

# /songs

  test 'should return all songs from /songs' do
    get_json '/songs'
    assert_equal @songs_json, @response.body
  end

  test 'should return all songs from /songs/index' do
    get_json '/songs/index'
    assert_equal @songs_json, @response.body
  end

# songs.json

  test 'should create all songs index if it\'s missing' do
    new_song = File.open(File.join(Rails.application.config.music_paths, 'new_song.mp3'), 'wb')
    new_song.write(@one)

    # Populate the songs.json file
    File.delete Rails.root.join('data/songs.json')
    get_json '/songs'

    # Get the new list of songs
    get_json '/songs'

    match = false
    json_response.each { |i| match ||= (i['path'] == 'new_song.mp3') }

    assert match, 'new_song not found in JSON response'
  end

  test 'should refresh songs index when ?refresh is present' do
    new_song = File.open(File.join(Rails.application.config.music_paths, 'new_song.mp3'), 'wb')
    new_song.write(@one)

    # Trigger the refresh
    get_json '/songs?refresh=true'

    # Ask for the index again
    get_json '/songs'

    match = false
    json_response.each { |i| match ||= (i['path'] == 'new_song.mp3') }

    assert match, 'new_song not found in JSON response'
  end

# /songs/play

  test 'should play song from /songs/play?file=1sec.mp3' do
    get_json '/songs/play?file=1sec.mp3'
    assert_equal @response.body, in_binary(@one)
  end

  test 'should play song from /songs/play?file=test_dir/1s.mp3' do
    # setup
    test_dir = File.join(Rails.application.config.music_paths, 'test_dir')
    FileUtils.mkdir_p(test_dir)

    one_mock_in_dir = File.open(File.join(test_dir, '1s.mp3'), 'wb')
    one_mock_in_dir.write(@one)

    # assert
    get_json '/songs/play?file=test_dir/1s.mp3'
    assert_equal @response.body, in_binary(@one)
  end
end
