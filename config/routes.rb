BeatStream::Application.routes.draw do

  scope "/api/v1", format: 'json' do
    controller :scrobbling do
      put 'now-playing' => :now_playing
      post 'scrobble' => :scrobble
    end

    resources :songs, :only => [:index, :create, :show, :update] do
      collection do
        post 'refresh' => :refresh
      end

      member do
        get 'play'
      end
    end

    # resources :playlists, :only => [:index, :create, :update, :destroy, :show]

    get '/profile' => 'users#profile'

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
