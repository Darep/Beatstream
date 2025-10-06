package main

import (
	"encoding/json"
	"os"
	"sync"
	"time"

	"github.com/Darep/Beatstream-go/logger"
	"github.com/google/uuid"
)

const PlaylistsFilePath = "playlists.json"

var playlistsMutex = &sync.RWMutex{}

type Playlist struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Username  string    `json:"username"`
	Songs     []string  `json:"songs"`     // Array of song paths
	CreatedAt time.Time `json:"created_at"`
}

var playlists []Playlist

func loadPlaylists() error {
	playlistsMutex.Lock()
	defer playlistsMutex.Unlock()

	file, err := os.Open(PlaylistsFilePath)
	if err != nil {
		if os.IsNotExist(err) {
			// File doesn't exist, start with empty playlists
			playlists = []Playlist{}
			return nil
		}
		return err
	}
	defer file.Close()

	err = json.NewDecoder(file).Decode(&playlists)
	if err != nil {
		return err
	}

	return nil
}

func savePlaylists() error {
	playlistsMutex.Lock()
	defer playlistsMutex.Unlock()

	return savePlaylistsUnsafe()
}

func savePlaylistsUnsafe() error {
	file, err := os.Create(PlaylistsFilePath)
	if err != nil {
		return err
	}
	defer file.Close()

	err = json.NewEncoder(file).Encode(playlists)
	if err != nil {
		return err
	}

	return nil
}

func getUserPlaylists(username string) []Playlist {
	playlistsMutex.RLock()
	defer playlistsMutex.RUnlock()

	var userPlaylists []Playlist
	for _, playlist := range playlists {
		if playlist.Username == username {
			userPlaylists = append(userPlaylists, playlist)
		}
	}
	return userPlaylists
}

func createPlaylist(name, username string) (*Playlist, error) {
	playlistsMutex.Lock()
	defer playlistsMutex.Unlock()

	playlist := Playlist{
		ID:        uuid.New().String(),
		Name:      name,
		Username:  username,
		Songs:     []string{},
		CreatedAt: time.Now(),
	}

	playlists = append(playlists, playlist)

	err := savePlaylistsUnsafe()
	if err != nil {
		// Remove the playlist if save failed
		playlists = playlists[:len(playlists)-1]
		return nil, err
	}

	logger.Log.Printf("Created playlist: %s for user: %s", name, username)
	return &playlist, nil
}

func deletePlaylist(id, username string) error {
	playlistsMutex.Lock()
	defer playlistsMutex.Unlock()

	var newPlaylists []Playlist
	found := false

	for _, playlist := range playlists {
		if playlist.ID == id && playlist.Username == username {
			found = true
			logger.Log.Printf("Deleting playlist: %s for user: %s", playlist.Name, username)
		} else {
			newPlaylists = append(newPlaylists, playlist)
		}
	}

	if !found {
		return &PlaylistNotFoundError{ID: id}
	}

	playlists = newPlaylists

	err := savePlaylistsUnsafe()
	if err != nil {
		return err
	}

	return nil
}

func getPlaylistByID(id, username string) (*Playlist, error) {
	playlistsMutex.RLock()
	defer playlistsMutex.RUnlock()

	for _, playlist := range playlists {
		if playlist.ID == id && playlist.Username == username {
			return &playlist, nil
		}
	}

	return nil, &PlaylistNotFoundError{ID: id}
}

type PlaylistNotFoundError struct {
	ID string
}

func (e *PlaylistNotFoundError) Error() string {
	return "Playlist not found: " + e.ID
}