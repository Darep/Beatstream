BeatStream::Application.routes.draw do

  scope "/api/v1" do
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
    resources :playlists do

      # Get all songs in a playlist
      # GET /playlists/:list_name/songs
      match 'songs' => 'playlists#songs_index', :via => :get

      # Add songs to playlist
      # POST /playlists/:list_name/songs
      match 'songs' => 'playlists#songs_create', :via => :post

      # Set songs on a playlist
      # PUT /playlists/:list_name/songs
      match 'songs' => 'playlists#songs_update', :via => :put

      # Reorder songs on a playlist
      # POST /playlists/:list_name/songs/reoder
      match 'songs/reorder' => 'playlists#songs_reorder', :via => :post
    end


    # Refresh media library
    # PUT /songs
    match 'songs' => 'songs#refresh', :via => :put

    # User information
    resources :users do
      match 'lastfm_callback' => 'users#lastfm_callback'
      match 'lastfm_callback' => 'users#lastfm_disconnect'
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
