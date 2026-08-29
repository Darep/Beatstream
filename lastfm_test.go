package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strings"
	"testing"
)

func TestLastFMStatusExposesPendingAuthorization(t *testing.T) {
	oldUsers := users
	users = []User{{Username: "alice", LastFMToken: "token"}}
	t.Cleanup(func() { users = oldUsers })

	req := httptest.NewRequest(http.MethodGet, "/api/lastfm", nil)
	req = req.WithContext(context.WithValue(req.Context(), "username", "alice"))
	response := httptest.NewRecorder()
	lastFMStatusHandler(response, req)

	var status struct {
		Pending bool `json:"pending"`
	}
	if err := json.NewDecoder(response.Body).Decode(&status); err != nil {
		t.Fatal(err)
	}
	if !status.Pending {
		t.Fatal("pending authorization was not reported")
	}
}

func TestLastFMTrackClearsInvalidSession(t *testing.T) {
	useTempDataPath(t)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprint(w, `{"error":9,"message":"Invalid session key"}`)
	}))
	defer server.Close()

	oldURL, oldUsers := lastFMAPIURL, users
	lastFMAPIURL = server.URL
	users = []User{{Username: "alice", LastFMUsername: "lastfm-alice", LastFMSession: "invalid"}}
	t.Cleanup(func() { lastFMAPIURL, users = oldURL, oldUsers })
	t.Setenv("LASTFM_API_KEY", "key")
	t.Setenv("LASTFM_API_SECRET", "secret")

	req := httptest.NewRequest(http.MethodPost, "/api/lastfm/now-playing", bytes.NewBufferString(`{"artist":"Artist","track":"Track"}`))
	req = req.WithContext(context.WithValue(req.Context(), "username", "alice"))
	response := httptest.NewRecorder()
	lastFMNowPlayingHandler(response, req)

	if response.Code != http.StatusConflict {
		t.Fatalf("status = %d, want %d: %s", response.Code, http.StatusConflict, response.Body.String())
	}
	if users[0].LastFMSession != "" || users[0].LastFMUsername != "" {
		t.Fatalf("invalid connection was not cleared: %#v", users[0])
	}
	data, err := os.ReadFile(usersFilePath)
	if err != nil {
		t.Fatal(err)
	}
	var persisted []User
	if err := json.Unmarshal(data, &persisted); err != nil {
		t.Fatal(err)
	}
	if persisted[0].LastFMSession != "" {
		t.Fatalf("invalid session was still persisted: %#v", persisted[0])
	}
}

func TestLastFMCallExplainsHTTPFailures(t *testing.T) {
	t.Setenv("LASTFM_API_KEY", "key")
	t.Setenv("LASTFM_API_SECRET", "secret")
	oldURL := lastFMAPIURL
	t.Cleanup(func() { lastFMAPIURL = oldURL })

	for _, test := range []struct {
		name, body, want string
		status           int
	}{
		{name: "non-JSON", status: http.StatusServiceUnavailable, body: "try later", want: "HTTP 503 Service Unavailable"},
		{name: "Last.fm JSON", status: http.StatusBadRequest, body: `{"error":6,"message":"Invalid parameters"}`, want: "Last.fm: Invalid parameters"},
	} {
		t.Run(test.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				w.WriteHeader(test.status)
				fmt.Fprint(w, test.body)
			}))
			defer server.Close()
			lastFMAPIURL = server.URL

			_, err := lastFMCall(url.Values{"method": {"test"}})
			if err == nil || !strings.Contains(err.Error(), test.want) {
				t.Fatalf("error = %v, want %q", err, test.want)
			}
		})
	}
}

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
