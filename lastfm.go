package main

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"os"
	"slices"
	"sort"
	"strings"
	"time"

	"github.com/Darep/Beatstream/logger"
)

var lastFMAPIURL = "https://ws.audioscrobbler.com/2.0/"
var lastFMHTTPClient = &http.Client{Timeout: 10 * time.Second}

type lastFMResponse struct {
	Token   string `json:"token"`
	Session struct {
		Name string `json:"name"`
		Key  string `json:"key"`
	} `json:"session"`
	Error      int    `json:"error"`
	Message    string `json:"message"`
	NowPlaying struct {
		Ignored lastFMIgnoredMessage `json:"ignoredMessage"`
	} `json:"nowplaying"`
	Scrobbles struct {
		Scrobble struct {
			Ignored lastFMIgnoredMessage `json:"ignoredMessage"`
		} `json:"scrobble"`
	} `json:"scrobbles"`
}

type lastFMIgnoredMessage struct {
	Code string `json:"code"`
	Text string `json:"#text"`
}

type lastFMError struct {
	Code    int
	Message string
}

func (err *lastFMError) Error() string {
	return fmt.Sprintf("Last.fm: %s", err.Message)
}

type lastFMTrack struct {
	Artist    string  `json:"artist"`
	Track     string  `json:"track"`
	Album     string  `json:"album,omitempty"`
	Duration  float64 `json:"duration,omitempty"`
	Timestamp int64   `json:"timestamp,omitempty"`
}

func lastFMCredentials() (string, string, error) {
	key, secret := os.Getenv("LASTFM_API_KEY"), os.Getenv("LASTFM_API_SECRET")
	if key == "" || secret == "" {
		return "", "", errors.New("Last.fm is not configured")
	}
	return key, secret, nil
}

func lastFMSign(values url.Values, secret string) string {
	keys := make([]string, 0, len(values))
	for key := range values {
		if key != "format" && key != "callback" {
			keys = append(keys, key)
		}
	}
	sort.Strings(keys)

	var input strings.Builder
	for _, key := range keys {
		input.WriteString(key)
		input.WriteString(values.Get(key))
	}
	input.WriteString(secret)

	sum := md5.Sum([]byte(input.String())) // Last.fm's required API signature algorithm.

	return hex.EncodeToString(sum[:])
}

func lastFMCall(values url.Values) (*lastFMResponse, error) {
	key, secret, err := lastFMCredentials()
	if err != nil {
		return nil, err
	}

	values.Set("api_key", key)
	values.Set("api_sig", lastFMSign(values, secret))
	values.Set("format", "json")

	response, err := lastFMHTTPClient.PostForm(lastFMAPIURL, values)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	var result lastFMResponse
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
			return nil, fmt.Errorf("Last.fm: HTTP %s", response.Status)
		}
		return nil, fmt.Errorf("Last.fm: invalid response: %w", err)
	}

	if result.Error != 0 {
		return nil, &lastFMError{Code: result.Error, Message: result.Message}
	}

	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("Last.fm: HTTP %s", response.Status)
	}

	return &result, nil
}

func lastFMStatusHandler(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	configured := os.Getenv("LASTFM_API_KEY") != "" && os.Getenv("LASTFM_API_SECRET") != ""
	respondJSON(w, map[string]any{"configured": configured, "connected": user.LastFMSession != "", "pending": user.LastFMToken != "", "username": user.LastFMUsername})
}

func lastFMUpdatedUser(r *http.Request) ([]User, *User) {
	updated := slices.Clone(users)
	username, _ := r.Context().Value("username").(string)

	for i := range updated {
		if updated[i].Username == username {
			return updated, &updated[i]
		}
	}

	return updated, nil
}

