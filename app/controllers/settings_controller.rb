class SettingsController < ApplicationController
  layout false

  def index
  end

  def save
    user.update_attributes(params[:user])
    redirect_to :action => 'index'
  end

  def lastfm_callback
    lastfm_session = Rockstar::Auth.new.session(params[:token])

    user.update_attributes(
      :lastfm_session_key => lastfm_session.key,
      :lastfm_username => lastfm_session.username
    )

    redirect_to :action => 'index'
  end

  def lastfm_disconnect
    user.update_attributes(:lastfm_session_key => nil, :lastfm_username => nil)
    redirect_to :action => 'index'
  end
end
