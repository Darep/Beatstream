package main

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/tommyo123/mtag"
	"github.com/tommyo123/mtag/ape"
	"github.com/tommyo123/mtag/id3v2"
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

func TestNewSongFromFileWithTrailingData(t *testing.T) {
	data, err := os.ReadFile(filepath.Join("testdata", "metadata", "tagged-vbr-no-xing.mp3"))
	if err != nil {
		t.Fatal(err)
	}

	tag := ape.New()
	tag.Set(ape.FieldComment, "trailing tag")
	encoded, err := tag.Encode()
	if err != nil {
		t.Fatal(err)
	}
	for name, trailing := range map[string][]byte{
		"APEv2":        encoded,
		"zero padding": make([]byte, 512),
		"junk":         []byte("non-audio trailing bytes"),
	} {
		t.Run(name, func(t *testing.T) {
			path := filepath.Join(t.TempDir(), "tagged-vbr-no-xing.mp3")
			if err := os.WriteFile(path, append(data, trailing...), 0o600); err != nil {
				t.Fatal(err)
			}

			song, err := newSongFromFile(path)
			if err != nil {
				t.Fatal(err)
			}
			if song == nil || song.Length != 10 {
				t.Fatalf("song = %#v, want a 10-second song", song)
			}
		})
	}
}

func TestNewSongFromFileWithMultipleArtists(t *testing.T) {
	for _, tt := range []struct {
		name string
		file string
		set  func(*mtag.File)
	}{
		{"Vorbis", "tagged.flac", func(file *mtag.File) {
			file.SetCustomValues("ARTIST", "Fixture Artist", "", "Second Artist", "")
		}},
		{"ID3v2", "tagged.mp3", func(file *mtag.File) {
			file.ID3v2().SetText(id3v2.FrameArtist, "Fixture Artist", "", "Second Artist", "", "")
		}},
	} {
		t.Run(tt.name, func(t *testing.T) {
			path := filepath.Join(t.TempDir(), tt.file)
			data, err := os.ReadFile(filepath.Join("testdata", "metadata", tt.file))
			if err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(path, data, 0o600); err != nil {
				t.Fatal(err)
			}

			file, err := mtag.Open(path)
			if err != nil {
				t.Fatal(err)
			}
			tt.set(file)
			if err := file.Save(); err != nil {
				t.Fatal(err)
			}
			if err := file.Close(); err != nil {
				t.Fatal(err)
			}

			song, err := newSongFromFile(path)
			if err != nil {
				t.Fatal(err)
			}
			if song == nil || song.Artist != "Fixture Artist / Second Artist" {
				t.Fatalf("song = %#v, want both artists", song)
			}
		})
	}
}