func lastFMConnectHandler(w http.ResponseWriter, r *http.Request) {
	result, err := lastFMCall(url.Values{"method": {"auth.getToken"}})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}

	updated, user := lastFMUpdatedUser(r)
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	user.LastFMToken = result.Token
	if err := saveUsers(updated); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update the global users slice after saving to ensure consistency.
	users = updated

	url := "https://www.last.fm/api/auth/?api_key=" + url.QueryEscape(os.Getenv("LASTFM_API_KEY")) + "&token=" + url.QueryEscape(result.Token)
	respondJSON(w, map[string]string{"url": url})
}

func lastFMCompleteHandler(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	if user == nil || user.LastFMToken == "" {
		http.Error(w, "No Last.fm connection is pending", http.StatusBadRequest)
		return
	}

	token := user.LastFMToken
	result, err := lastFMCall(url.Values{"method": {"auth.getSession"}, "token": {token}})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}

	updated, user := lastFMUpdatedUser(r)
	if user == nil || user.LastFMToken != token {
		http.Error(w, "Last.fm connection changed", http.StatusConflict)
		return
	}

	user.LastFMUsername, user.LastFMSession, user.LastFMToken = result.Session.Name, result.Session.Key, ""
	if err := saveUsers(updated); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update the global users slice after saving to ensure consistency.
	users = updated

	respondJSON(w, map[string]string{})
}

func lastFMDisconnectHandler(w http.ResponseWriter, r *http.Request) {
	updated, user := lastFMUpdatedUser(r)
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	user.LastFMUsername, user.LastFMSession, user.LastFMToken = "", "", ""
	if err := saveUsers(updated); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update the global users slice after saving to ensure consistency.
	users = updated

	respondJSON(w, map[string]string{})
}

func lastFMTrackHandler(method string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var track lastFMTrack
		if err := json.NewDecoder(r.Body).Decode(&track); err != nil || track.Artist == "" || track.Track == "" {
			http.Error(w, "Artist and track are required", http.StatusBadRequest)
			return
		}

		user := currentUser(r)
		if user == nil || user.LastFMSession == "" {
			http.Error(w, "Last.fm is not connected", http.StatusConflict)
			return
		}

		session := user.LastFMSession
		values := url.Values{"method": {method}, "artist": {track.Artist}, "track": {track.Track}, "sk": {session}}

		if track.Album != "" {
			values.Set("album", track.Album)
		}

		if track.Duration > 0 {
			values.Set("duration", fmt.Sprint(math.Round(track.Duration)))
		}

		if method == "track.scrobble" {
			if track.Timestamp == 0 {
				track.Timestamp = time.Now().Unix()
			}
			values.Set("timestamp", fmt.Sprint(track.Timestamp))
		}

		result, err := lastFMCall(values)
		if err != nil {
			logger.Log.Printf("Last.fm %s failed for %q by %q: %v", method, track.Track, track.Artist, err)

			var apiErr *lastFMError
			if errors.As(err, &apiErr) && apiErr.Code == 9 {
				updated, user := lastFMUpdatedUser(r)

				if user != nil && user.LastFMSession == session {
					user.LastFMUsername, user.LastFMSession, user.LastFMToken = "", "", ""
					if err := saveUsers(updated); err != nil {
						logger.Log.Printf("Failed to clear invalid Last.fm session: %v", err)
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
					users = updated
				}

				http.Error(w, "Last.fm session expired; reconnect", http.StatusConflict)
				return
			}

			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}

		ignored := result.NowPlaying.Ignored

		if method == "track.scrobble" {
			ignored = result.Scrobbles.Scrobble.Ignored
		}

		if ignored.Code != "" && ignored.Code != "0" {
			message := ignored.Text
			if message == "" {
				message = "ignored with code " + ignored.Code
			}
			logger.Log.Printf("Last.fm %s ignored %q by %q: %s", method, track.Track, track.Artist, message)
			http.Error(w, "Last.fm: "+message, http.StatusUnprocessableEntity)
			return
		}

		respondJSON(w, map[string]any{})
	}
}

var lastFMNowPlayingHandler = lastFMTrackHandler("track.updateNowPlaying")
var lastFMScrobbleHandler = lastFMTrackHandler("track.scrobble")
