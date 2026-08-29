package main

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/Darep/Beatstream/logger"
	"github.com/tommyo123/mtag"
	"github.com/tommyo123/mtag/id3v2"
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

	length := int(audioDuration(file, absolutePath).Seconds())
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
		Artist:    artist(file),
		Album:     file.Album(),
		DiscNum:   optionalPositiveInt(file.Disc()),
		TrackNum:  optionalPositiveInt(file.Track()),
		Length:    length,
	}

	return song, nil
}

func audioDuration(file *mtag.File, path string) time.Duration {
	duration := file.AudioProperties().Duration
	if duration != 0 {
		return duration
	}

	estimated, err := mtag.Open(
		path,
		mtag.WithReadOnly(),
		mtag.WithSkipPictures(),
		mtag.WithAudioPropertiesStyle(mtag.AudioPropertiesAverage),
	)
	if err != nil {
		return 0
	}
	defer estimated.Close()
	duration = estimated.AudioProperties().Duration
	if duration < time.Second {
		return 0
	}
	return duration.Round(time.Second)
}

func artist(file *mtag.File) string {
	if tag := file.ID3v2(); tag != nil {
		if frame, ok := tag.Find(id3v2.FrameArtist).(*id3v2.TextFrame); ok && len(frame.Values) > 0 {
			return strings.Join(frame.Values, " / ")
		}
	}
	if file.Container() == mtag.ContainerFLAC || file.Container() == mtag.ContainerOGG {
		if artists := file.CustomValues("ARTIST"); len(artists) > 0 {
			return strings.Join(artists, " / ")
		}
	}
	return file.Artist()
}
