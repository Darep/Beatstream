package main

import (
	"encoding/json"
	"os"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestLoadUsersMigratesPlaintextPasswords(t *testing.T) {
	dir := t.TempDir()
	oldDir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Chdir(dir); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chdir(oldDir) })

	if err := os.WriteFile("users.json", []byte(`[{"username":"alice","password":"secret"}]`), 0600); err != nil {
		t.Fatal(err)
	}

	if err := loadUsers(); err != nil {
		t.Fatal(err)
	}

	data, err := os.ReadFile("users.json")
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
