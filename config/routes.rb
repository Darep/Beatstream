BeatStream::Application.routes.draw do

  scope "/api/v1", :as => "api" do
    # Scrobbling

    controller :scrobbling do
      # Set now playing song
      # PUT /nowplaying
      put 'nowplaying' => :now_playing

      # Scrobble a song
      # POST /scrobble
      post 'scrobble' => :scrobble
    end

    # Songs

    # Stream song
    # GET /songs/play
    match 'songs/play' => 'songs#play'

    # Get All Songs
    # GET /songs
    match 'songs' => 'songs#all'

    # Get all playlists
    # GET /playlists
    #
    # Create a playlist
    # POST /playlists
    #
    # Rename playlist
    # PUT /playlists/:list_name
    #
    # Delete playlist
    # DELETE /playlists/:list_name
    resources :playlists, :only => [:index, :create, :update, :destroy] do

      # Get all songs in a playlist
      # GET /playlists/:list_name/songs
      #
      # Add song(s) to playlist
      # POST /playlists/:list_name/songs
      #
      # Set songs on a playlist
      # PUT /playlists/:list_name/songs
      resources :songs, :only => [:index, :create, :update] do
        collection do
          # Reorder songs on a playlist
          # POST /playlists/:list_name/songs/reoder
          post 'reorder'
        end
      end
    end

    # Refresh media library
    # PUT /songs
    match 'songs' => 'songs#refresh', :via => :put

    # User information
    resources :users, :only => [:show, :update] do
      member do
        scope "lastfm" do
          get 'callback', :action => :lastfm_callback
          get 'disconnect', :action => :lastfm_disconnect
        end
      end
    end
  end # /api/v1

  # Login
  controller :sessions do
    get 'login' => :new
    post 'login' => :create
    delete 'logout' => :destroy
    get 'logout' => :destroy
  end

  root :to => 'main#index'
end
