module ApiV1
  class ScrobblesController < ApiController
    before_filter :expires_now
    before_filter :check_lastfm_session_key
    before_filter :check_and_set_artist_and_title

    def now_playing
      artist = params[:artist]
      title = params[:title]

      Rails.logger.info 'Update Now Playing to "' + artist + ' - ' + title + '" for user ' + user.username
      track.updateNowPlaying(Time.now, user.lastfm_session_key)

      render :nothing => true
    end

    def scrobble
      artist = params[:artist]
      title = params[:title]

      Rails.logger.info 'Scrobbling track "' + artist + ' - ' + title + '" for user ' + user.username
      track.scrobble(Time.now, user.lastfm_session_key)

      render :nothing => true
    end

    private

      def check_lastfm_session_key
        render_error "User with id=#{params[:id]} is not connected to Last.fm" if user.lastfm_session_key.blank?
      end

      def check_and_set_artist_and_title
        @artist = params[:artist]
        @title = params[:title]

        errors = []
        errors << 'Required parameter "artist" is missing' if @artist.blank?
        errors << 'Required parameter "title" is missing' if @title.blank?
        render_errors errors if errors.any?
      end

      def track
        @track ||= Rockstar::Track.new(params[:artist], params[:title])
      end

      def user
        @user ||= User.find(session[:user_id])
      end

  end
end
