package main

import (
	"bytes"
	"encoding/binary"
	"os"
	"path/filepath"
	"testing"
)

// mpegFrames returns MPEG-1 Layer III frames at 44.1 kHz with empty bodies; 32 kbps is index 1 and 128 kbps index 9.
func mpegFrames(bitrateIndex byte, count int) []byte {
	frame, _ := parseMPEGFrame([]byte{0xFF, 0xFB, bitrateIndex << 4, 0xC4})
	data := make([]byte, frame.size)
	copy(data, []byte{0xFF, 0xFB, bitrateIndex << 4, 0xC4})
	return bytes.Repeat(data, count)
}

func TestNewSongFromFileWithoutMPEGSummary(t *testing.T) {
	// 1,000 frames of 1,152 samples at 44.1 kHz last 26.1 seconds.
	const want = 26
	silence, music := mpegFrames(1, 200), mpegFrames(9, 800)
	variable := append(append([]byte{}, silence...), music...)

	// An APEv2 tag holding one item, with a footer and no header.
	item := append(binary.LittleEndian.AppendUint32(nil, 3), 0, 0, 0, 0)
	item = append(item, "Comment\x00tag"...)
	footer := binary.LittleEndian.AppendUint32([]byte("APETAGEX"), 2000)
	footer = binary.LittleEndian.AppendUint32(footer, uint32(len(item)+32))
	footer = binary.LittleEndian.AppendUint32(footer, 1)
	apeTag := append(item, append(footer, make([]byte, 12)...)...)

	id3v1Tag := append([]byte("TAG"), make([]byte, 125)...)
	junk := bytes.Repeat([]byte{0xFF, 0xFB, 0x00, 0x7F}, 16)

	for name, data := range map[string][]byte{
		"constant bitrate":                    mpegFrames(9, 1000),
		"variable bitrate after silence":      variable,
		"variable bitrate with trailing tags": append(append(append([]byte{}, variable...), apeTag...), id3v1Tag...),
		"variable bitrate with zero padding":  append(append([]byte{}, variable...), make([]byte, 512)...),
		"variable bitrate with damaged data":  append(append(append([]byte{}, silence...), junk...), music...),
	} {
		t.Run(name, func(t *testing.T) {
			path := filepath.Join(t.TempDir(), "song.mp3")
			if err := os.WriteFile(path, data, 0o600); err != nil {
				t.Fatal(err)
			}

			song, err := newSongFromFile(path)
			if err != nil {
				t.Fatal(err)
			}
			if song == nil || song.Length != want {
				t.Fatalf("song = %#v, want a %d-second song", song, want)
			}
		})
	}
}

func TestParseMPEGFrame(t *testing.T) {
	for _, tt := range []struct {
		name    string
		header  []byte
		samples int
		size    int64
	}{
		{"MPEG-1 Layer III with padding", []byte{0xFF, 0xFB, 0x92, 0x00}, 1152, 418},
		{"MPEG-2 Layer III", []byte{0xFF, 0xF3, 0x80, 0x00}, 576, 208},
		{"MPEG-1 Layer II", []byte{0xFF, 0xFD, 0xA0, 0x00}, 1152, 626},
		{"MPEG-1 Layer I", []byte{0xFF, 0xFF, 0xC0, 0x00}, 384, 416},
		{"free format", []byte{0xFF, 0xFB, 0x00, 0x00}, 0, 0},
		{"reserved sample rate", []byte{0xFF, 0xFB, 0x9C, 0x00}, 0, 0},
		{"not a frame", []byte("ID3\x04"), 0, 0},
	} {
		frame, ok := parseMPEGFrame(tt.header)
		if ok != (tt.size != 0) || frame.samples != tt.samples || frame.size != tt.size {
			t.Errorf("%s: frame = %+v, %v, want %d samples in %d bytes", tt.name, frame, ok, tt.samples, tt.size)
		}
	}
}
