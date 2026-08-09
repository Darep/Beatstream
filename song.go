package main

import (
	"cmp"
	"encoding/json"
	"fmt"
)

type Song struct {
	Filename string `json:"filename"`
	Path     string `json:"path"`
	Title    string `json:"title"`
	Artist   string `json:"artist"`
	Album    string `json:"album"`
	TrackNum *int   `json:"track_num"` // we use pointer for string, so we can set it to "nil" if there is no track number
	Length   int    `json:"length"`
}

func compareSongs(a, b *Song) int {
	if result := cmp.Compare(a.Artist, b.Artist); result != 0 {
		return result
	}
	if result := cmp.Compare(a.Album, b.Album); result != 0 {
		return result
	}
	if a.TrackNum != nil && b.TrackNum != nil {
		if result := cmp.Compare(*a.TrackNum, *b.TrackNum); result != 0 {
			return result
		}
	} else if a.TrackNum != nil {
		return -1
	} else if b.TrackNum != nil {
		return 1
	}
	if result := cmp.Compare(a.Title, b.Title); result != 0 {
		return result
	}
	return cmp.Compare(a.Filename, b.Filename)
}

// Return a nice title for the song, like "Artist - Title". Fallback to the filename
func (s *Song) NiceTitle() string {
	if s.Title != "" && s.Artist != "" {
		return fmt.Sprintf("%s - %s", s.Artist, s.Title)
	}
	return s.Filename
}

// Convert the raw seconds length to a human-readable string like "04:52" or "01:23:45"
func (s Song) NiceLength() string {
	seconds := s.Length
	minutes := seconds / 60
	hours := minutes / 60

	seconds %= 60
	minutes %= 60

	if hours > 0 {
		return fmt.Sprintf("%d:%02d:%02d", hours, minutes, seconds)
	} else {
		return fmt.Sprintf("%d:%02d", minutes, seconds)
	}
}

// Custom marshaling for adding "nice_title" and "nice_length" to the JSON output
func (s *Song) MarshalJSON() ([]byte, error) {
	type Alias Song
	return json.Marshal(&struct {
		*Alias
		NiceTitle  string `json:"nice_title"`
		NiceLength string `json:"nice_length"`
	}{
		Alias:      (*Alias)(s),
		NiceTitle:  s.NiceTitle(),
		NiceLength: s.NiceLength(),
	})
}
