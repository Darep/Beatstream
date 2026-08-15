package main

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func useTempDataPath(t *testing.T) {
	oldDataPath, oldSongsFilePath, oldUsersFilePath := dataPath, songsFilePath, usersFilePath
	dir := t.TempDir()
	t.Setenv("DATA_PATH", dir)
	if err := configureDataPath(); err != nil {
		t.Fatal(err)
	}
	if dataPath != dir {
		t.Fatalf("data path = %q, want %q", dataPath, dir)
	}
	t.Cleanup(func() { dataPath, songsFilePath, usersFilePath = oldDataPath, oldSongsFilePath, oldUsersFilePath })
}

func TestLoadUsersMigratesPlaintextPasswords(t *testing.T) {
	useTempDataPath(t)

	if err := os.WriteFile(usersFilePath, []byte(`[{"username":"alice","password":"secret"}]`), 0600); err != nil {
		t.Fatal(err)
	}

	if err := loadUsers(); err != nil {
		t.Fatal(err)
	}

	data, err := os.ReadFile(usersFilePath)
	if err != nil {
		t.Fatal(err)
	}
	var migrated []User
	if err := json.Unmarshal(data, &migrated); err != nil {
		t.Fatal(err)
	}
	if migrated[0].Password == "secret" {
		t.Fatal("password was not migrated")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(migrated[0].Password), []byte("secret")); err != nil {
		t.Fatal("migrated password no longer authenticates")
	}
}

func TestPasswordHandlerHashesNewPassword(t *testing.T) {
	useTempDataPath(t)

	password, err := bcrypt.GenerateFromPassword([]byte("old"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatal(err)
	}
	users = []User{{Username: "alice", Password: string(password)}}
	sessions = []Session{{Token: "token", Username: "alice"}}

	req := httptest.NewRequest(http.MethodPut, "/api/password", bytes.NewBufferString(`{"currentPassword":"old","newPassword":"new"}`))
	req.AddCookie(&http.Cookie{Name: "session", Value: "token"})
	req = req.WithContext(context.WithValue(req.Context(), "username", "alice"))
	response := httptest.NewRecorder()
	passwordHandler(response, req)

	if response.Code != http.StatusOK {
		t.Fatalf("unexpected status: %d", response.Code)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(users[0].Password), []byte("new")); err != nil {
		t.Fatal("new password was not hashed")
	}
}
