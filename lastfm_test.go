package main

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestLastFMTrackRoundsFractionalDuration(t *testing.T) {
	var duration string
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		duration = r.FormValue("duration")
		fmt.Fprint(w, `{}`)
	}))
	defer server.Close()

	oldURL, oldUsers := lastFMAPIURL, users
	lastFMAPIURL = server.URL
	users = []User{{Username: "alice", LastFMSession: "session"}}
	t.Cleanup(func() { lastFMAPIURL, users = oldURL, oldUsers })
	t.Setenv("LASTFM_API_KEY", "key")
	t.Setenv("LASTFM_API_SECRET", "secret")

	req := httptest.NewRequest(http.MethodPost, "/api/lastfm/now-playing", bytes.NewBufferString(`{"artist":"Artist","track":"Track","duration":123.5}`))
	req = req.WithContext(context.WithValue(req.Context(), "username", "alice"))
	response := httptest.NewRecorder()
	lastFMNowPlayingHandler(response, req)

	if response.Code != http.StatusOK {
		t.Fatalf("%d %s", response.Code, response.Body.String())
	}
	if duration != "124" {
		t.Fatalf("duration = %q, want 124", duration)
	}
}

func TestLastFMDisconnectKeepsMemoryWhenPersistenceFails(t *testing.T) {
	oldDataPath, oldUsersFilePath, oldUsers := dataPath, usersFilePath, users
	dataPath = t.TempDir() + "/missing"
	usersFilePath = dataPath + "/users.json"
	users = []User{{Username: "alice", LastFMUsername: "lastfm-alice", LastFMSession: "session", LastFMToken: "token"}}
	t.Cleanup(func() { dataPath, usersFilePath, users = oldDataPath, oldUsersFilePath, oldUsers })

	req := httptest.NewRequest(http.MethodDelete, "/api/lastfm", nil)
	req = req.WithContext(context.WithValue(req.Context(), "username", "alice"))
	response := httptest.NewRecorder()
	lastFMDisconnectHandler(response, req)

	if response.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want %d", response.Code, http.StatusInternalServerError)
	}
	if users[0].LastFMSession != "session" || users[0].LastFMToken != "token" {
		t.Fatalf("user changed after failed persistence: %#v", users[0])
	}
}

func TestLastFMConnectionsBelongToEachUser(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.FormValue("token")
		fmt.Fprintf(w, `{"session":{"name":"lastfm-%s","key":"session-%s"}}`, token, token)
	}))
	defer server.Close()

	oldURL, oldUsers := lastFMAPIURL, users
	lastFMAPIURL = server.URL
	users = []User{{Username: "alice", LastFMToken: "alice-token"}, {Username: "bob", LastFMToken: "bob-token"}}
	t.Cleanup(func() { lastFMAPIURL, users = oldURL, oldUsers })
	t.Setenv("LASTFM_API_KEY", "key")
	t.Setenv("LASTFM_API_SECRET", "secret")

	oldDir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Chdir(t.TempDir()); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chdir(oldDir) })

	for _, username := range []string{"alice", "bob"} {
		req := httptest.NewRequest(http.MethodPost, "/api/lastfm/complete", nil)
		req = req.WithContext(context.WithValue(req.Context(), "username", username))
		response := httptest.NewRecorder()
		lastFMCompleteHandler(response, req)
		if response.Code != http.StatusOK {
			t.Fatalf("%s: %d %s", username, response.Code, response.Body.String())
		}
	}

	if users[0].LastFMSession != "session-alice-token" || users[1].LastFMSession != "session-bob-token" {
		t.Fatalf("connections crossed users: %#v", users)
	}
}
