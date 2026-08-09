package taglib

// #cgo pkg-config: taglib
// #cgo LDFLAGS: -ltag_c
// #include <stdlib.h>
// #include <tag_c.h>
import "C"

import (
	"errors"
	"sync"
	"time"
	"unsafe"
)

var (
	ErrInvalid = errors.New("invalid file")
	mutex      sync.Mutex
)

type File struct {
	file       *C.TagLib_File
	tag        *C.TagLib_Tag
	properties *C.TagLib_AudioProperties
}

func init() {
	C.taglib_id3v2_set_default_text_encoding(3)
	C.taglib_set_string_management_enabled(0)
}

func Read(filename string) (*File, error) {
	mutex.Lock()
	defer mutex.Unlock()

	name := C.CString(filename)
	defer C.free(unsafe.Pointer(name))

	file := C.taglib_file_new(name)
	if file == nil {
		return nil, ErrInvalid
	}
	if C.taglib_file_is_valid(file) == 0 {
		C.taglib_file_free(file)
		return nil, ErrInvalid
	}

	return &File{
		file:       file,
		tag:        C.taglib_file_tag(file),
		properties: C.taglib_file_audioproperties(file),
	}, nil
}

func (file *File) Close() {
	mutex.Lock()
	defer mutex.Unlock()

	C.taglib_file_free(file.file)
	file.file = nil
	file.tag = nil
	file.properties = nil
}

func (file *File) Title() string {
	mutex.Lock()
	defer mutex.Unlock()
	return goString(C.taglib_tag_title(file.tag))
}

func (file *File) Artist() string {
	mutex.Lock()
	defer mutex.Unlock()
	return goString(C.taglib_tag_artist(file.tag))
}

func (file *File) Album() string {
	mutex.Lock()
	defer mutex.Unlock()
	return goString(C.taglib_tag_album(file.tag))
}

func (file *File) Track() int {
	mutex.Lock()
	defer mutex.Unlock()
	return int(C.taglib_tag_track(file.tag))
}

func (file *File) Length() time.Duration {
	mutex.Lock()
	defer mutex.Unlock()
	return time.Duration(C.taglib_audioproperties_length(file.properties)) * time.Second
}

func goString(value *C.char) string {
	if value == nil {
		return ""
	}
	defer C.free(unsafe.Pointer(value))
	return C.GoString(value)
}
