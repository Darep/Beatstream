package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
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
