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
	file, err := mtag.Open(
		absolutePath,
		mtag.WithReadOnly(),
		mtag.WithSkipPictures(),
		mtag.WithAudioPropertiesStyle(mtag.AudioPropertiesFast),
	)
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

// audioDuration reads the duration from the file's headers when they give one, and scans the audio only when they do
// not, because a scan reads the whole file, which is slow on network shares.
func audioDuration(file *mtag.File, path string) time.Duration {
	// Fast properties give a duration only from an exact source: a Xing/VBRI summary or the container's headers.
	if duration := file.AudioProperties().Duration; duration != 0 {
		return duration
	}
	if file.Container() == mtag.ContainerMP3 {
		return mp3Duration(path)
	}
	return audioProperties(path, mtag.AudioPropertiesAccurate).Duration
}

func audioProperties(path string, style mtag.AudioPropertiesStyle) mtag.AudioProperties {
	file, err := mtag.Open(path, mtag.WithReadOnly(), mtag.WithSkipPictures(), mtag.WithAudioPropertiesStyle(style))
	if err != nil {
		return mtag.AudioProperties{}
	}
	defer file.Close()
	return file.AudioProperties()
}

func artist(file *mtag.File) string {
	if tag := file.ID3v2(); tag != nil {
		if frame, ok := tag.Find(id3v2.FrameArtist).(*id3v2.TextFrame); ok {
			if artists := joinValues(frame.Values); artists != "" {
				return artists
			}
		}
	}
	if file.Container() == mtag.ContainerFLAC || file.Container() == mtag.ContainerOGG {
		if artists := joinValues(file.CustomValues("ARTIST")); artists != "" {
			return artists
		}
	}
	return file.Artist()
}

// joinValues joins multi-value tags, skipping the empty values that NUL padding leaves behind.
func joinValues(values []string) string {
	nonEmpty := make([]string, 0, len(values))
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			nonEmpty = append(nonEmpty, value)
		}
	}
	return strings.Join(nonEmpty, " / ")
}
