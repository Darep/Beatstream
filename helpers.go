package main

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/Darep/Beatstream/logger"
	"github.com/tommyo123/mtag"
)

// Helper for responding as JSON
func respondJSON(w http.ResponseWriter, data any) {
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
	file, err := mtag.Open(absolutePath, mtag.WithReadOnly(), mtag.WithSkipPictures())
	if err != nil {
		logger.Log.Println("Failed to read audio file metadata:", err, absolutePath)
		return nil, err
	}
	defer file.Close()

	length := file.AudioProperties().Duration
	if length == 0 {
		logger.Log.Println("Skipping file with length 0:", absolutePath)
		return nil, nil
	}

	// Create new song
	song := &Song{
		Filename:  filepath.Base(absolutePath),
		Path:      strings.TrimPrefix(absolutePath, MusicPath),
		Extension: strings.TrimPrefix(strings.ToLower(filepath.Ext(absolutePath)), "."),
		Title:     file.Title(),
		Artist:    file.Artist(),
		Album:     file.Album(),
		DiscNum:   optionalPositiveInt(file.Disc()),
		TrackNum:  optionalPositiveInt(file.Track()),
		Length:    int(length.Seconds()),
	}

	return song, nil
}
