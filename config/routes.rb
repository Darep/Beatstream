BeatStream::Application.routes.draw do

  scope "/api/v1", :as => "api" do
    # Scrobbling

    controller :scrobbling do
      # Set now playing song
      # PUT /nowplaying
      put 'now-playing' => :now_playing

      # Scrobble a song
      # POST /scrobble
      post 'scrobble' => :scrobble
    end

    # Songs

    # Get All Songs
    # GET /songs
    #
    # Refresh media library
    # POST /songs
    #
    # Stream song
    # GET /songs/play
    resources :songs, :only => [:index, :create] do
      collection do
        get 'play'
      end

      # Stream song
      # GET /songs/:song_id/play
      get 'play'
    end

    # Playlists

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
    resources :playlists, :only => [:index, :create, :update, :destroy, :show] do

      # Get all songs in a playlist
      # GET /playlists/:list_name
      #
      # Set songs on a playlist
      # PUT /playlists/:list_name
      member do
        # Reorder songs on a playlist
        # POST /playlists/:list_name/reoder
        post 'reorder'

        # Add song(s) to playlist
        # POST /playlists/:list_name
        post '', :action => :add_songs
      end
    end

    # User information

    # Current user's basic information
    # GET /profile
    match '/profile' => 'users#profile'

    resources :users, :only => [:show, :update] do
      member do
        scope 'lastfm' do
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
