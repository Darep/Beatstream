package main

import (
	"os"

	"github.com/Darep/Beatstream-go/logger"
	"github.com/joho/godotenv"
)

var MusicPath string

func main() {
	godotenv.Load()

	MusicPath = os.Getenv("MUSIC_PATH")
	if MusicPath == "" {
		logger.Log.Fatal("MUSIC_PATH environment variable not set")
	}

	err := loadUsers()
	if err != nil {
		logger.Log.Fatalf("Failed to load user configuration: %v", err)
	}

	startApi()
}
