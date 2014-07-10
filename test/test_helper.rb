ENV["RAILS_ENV"] = "test"
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

if RUBY_VERSION.starts_with? '1.8'
  require 'webmock/test_unit'
  require 'iconv'
else
  require 'webmock/minitest'
end

WebMock.disable_net_connect! :allow_localhost => true

# ----------------------------------------------------------------------------

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.(yml|csv) for all tests in alphabetical order.
  #
  # Note: You'll currently still have to declare fixtures explicitly in integration tests
  # -- they do not yet inherit this setting
  fixtures :all
end

class ActionDispatch::IntegrationTest
  setup do
    clean_fake_fs

    # Deactivate always by default
    FakeFS.deactivate!
  end
end

def clean_fake_fs
  # Create directories and files into the FakeFS
  FakeFS do
    # Clean the directories
    File.delete(MediaReader.SONGS_JSON_FILE) if File.exists?(MediaReader.SONGS_JSON_FILE)
    FileUtils.rm_rf(MediaReader.MUSIC_PATH) if Dir.exists?(MediaReader.MUSIC_PATH)

    # Mock the directories required by song stuff
    FileUtils.mkdir_p(MediaReader.MUSIC_PATH)
    FileUtils.mkdir_p(Rails.root.join('data'))
  end
end

def mock_mp3s
  was_active = FakeFS.activated?
  FakeFS.deactivate! if was_active

  # Read the sample MP3 files into memory
  @fixtures_files_dir = Rails.root.join('test', 'fixtures', 'files')
  @one = File.open(Rails.root.join('test', 'fixtures', 'files', '1sec.mp3').to_s).read
  @thirty = File.open(Rails.root.join('test', 'fixtures', 'files', '30sec.mp3').to_s).read

  clean_fake_fs

  FakeFS do
    # Create a few mock MP3 files
    @one_path = File.join(MediaReader.MUSIC_PATH, '1sec.mp3').to_s
    @one_mock = File.open(@one_path, 'wb')
    @one_mock.write(@one)

    @thirty_path = File.join(MediaReader.MUSIC_PATH, '30sec.mp3')
    @thirty_mock = File.open(@thirty_path, 'wb')
    @thirty_mock.write(@thirty)
  end

  FakeFS.activate! if was_active
end
