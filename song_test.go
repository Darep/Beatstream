package main

import (
	"sort"
	"testing"
)

func TestCompareSongs(t *testing.T) {
	one, two := 1, 2
	songs := []Song{
		{Artist: "B", Album: "Album", TrackNum: &one, Title: "First"},
		{Artist: "A", Album: "Album", Title: "No track"},
		{Artist: "A", Album: "Album", TrackNum: &two, Title: "Second"},
		{Artist: "A", Album: "Album", TrackNum: &one, Title: "First"},
	}

	sort.Slice(songs, func(i, j int) bool { return compareSongs(&songs[i], &songs[j]) < 0 })

	if songs[0].Title != "First" || songs[1].Title != "Second" || songs[2].Title != "No track" || songs[3].Artist != "B" {
		t.Fatalf("unexpected order: %#v", songs)
	}
}
