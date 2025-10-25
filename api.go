package main

import (
	"encoding/json"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	"github.com/Darep/Beatstream/logger"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

const SongsFilePath = "songs.json"

var refreshMutex = &sync.Mutex{}
var songsMutex = &sync.RWMutex{}

// Define valid audio file extensions
var validExtensions = map[string]bool{
	".mp3":  true,
	".ogg":  true,
	".flac": true,
	".m4a":  true,
	".wav":  true,
	".aac":  true,
}

func startApi() {
	r := registerRoutes()

	host := os.Getenv("HOST")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	listenUrl := host + ":" + port

	logger.Log.Printf("Starting server on %s", listenUrl)
	err := http.ListenAndServe(listenUrl, r)
	if err != nil {
		logger.Log.Fatalf("Failed to start server: %v", err)
	}
}

func registerRoutes() *chi.Mux {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.With(middleware.NoCache).Post("/api/session", loginHandler)

	r.Route("/api", func(r chi.Router) {
		r.Use(middleware.NoCache)
		r.Use(AuthMiddleware)

		r.Get("/session", sessionHandler)
		r.Delete("/session", logoutHandler)

		r.Get("/songs", songsHandler)
		r.Get("/songs/play", playHandler)
		r.Post("/songs/refresh", refreshHandler)

		// r.Put("/lastfm", lastfmHandler)
		// r.Post("/lastfm/scrobble", scrobbleHandler)
		// r.Post("/lastfm/now-playing", nowPlayingHandler)

		// r.Get("/playlists", playlistsHandler)
		// r.Post("/playlists", createPlaylistHandler)
		// r.Put("/playlists/{id}", updatePlaylistHandler)
		// r.Delete("/playlists/{id}", deletePlaylistHandler)
	})

	r.Handle("/*", http.HandlerFunc(frontendHandler))

	return r
}

// GET /api/session
func sessionHandler(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)

	if username == "" && os.Getenv("DISABLE_LOGIN") == "true" {
		token := createSession(User{Username: "Anonymous", Password: ""}).Token
		http.SetCookie(w, createSessionCookie(token))
	}

	respondJSON(w, map[string]string{
		"username": username,
	})
}

// POST /api/session
func loginHandler(w http.ResponseWriter, r *http.Request) {
	// reload users just in case
	err := loadUsers()
	if err != nil {
		logger.Log.Printf("Failed to load user configuration: %v", err)
	}

	username, password, ok := r.BasicAuth()
	if !ok {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	for _, user := range users {
		if user.Username == username && user.Password == password {
			token := createSession(user).Token

			// Create & set a new cookie
			http.SetCookie(w, createSessionCookie(token))

			// Respond with session data (currently username only)
			respondJSON(w, map[string]string{
				"username": username,
			})

			return
		}
	}

	http.Error(w, "Invalid credentials", http.StatusUnauthorized)
}

// DELETE /api/session
func logoutHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session")
	if err != nil {
		http.Error(w, "Session cookie not found", http.StatusUnauthorized)
		return
	}

	// Delete the session
	deleteSession(cookie.Value)

	// Delete the session cookie
	http.SetCookie(w, &http.Cookie{
		Name:   "session",
		Value:  "",
		MaxAge: -1, // Set MaxAge to -1 to delete the cookie
	})

	respondJSON(w, map[string]string{})
}

// GET /api/songs
func songsHandler(w http.ResponseWriter, r *http.Request) {
	songsMutex.RLock()
	defer songsMutex.RUnlock()

	fileInfo, err := os.Stat(SongsFilePath)
	if err != nil || fileInfo.Size() <= 2 {
		respondJSON(w, []Song{})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	http.ServeFile(w, r, SongsFilePath)
}

// GET /api/songs/play?file=relative/path/to/song.mp3
func playHandler(w http.ResponseWriter, r *http.Request) {
	relativePath := r.URL.Query().Get("file")
	// FIXME: check if the file is in the music directory, or clean the path somehow
	songPath := filepath.Join(MusicPath, relativePath)

	_, err := os.Stat(songPath)
	if os.IsNotExist(err) {
		http.Error(w, "Song not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "audio/mpeg")
	http.ServeFile(w, r, songPath)
}

// POST /api/songs/refresh
func refreshHandler(w http.ResponseWriter, r *http.Request) {
	if !refreshMutex.TryLock() {
		http.Error(w, "Another refresh operation is already in progress", http.StatusConflict)
		return
	}
	defer refreshMutex.Unlock()

	err := refreshSongs()
	if err != nil {
		logger.Log.Println("Failed to refresh songs:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Header().Set("Content-Type", "application/json")
		http.ServeFile(w, r, SongsFilePath)
	}
}

func refreshSongs() error {
	logger.Log.Println("Refreshing songs…")
	defer logger.Log.Println("Songs refresh done")

	songs := make([]Song, 0)

	err := filepath.WalkDir(MusicPath, func(path string, e fs.DirEntry, err error) error {
		if err != nil || e.IsDir() {
			return err
		}

		extension := strings.ToLower(filepath.Ext(e.Name()))
		isValidExtension := validExtensions[extension]

		if isValidExtension {
			song, err := newSongFromFile(path)
			if err != nil {
				logger.Log.Println("Failed to read song:", err)
			} else if song != nil {
				songs = append(songs, *song)
			}
		}

		return nil
	})

	if err != nil {
		return err
	}

	logger.Log.Println("Found", len(songs), "songs")

	// Sort songs
	sort.Slice(songs, func(i, j int) bool {
		return songs[i].ToNaturalSortString() < songs[j].ToNaturalSortString()
	})

	// lock "songs.json" so that it's not read while being written
	songsMutex.Lock()
	defer songsMutex.Unlock()

	// Write songs to file
	file, err := os.Create(SongsFilePath)
	if err != nil {
		return err
	}
	defer file.Close()

	logger.Log.Println("Writing songs to file…")
	err = json.NewEncoder(file).Encode(songs)
	if err != nil {
		return err
	}

	return nil
}
