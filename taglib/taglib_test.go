package taglib

import (
	"errors"
	"path/filepath"
	"testing"
)

func TestReadMissingFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), "missing.mp3")
	if _, err := Read(path); !errors.Is(err, ErrInvalid) {
		t.Fatalf("got %v, want %v", err, ErrInvalid)
	}
}
