require 'test_helper'

class SongTest < ActiveSupport::TestCase
  setup do
    mock_mp3s
    FakeFS.activate!
  end

  test 'refresh populates the Songs' do
    Song.refresh
    assert_not_empty Song.all_as_json
  end
end
