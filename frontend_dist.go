//go:build !dev

package main

import "embed"

//go:embed frontend/dist
var distFS embed.FS
