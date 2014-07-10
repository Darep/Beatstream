Beatstream::Application.routes.draw do

  scope :module => :api_v1, :path => '' do
    get 'songs/(index)' => 'songs#index', :as => :songs
    get 'songs/play'
    get 'songs/now_playing' => 'scrobbles#now_playing'
    get 'songs/scrobble' => 'scrobbles#scrobble'
  end

  match 'settings' => 'settings#index'
  match 'settings/save' => 'settings#save'
  match 'settings/lastfm_callback' => 'settings#lastfm_callback'
  match 'settings/lastfm_disconnect' => 'settings#lastfm_disconnect'

  match 'playlists' => 'playlists#index'
  get 'playlists/new'

  controller :sessions do
    get 'login' => :new
    post 'login' => :create
    delete 'logout' => :destroy
    get 'logout' => :destroy
  end

  root :to => 'main#index'

end
