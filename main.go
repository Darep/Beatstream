package main

import (
	"fmt"
	"os"

	"github.com/Darep/Beatstream/logger"
	"github.com/joho/godotenv"
)

var MusicPath string
var version = "dev"
var revision = "unknown"

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

	err := loadUsers()
	if err != nil {
		logger.Log.Fatalf("Failed to load user configuration: %v", err)
	}

	startApi()
}
