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

  def lastfm_connect
    key = Rockstar.lastfm_api_key
    callback_url = url_for :action => 'lastfm_callback', :only_path => false
    redirect_to "http://www.last.fm/api/auth/?api_key=#{key}&cb=#{callback_url}"
  end

  def lastfm_disconnect
    user.update_attributes(:lastfm_session_key => nil, :lastfm_username => nil)
    redirect_to :action => 'index'
  end
end
