require 'test_helper'
require 'api_test_helper'

class ApiV1::ScrobblesTest < ActionDispatch::IntegrationTest
  setup do
    FakeFS do
      # Perform a HTTP request so the "session" object is initialized
      get_json '/songs'
    end

    # Set current user
    @user = users(:jack)
    session[:user_id] = @user.id
  end

  def xml_file(filename)
    xml_dir = Rails.root.join('test', 'fixtures', 'xml')
    File.new(File.join(xml_dir, filename))
  end

  test 'should send now_playing info to last.fm at /songs/now_playing' do
    now_playing_stub = stub_request(:post, /https?:\/\/ws\.audioscrobbler\.com\/.*method=track\.updateNowPlaying.*/).
      to_return(:status => 200, :headers => {}, :body => xml_file('lfm_track_updateNowPlaying.xml'))

    get '/songs/now_playing?artist=Silence&title=30%20second%20silence', { :format => 'json' }, 'rack.session' => session
    assert_requested now_playing_stub
  end

  test 'should send scrobble to last.fm at /songs/scrobble' do
    scrobble_stub = stub_request(:post, /https?:\/\/ws\.audioscrobbler\.com\/.*method=track\.scrobble.*/).
      to_return(:status => 200, :headers => {}, :body => xml_file('lfm_track_scrobble.xml'))

    get '/songs/scrobble?artist=Silence&title=30%20second%20silence', { :format => 'json' }, 'rack.session' => session
    assert_requested scrobble_stub
  end

  test 'should return RecordNotFound error if user is not found on scrobble' do
    session[:user_id] = 78991423413
    get '/songs/scrobble?artist=Silence&title=30%20second%20silence', { :format => 'json' }, 'rack.session' => session
    assert_response :not_found
  end
end
