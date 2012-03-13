require 'rockstar'

module SettingsHelper
    def lastfm_token_url
        auth = Rockstar::Auth.new
        auth.token
    end
end
