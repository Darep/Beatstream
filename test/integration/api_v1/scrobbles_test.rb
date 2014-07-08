require 'test_helper'
require 'api_test_helper'

class ApiV1::ScrobblesTest < ActionDispatch::IntegrationTest
  setup do
    # Mock last.fm requests
    fixtures_dir = Rails.root.join('test', 'fixtures')

    stub_request(:post, /https?:\/\/ws\.audioscrobbler\.com\/.*method=track\.updateNowPlaying.*/).
      to_return(:status => 200, :headers => {}, :body => File.new(File.join(fixtures_dir, 'xml/lfm_track_updateNowPlaying.xml')))

    stub_request(:post, /https?:\/\/ws\.audioscrobbler\.com\/.*method=track\.scrobble.*/).
      to_return(:status => 200, :headers => {}, :body => File.new(File.join(fixtures_dir, 'xml/lfm_track_scrobble.xml')))

    # Perform a HTTP request so the "session" object is initialized
    get_json '/songs'

    # Set current user
    @user = users(:jack)
    session[:user_id] = @user.id
  end

  def in_binary(string)
    if RUBY_VERSION.starts_with? '1.8'
      ::Iconv.conv('UTF-8//IGNORE', 'ASCII-8BIT', string)
    else
      @one.force_encoding('ASCII-8BIT')
    end
  end

  test 'should send now_playing info to last.fm at /songs/now_playing' do
    get '/songs/now_playing?artist=Silence&title=30%20second%20silence', { :format => 'json' }, 'rack.session' => session
    assert_response :success
  end

  test 'should send scrobble to last.fm at /songs/scrobble' do
    get '/songs/scrobble?artist=Silence&title=30%20second%20silence', { :format => 'json' }, 'rack.session' => session
    assert_response :success
  end
end
