package main

import (
	"embed"
	"io/fs"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"

	"github.com/Darep/Beatstream-go/logger"
)

//go:embed frontend/dist/**/*
//go:embed frontend/dist/*
var distFS embed.FS

func frontendHandler(w http.ResponseWriter, r *http.Request) {
	env := os.Getenv("ENV")

	viteUrl := os.Getenv("VITE_URL")
	if viteUrl == "" {
		viteUrl = "http://localhost:5173"
	}

	if env == "dev" {
		target, err := url.Parse(viteUrl)
		if err != nil {
			logger.Log.Fatalf("Could not parse VITE_URL: %s", viteUrl)
		}
		proxy := httputil.NewSingleHostReverseProxy(target)
		proxy.ServeHTTP(w, r)
	} else {
		subFS, err := fs.Sub(distFS, "frontend/dist")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		http.FileServer(http.FS(subFS)).ServeHTTP(w, r)
	}
}
