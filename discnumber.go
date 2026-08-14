package main

/*
#cgo pkg-config: taglib
#include <stdlib.h>
#include <tag_c.h>
*/
import "C"

import (
	"strconv"
	"strings"
	"unsafe"
)

// discNumber reads the "DISCNUMBER" tag from the audio file.
func discNumber(filename string) *int {
	cFilename := C.CString(filename)
	defer C.free(unsafe.Pointer(cFilename))

	file := C.taglib_file_new(cFilename)
	if file == nil {
		return nil
	}
	defer C.taglib_file_free(file)

	cProperty := C.CString("DISCNUMBER")
	defer C.free(unsafe.Pointer(cProperty))

	values := C.taglib_property_get(file, cProperty)
	if values == nil {
		return nil
	}
	defer C.taglib_property_free(values)

	return parseNumberTag(C.GoString(*(**C.char)(unsafe.Pointer(values))))
}

func parseNumberTag(value string) *int {
	number, err := strconv.Atoi(strings.SplitN(value, "/", 2)[0])
	if err != nil || number < 1 {
		return nil
	}
	return &number
}
