package main

import (
	"path/filepath"
	"testing"
)

func TestNewSongFromFileMetadata(t *testing.T) {
	tests := []struct {
		name      string
		file      string
		extension string
		duration  int
		disc      int
	}{
		{"MP3", "tagged.mp3", "mp3", 3, 0},
		{"VBR MP3 without Xing", "tagged-vbr-no-xing.mp3", "mp3", 10, 0},
		{"Ogg", "tagged.ogg", "ogg", 3, 0},
		{"FLAC", "tagged.flac", "flac", 3, 0},
		{"M4A", "tagged.m4a", "m4a", 3, 0},
		{"raw AAC", "tagged.aac", "aac", 3, 2},
		{"WAV with RIFF metadata", "tagged.wav", "wav", 3, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			song, err := newSongFromFile(filepath.Join("testdata", "metadata", tt.file))
			if err != nil {
				t.Fatal(err)
			}
			if song == nil {
				t.Fatal("newSongFromFile returned no song")
			}

			if song.Extension != tt.extension {
				t.Errorf("extension = %q, want %q", song.Extension, tt.extension)
			}
			if song.Title != "Fixture Title" {
				t.Errorf("title = %q, want %q", song.Title, "Fixture Title")
			}
			if song.Artist != "Fixture Artist" {
				t.Errorf("artist = %q, want %q", song.Artist, "Fixture Artist")
			}
			if song.Album != "Fixture Album" {
				t.Errorf("album = %q, want %q", song.Album, "Fixture Album")
			}
			if song.TrackNum == nil || *song.TrackNum != 7 {
				t.Errorf("track number = %v, want 7", song.TrackNum)
			}
			if tt.disc == 0 && song.DiscNum != nil || tt.disc > 0 && (song.DiscNum == nil || *song.DiscNum != tt.disc) {
				t.Errorf("disc number = %v, want %d", song.DiscNum, tt.disc)
			}
			if song.Length != tt.duration {
				t.Errorf("duration = %d, want %d", song.Length, tt.duration)
			}
		})
	}
}
