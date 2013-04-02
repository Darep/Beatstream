require 'find'
require 'fileutils'

class ApplicationController < ActionController::Base
    before_filter :authorize
    before_filter :load_sidebar_playlists

    protected

    def authorize
        unless User.find_by_id(session[:user_id])
            respond_to do |format|
                format.html {
                    redirect_to login_url
                }
                format.json {
                    render :nothing => true, :status => 401
                }
                format.js {
                    render :nothing => true, :status => 401
                }
            end
        end
    end

    def load_sidebar_playlists
        user = User.find_by_id(session[:user_id])
        @playlists = []

        if user.nil?
            return
        end

        playlist_dir = Rails.root.join('data', 'playlists', user.username)

        # Create the directory if it does not exist
        FileUtils.mkpath playlist_dir

        Find.find(playlist_dir) do |file|
            if File.directory?(file)
                next
            end

            playlist = file.sub!(playlist_dir.to_s + '/', '')

            @playlists.push(playlist)
        end
    end
end
