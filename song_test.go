package main

import "testing"

func TestNaturalSortUsesDiscNumber(t *testing.T) {
	discOne, discTwo, trackOne, trackNine := 1, 2, 1, 9
	lastOnDiscOne := Song{Artist: "Artist", Album: "Album", DiscNum: &discOne, TrackNum: &trackNine}
	firstOnDiscTwo := Song{Artist: "Artist", Album: "Album", DiscNum: &discTwo, TrackNum: &trackOne}

	if lastOnDiscOne.ToNaturalSortString() >= firstOnDiscTwo.ToNaturalSortString() {
		t.Fatal("disc number must sort before track number")
	}
}

func TestNaturalSortGroupsFormats(t *testing.T) {
	trackOne, trackNine := 1, 9
	lastFlac := Song{Artist: "Artist", Album: "Album", Extension: ".flac", TrackNum: &trackNine}
	firstMP3 := Song{Artist: "Artist", Album: "Album", Extension: ".mp3", TrackNum: &trackOne}

	if lastFlac.ToNaturalSortString() >= firstMP3.ToNaturalSortString() {
		t.Fatal("format must sort before track number")
	}
}
