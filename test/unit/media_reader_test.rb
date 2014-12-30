require 'test_helper'

class MediaReaderTest < ActiveSupport::TestCase
  setup do
    mock_mp3s
    FakeFS.activate!
  end

  test 'refresh works with a broken mp3 file' do
    broken_mp3_path = File.join(MediaReader.MUSIC_PATH, 'broken.mp3').to_s
    broken_mp3 = File.open(broken_mp3_path, 'w') { |f| f.write 'test' }
    MediaReader.refresh
  end
end
