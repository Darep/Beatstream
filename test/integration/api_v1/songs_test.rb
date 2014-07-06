require 'test_helper'
require 'api_test_helper'

class ApiV1::SongsTest < ActionDispatch::IntegrationTest
  setup do
    FakeFS.deactivate!

    @user = users(:jack)

    fixtures_dir = Rails.root.join('test', 'fixtures')

    # Mock last.fm requests
    stub_request(:post, /https?:\/\/ws\.audioscrobbler\.com\/.*method=track\.updateNowPlaying.*/).
      to_return(:status => 200, :headers => {}, :body => File.new(File.join(fixtures_dir, 'xml/lfm_track_updateNowPlaying.xml')))

    stub_request(:post, /https?:\/\/ws\.audioscrobbler\.com\/.*method=track\.scrobble.*/).
      to_return(:status => 200, :headers => {}, :body => File.new(File.join(fixtures_dir, 'xml/lfm_track_scrobble.xml')))

    # Sample MP3 files
    @one = File.open(File.join(fixtures_dir, 'files', '1sec.mp3')).read
    @thirty = File.open(File.join(fixtures_dir, 'files', '30sec.mp3')).read

    # Mock the filesystem
    FakeFS.activate!

    # Mock the directories required by songs controller
    FileUtils.mkdir_p(Rails.application.config.music_paths)
    FileUtils.mkdir_p(Rails.root.join('data'))

    # Create a few mock MP3 files
    one_mock = File.open(File.join(Rails.application.config.music_paths, '1sec.mp3'), 'wb')
    one_mock.write(@one)

    thirty_mock = File.open(File.join(Rails.application.config.music_paths, '30sec.mp3'), 'wb')
    thirty_mock.write(@thirty)

    # Populate the songs.json file... maybe should do this some other way? :)
    get_json '/songs'

    @songs_json = "[{\"filename\":\"1sec.mp3\",\"path\":\"1sec.mp3\",\"id\":0,\"title\":\"1sec silence\",\"artist\":\"Sample\",\"album\":\"Silence is golden\",\"tracknum\":1,\"length\":1.071,\"nice_title\":\"Sample - 1sec silence\",\"nice_length\":\"00:01\"},{\"filename\":\"30sec.mp3\",\"path\":\"30sec.mp3\",\"id\":1,\"title\":\"30sec silence\",\"artist\":\"Sample\",\"album\":\"Silence is golden\",\"tracknum\":30,\"length\":30.066833333333335,\"nice_title\":\"Sample - 30sec silence\",\"nice_length\":\"00:30\"}]"
  end

  test 'should return all songs from /songs' do
    get_json '/songs'
    assert_equal @songs_json, @response.body
  end

  test 'should return all songs from /songs/index' do
    get_json '/songs/index'
    assert_equal @songs_json, @response.body
  end

  test 'should play song from /songs/play?file=1sec.mp3' do
    get_json '/songs/play?file=1sec.mp3'
    assert_equal @response.body, @one.force_encoding('ASCII-8BIT')
  end

  test 'should play song from /songs/play?file=test_dir/1s.mp3' do
    # setup
    test_dir = File.join(Rails.application.config.music_paths, 'test_dir')
    FileUtils.mkdir_p(test_dir)

    one_mock_in_dir = File.open(File.join(test_dir, '1s.mp3'), 'wb')
    one_mock_in_dir.write(@one)

    # assert
    get_json '/songs/play?file=test_dir/1s.mp3'
    assert_equal @response.body, @one.force_encoding('ASCII-8BIT')
  end

  test 'should send now_playing info to last.fm at /songs/now_playing' do
    session[:user_id] = @user.id
    get '/songs/now_playing?artist=Silence&title=30%20second%20silence', { :format => 'json' }, 'rack.session' => session
    assert_response :success
  end

  test 'should send scrobble to last.fm at /songs/scrobble' do
    session[:user_id] = @user.id
    get '/songs/scrobble?artist=Silence&title=30%20second%20silence', { :format => 'json' }, 'rack.session' => session
    assert_response :success
  end
end
