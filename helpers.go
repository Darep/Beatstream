package main

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/Darep/Beatstream-go/logger"
	tag "github.com/wtolson/go-taglib"
)

// Helper for responding as JSON
func respondJSON(w http.ResponseWriter, data interface{}) {
	jsonResponse, err := json.Marshal(data)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}

func newSongFromFile(absolutePath string) (*Song, error) {
	// Read metadata
	file, err := tag.Read(absolutePath)
	if err != nil {
		logger.Log.Println("Failed to read audio file metadata:", err, absolutePath)
		return nil, err
	}
	defer file.Close()

	if file.Length() == 0 {
		logger.Log.Println("Skipping file with length 0:", absolutePath)
		return nil, nil
	}

	// Check track number
	trackNum := file.Track()
	var trackNumPtr *int
	if trackNum != 0 {
		trackNumPtr = &trackNum
	}

	// Create new song
	song := &Song{
		Filename: filepath.Base(absolutePath),
		Path:     strings.TrimPrefix(absolutePath, MusicPath),
		Title:    file.Title(),
		Artist:   file.Artist(),
		Album:    file.Album(),
		TrackNum: trackNumPtr,
		Length:   int(file.Length().Seconds()),
	}

	return song, nil
}
