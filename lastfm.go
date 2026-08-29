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
	"sort"
	"strings"
	"time"
)

var lastFMAPIURL = "https://ws.audioscrobbler.com/2.0/"
var lastFMHTTPClient = &http.Client{Timeout: 10 * time.Second}

type lastFMResponse struct {
	Token   string `json:"token"`
	Session struct {
		Name string `json:"name"`
		Key  string `json:"key"`
	} `json:"session"`
	Error   int    `json:"error"`
	Message string `json:"message"`
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
		return nil, err
	}
	if result.Error != 0 {
		return nil, fmt.Errorf("Last.fm: %s", result.Message)
	}
	return &result, nil
}

func lastFMStatusHandler(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	respondJSON(w, map[string]any{"configured": os.Getenv("LASTFM_API_KEY") != "" && os.Getenv("LASTFM_API_SECRET") != "", "connected": user.LastFMSession != "", "username": user.LastFMUsername})
}

func lastFMConnectHandler(w http.ResponseWriter, r *http.Request) {
	result, err := lastFMCall(url.Values{"method": {"auth.getToken"}})
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	user := currentUser(r)
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	user.LastFMToken = result.Token
	if err := saveUsers(users); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	respondJSON(w, map[string]string{"url": "https://www.last.fm/api/auth/?api_key=" + url.QueryEscape(os.Getenv("LASTFM_API_KEY")) + "&token=" + url.QueryEscape(result.Token)})
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
	user = currentUser(r)
	if user == nil || user.LastFMToken != token {
		http.Error(w, "Last.fm connection changed", http.StatusConflict)
		return
	}
	user.LastFMUsername, user.LastFMSession, user.LastFMToken = result.Session.Name, result.Session.Key, ""
	if err := saveUsers(users); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	respondJSON(w, map[string]any{"connected": true, "username": user.LastFMUsername})
}

func lastFMDisconnectHandler(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	if user == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	user.LastFMUsername, user.LastFMSession, user.LastFMToken = "", "", ""
	if err := saveUsers(users); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	respondJSON(w, map[string]any{"connected": false})
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
		if _, err := lastFMCall(values); err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		respondJSON(w, map[string]any{})
	}
}

var lastFMNowPlayingHandler = lastFMTrackHandler("track.updateNowPlaying")
var lastFMScrobbleHandler = lastFMTrackHandler("track.scrobble")
