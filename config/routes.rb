Beatstream::Application.routes.draw do

  scope :module => :api_v1, :path => 'api/v1' do
    get 'songs' => 'songs#index'
    get 'songs/play'
    get 'songs/refresh'  # legacy support
    post 'songs/refresh'

    put 'songs/now_playing' => 'scrobbles#now_playing'
    post 'songs/scrobble' => 'scrobbles#scrobble'
  end

  match 'settings' => 'settings#index', via: :get
  match 'settings/save' => 'settings#save', via: :get
  match 'settings/lastfm_callback' => 'settings#lastfm_callback', via: :get
  match 'settings/lastfm_connect' => 'settings#lastfm_connect', via: :get
  match 'settings/lastfm_disconnect' => 'settings#lastfm_disconnect', via: :get

  match 'playlists' => 'playlists#index', via: :get
  get 'playlists/new'

  controller :sessions do
    get 'login' => :new
    post 'login' => :create
    delete 'logout' => :destroy
    get 'logout' => :destroy
  end

  root :to => 'main#index'

end
