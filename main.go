package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/Darep/Beatstream/logger"
	"github.com/joho/godotenv"
)

var MusicPath string
var DataPath = "."
var version = "dev"
var revision = "unknown"

func dataFilePath(name string) string {
	return filepath.Join(DataPath, name)
}

func main() {
	if len(os.Args) > 1 && os.Args[1] == "--version" {
		fmt.Printf("Beatstream %s (%s)\n", version, revision)
		return
	}

	godotenv.Load()

	MusicPath = os.Getenv("MUSIC_PATH")
	if MusicPath == "" {
		logger.Log.Fatal("MUSIC_PATH environment variable not set")
	}
	if path := os.Getenv("DATA_PATH"); path != "" {
		DataPath = path
	}
	if err := os.MkdirAll(DataPath, 0o700); err != nil {
		logger.Log.Fatalf("Failed to create data directory: %v", err)
	}

	err := loadUsers()
	if err != nil {
		logger.Log.Fatalf("Failed to load user configuration: %v", err)
	}

	startApi()
}
