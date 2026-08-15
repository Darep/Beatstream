package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"os"
	"slices"
	"time"

	"github.com/Darep/Beatstream/logger"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// holds all users in memory
var users []User

func loadUsers() error {
	file, err := os.Open(dataFilePath("users.json"))
	if err != nil {
		if os.IsNotExist(err) {
			file, err = createDefaultUser()
			if err != nil {
				return err
			}
		} else {
			// Some other error occurred
			return err
		}
	}
	defer file.Close()

	err = json.NewDecoder(file).Decode(&users)
	if err != nil {
		return err
	}

	migrated := false
	for i := range users {
		if _, err := bcrypt.Cost([]byte(users[i].Password)); err == nil {
			continue
		}

		password, err := bcrypt.GenerateFromPassword([]byte(users[i].Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		users[i].Password = string(password)
		migrated = true
	}
	if migrated {
		return saveUsers(users)
	}

	return nil
}

type Session struct {
	Token    string
	Username string
}

// Sessions array to store all active sessions
var sessions []Session

func createSessionToken() string {
	token := make([]byte, 16)
	rand.Read(token)
	sessionToken := hex.EncodeToString(token)
	logger.Log.Printf("Created session token: %s", sessionToken)
	return sessionToken
}

func createSession(user User) *Session {
	sessionToken := createSessionToken()
	session := Session{Token: sessionToken, Username: user.Username}
	sessions = append(sessions, session)
	return &session
}

func deleteSession(token string) {
	var newSessions []Session
	for _, session := range sessions {
		if session.Token != token {
			newSessions = append(newSessions, session)
		}
	}
	sessions = newSessions
}

func deleteOtherSessions(username, currentToken string) {
	sessions = slices.DeleteFunc(sessions, func(session Session) bool {
		return session.Username == username && session.Token != currentToken
	})
}

func saveUsers(updated []User) error {
	data, err := json.Marshal(updated)
	if err != nil {
		return err
	}

	file, err := os.CreateTemp(DataPath, ".users.json-*")
	if err != nil {
		return err
	}
	defer os.Remove(file.Name())

	if err := file.Chmod(0o600); err != nil {
		file.Close()
		return err
	}
	if _, err := file.Write(append(data, '\n')); err != nil {
		file.Close()
		return err
	}
	if err := file.Sync(); err != nil {
		file.Close()
		return err
	}
	if err := file.Close(); err != nil {
		return err
	}
	return os.Rename(file.Name(), dataFilePath("users.json"))
}

func getSession(token string) *Session {
	for _, session := range sessions {
		if session.Token == token {
			return &session
		}
	}
	return nil
}

func createSessionCookie(token string) *http.Cookie {
	return &http.Cookie{
		Name:     "session",
		Value:    token,
		Expires:  time.Now().Add(30 * 24 * time.Hour), // Cookie expires after 30 days
		HttpOnly: true,                                // The cookie is not accessible via JavaScript
		// Secure: true // FIXME: enable when we have HTTPS
		SameSite: http.SameSiteStrictMode,
	}
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		session := getSession(cookie.Value)

		if session == nil {
			if os.Getenv("DISABLE_LOGIN") == "true" {
				session = createSession(User{Username: "Anonymous", Password: ""})
				http.SetCookie(w, createSessionCookie(session.Token))
			} else {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
		}

		ctx := context.WithValue(r.Context(), "username", session.Username)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func createDefaultUser() (*os.File, error) {
	password, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	if err := saveUsers([]User{{Username: "admin", Password: string(password)}}); err != nil {
		return nil, err
	}

	logger.Log.Println("Created default user \"admin\" in users.json")

	file, err := os.Open(dataFilePath("users.json"))
	if err != nil {
		return nil, err
	}

	return file, nil
}
