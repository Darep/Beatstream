package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
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

func TestRefreshStatusHandler(t *testing.T) {
	songsRefreshing.Store(true)
	t.Cleanup(func() { songsRefreshing.Store(false) })

	response := httptest.NewRecorder()
	refreshStatusHandler(response, httptest.NewRequest(http.MethodGet, "/api/songs/refresh", nil))

	var status map[string]bool
	if err := json.NewDecoder(response.Body).Decode(&status); err != nil {
		t.Fatal(err)
	}
	if response.Code != http.StatusOK || !status["refreshing"] {
		t.Fatalf("unexpected response: status=%d body=%v", response.Code, status)
	}
}

func TestSongsHandlerUsesDataPath(t *testing.T) {
	dir := t.TempDir()
	oldDataPath := DataPath
	DataPath = dir
	t.Cleanup(func() { DataPath = oldDataPath })

	if err := os.WriteFile(dataFilePath("songs.json"), []byte(`[{"title":"Test Song"}]`), 0o600); err != nil {
		t.Fatal(err)
	}

	response := httptest.NewRecorder()
	songsHandler(response, httptest.NewRequest(http.MethodGet, "/api/songs", nil))

	var songs []Song
	if err := json.NewDecoder(response.Body).Decode(&songs); err != nil {
		t.Fatal(err)
	}
	if len(songs) != 1 || songs[0].Title != "Test Song" {
		t.Fatalf("unexpected songs: %#v", songs)
	}
}
