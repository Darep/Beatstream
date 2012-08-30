class PlaylistsController < ApplicationController

    PLAYLISTS_DIR_BASE = Rails.root.join('public/playlists/')

    def index
    end

    def show
        list_name = params[:id]

        user = User.find_by_id(session[:user_id])
        
        if user.nil?
            raise "You are not logged in?"
        end

        playlist_file_dir = PLAYLISTS_DIR_BASE.to_s + user.username.to_s + "/"
        playlist_file = playlist_file_dir + list_name

        f = File.open(playlist_file, 'r')
        songs_json = f.read

        render :text => songs_json

#        @playlist = {}
#
#        respond_to do |format|
#            format.html
#            format.json { render :json => @playlist }
#        end
    end

    # POST /playlists
    def create
        user = User.find_by_id(session[:user_id])
        
        if user.nil?
            raise "You are not logged in?"
        end

        list_name = params[:name]
        if list_name.nil? || list_name.empty?
            raise "No list name supplied"
        end

        playlist_file_dir = PLAYLISTS_DIR_BASE.to_s + user.username.to_s + "/"
        playlist_file = playlist_file_dir + list_name

        FileUtils.mkdir_p playlist_file_dir

        # create an empty playlist == empty json array
        File.open(playlist_file, 'w') { |f| f.write('[]') }

        respond_to do |format|
            format.html { render :nothing => true }
            format.json { render :nothing => true }
        end
    end

    # POST /playlists/:list_name
    def update
        # TODO: rename playlist
        render :nothing => true
    end

    # DELETE /playlists/:list_name
    def destroy
        # TODO: delete playlist
        render :nothing => true
    end
end
