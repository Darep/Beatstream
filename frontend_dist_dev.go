//go:build !production

package main

import "io/fs"

var distFS fs.FS
