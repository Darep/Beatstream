package logger

import (
	"log"
	"os"
)

var Log = log.New(os.Stdout, "", log.LstdFlags)
