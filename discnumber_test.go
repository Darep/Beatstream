package main

import "testing"

func TestParseNumberTag(t *testing.T) {
	for input, want := range map[string]*int{
		"2/4":  intPointer(2),
		"3":    intPointer(3),
		"":     nil,
		"0/4":  nil,
		"nope": nil,
	} {
		got := parseNumberTag(input)
		if (got == nil) != (want == nil) || got != nil && *got != *want {
			t.Errorf("parseNumberTag(%q) = %v, want %v", input, got, want)
		}
	}
}

func TestNaturalSortUsesDiscNumber(t *testing.T) {
	discOne, discTwo, trackOne, trackNine := 1, 2, 1, 9
	lastOnDiscOne := Song{Artist: "Artist", Album: "Album", DiscNum: &discOne, TrackNum: &trackNine}
	firstOnDiscTwo := Song{Artist: "Artist", Album: "Album", DiscNum: &discTwo, TrackNum: &trackOne}

	if lastOnDiscOne.ToNaturalSortString() >= firstOnDiscTwo.ToNaturalSortString() {
		t.Fatal("disc number must sort before track number")
	}
}

func intPointer(value int) *int {
	return &value
}
