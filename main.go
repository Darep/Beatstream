package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/Darep/Beatstream/logger"
	"github.com/joho/godotenv"
)

const songsFileName = "songs.json"
const usersFileName = "users.json"

var MusicPath string
var dataPath = "."
var songsFilePath = songsFileName
var usersFilePath = usersFileName
var version = "dev"
var revision = "unknown"

func configureDataPath() error {
	dataPath = os.Getenv("DATA_PATH")
	if dataPath == "" {
		dataPath = "."
	}
	songsFilePath = filepath.Join(dataPath, songsFileName)
	usersFilePath = filepath.Join(dataPath, usersFileName)
	return os.MkdirAll(dataPath, 0o700)
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
	if err := configureDataPath(); err != nil {
		logger.Log.Fatalf("Failed to create data directory: %v", err)
	}

	err := loadUsers()
	if err != nil {
		logger.Log.Fatalf("Failed to load user configuration: %v", err)
	}

	startApi()
}
