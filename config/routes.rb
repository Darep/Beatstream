BeatStream::Application.routes.draw do

  match 'settings' => 'settings#index'
  match 'settings/save' => 'settings#save'
  match 'settings/lastfm_callback' => 'settings#lastfm_callback'

  controller :sessions do
    get 'login' => :new
    post 'login' => :create
    delete 'logout' => :destroy
    get 'logout' => :destroy
  end

  match 'songs' => 'songs#index'
  get 'songs/index'
  get 'songs/play'
  get 'songs/now_playing'
  get 'songs/scrobble'

  match 'playlists' => 'playlists#index'
  get 'playlists/new'

  root :to => 'main#index'

end
