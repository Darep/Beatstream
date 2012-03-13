class SettingsController < ApplicationController

    def index
        @user = User.find(session[:user_id])
        render :layout => false
    end

    def save
        @user = User.find(session[:user_id])
        if @user.update_attributes(params[:user])
            render :text => 'save ok'
        else
            render :action => 'index', :layout => false
        end
    end

    def lastfm_callback
        token = params[:token]

        lastfm_session = Rockstar::Auth.new.session(token)

        @user = User.find(session[:user_id])
        @user.update_attributes(:lastfm_session_key => lastfm_session.key, :lastfm_username => lastfm_session.username)

        redirect_to :action => 'index'
    end

end
