package main

import (
	"bytes"
	"encoding/json"
	"reflect"
	"testing"
)

func TestDeleteOtherSessions(t *testing.T) {
	sessions = []Session{
		{Token: "current", Username: "admin"},
		{Token: "other", Username: "admin"},
		{Token: "someone-else", Username: "listener"},
	}

	deleteOtherSessions("admin", "current")

	if len(sessions) != 2 || sessions[0].Token != "current" || sessions[1].Token != "someone-else" {
		t.Fatalf("unexpected remaining sessions: %#v", sessions)
	}
}

func TestWriteSongsJSON(t *testing.T) {
	track := 3
	want := []Song{{Filename: "song.mp3", Path: "/song.mp3", Title: "Song", Artist: "Artist", TrackNum: &track, Length: 90}}
	var output bytes.Buffer

	if err := writeSongsJSON(&output, want); err != nil {
		t.Fatal(err)
	}

	var got []Song
	if err := json.Unmarshal(output.Bytes(), &got); err != nil {
		t.Fatalf("invalid JSON %q: %v", output.String(), err)
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %#v, want %#v", got, want)
	}
}
