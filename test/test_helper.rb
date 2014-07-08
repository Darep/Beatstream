ENV["RAILS_ENV"] = "test"
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

if RUBY_VERSION.starts_with? '1.8'
  require 'webmock/test_unit'
else
  require 'webmock/minitest'
end

WebMock.disable_net_connect! :allow_localhost => true

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.(yml|csv) for all tests in alphabetical order.
  #
  # Note: You'll currently still have to declare fixtures explicitly in integration tests
  # -- they do not yet inherit this setting
  fixtures :all

  # Add more helper methods to be used by all tests here...
end

def mock_mp3s
  # Sample MP3 files
  @one = File.open(Rails.root.join('test', 'fixtures', 'files', '1sec.mp3')).read
  @thirty = File.open(Rails.root.join('test', 'fixtures', 'files', '30sec.mp3')).read

  FakeFS do
    # Clean the mocks
    File.delete(Song.SONGS_JSON_FILE) if File.exists?(Song.SONGS_JSON_FILE)
    FileUtils.rm_rf(Song.MUSIC_PATH) if Dir.exists?(Song.MUSIC_PATH)

    # Mock the directories required by songs controller
    FileUtils.mkdir_p(Song.MUSIC_PATH)
    FileUtils.mkdir_p(Rails.root.join('data'))

    # Create a few mock MP3 files
    one_mock = File.open(File.join(Song.MUSIC_PATH, '1sec.mp3'), 'wb')
    one_mock.write(@one)

    thirty_mock = File.open(File.join(Song.MUSIC_PATH, '30sec.mp3'), 'wb')
    thirty_mock.write(@thirty)
  end
end
