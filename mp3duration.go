package main

import (
	"encoding/binary"
	"os"
	"time"
)

// mp3Duration measures an MP3 that has no Xing/VBRI summary. A constant bitrate gives the duration from the file size;
// otherwise every frame is counted, which reads the whole file and is slow on network shares.
//
// mtag is not used here because it judges the bitrate from the first frames only, so a variable-bitrate file that
// opens with silence looks constant, and because its frame count gives up at the first byte that is not a frame.
func mp3Duration(path string) time.Duration {
	file, err := os.Open(path)
	if err != nil {
		return 0
	}
	defer file.Close()

	stream := mpegStream{file: file, end: audioEnd(file)}
	offset, first, ok := stream.sync(stream.audioStart())
	if !ok {
		return 0
	}
	stream.format = first

	if frames, ok := stream.constantBitrateFrames(offset); ok {
		return samplesDuration(frames*float64(first.samples), first.sampleRate)
	}

	var samples int64
	for offset+mpegHeaderSize <= stream.end {
		frame, ok := stream.frameAt(offset)
		if !ok {
			if offset, frame, ok = stream.sync(offset + 1); !ok {
				break
			}
		}
		samples += int64(frame.samples)
		offset += frame.size
	}
	return samplesDuration(float64(samples), first.sampleRate)
}

func samplesDuration(samples float64, sampleRate int) time.Duration {
	return time.Duration(samples / float64(sampleRate) * float64(time.Second))
}

const mpegHeaderSize = 4

type mpegFrame struct {
	version    byte // header bits: 3 is MPEG-1, 2 is MPEG-2, 0 is MPEG-2.5
	layer      byte // header bits: 3 is Layer I, 2 is Layer II, 1 is Layer III
	sampleRate int
	bitrate    int // bits per second
	samples    int
	size       int64
}

func (frame mpegFrame) sameFormat(other mpegFrame) bool {
	return frame.version == other.version && frame.layer == other.layer && frame.sampleRate == other.sampleRate
}

// Kilobits per second by bitrate index, for MPEG-1 Layers I, II, III, then MPEG-2/2.5 Layer I and Layers II/III.
var mpegBitrates = [5][16]int{
	{0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448},
	{0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384},
	{0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320},
	{0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256},
	{0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160},
}

func parseMPEGFrame(header []byte) (mpegFrame, bool) {
	if header[0] != 0xFF || header[1]&0xE0 != 0xE0 {
		return mpegFrame{}, false
	}
	version, layer := header[1]>>3&3, header[1]>>1&3
	rateIndex := header[2] >> 2 & 3
	if version == 1 || layer == 0 || rateIndex == 3 {
		return mpegFrame{}, false
	}

	row := 3 - int(layer)
	sampleRate := [3]int{44100, 48000, 32000}[rateIndex]
	if version != 3 {
		row = 4
		if layer == 3 {
			row = 3
		}
		sampleRate /= 2
		if version == 0 {
			sampleRate /= 2
		}
	}
	bitrate := mpegBitrates[row][header[2]>>4] * 1000
	if bitrate == 0 {
		return mpegFrame{}, false
	}

	frame := mpegFrame{version: version, layer: layer, sampleRate: sampleRate, bitrate: bitrate}
	padding := int(header[2] >> 1 & 1)
	switch {
	case layer == 3:
		frame.samples, frame.size = 384, int64(12*bitrate/sampleRate+padding)*4
	case layer == 2 || version == 3:
		frame.samples, frame.size = 1152, int64(144*bitrate/sampleRate+padding)
	default:
		frame.samples, frame.size = 576, int64(72*bitrate/sampleRate+padding)
	}
	return frame, true
}

// mpegStream reads the file in chunks, because on a network share every read is a round trip to the server.
type mpegStream struct {
	file   *os.File
	end    int64     // where the audio ends and trailing tags begin
	format mpegFrame // the first frame; zero until it is found

	buffer      [16 << 10]byte
	bufferStart int64
	bufferSize  int64
}

// read returns up to a buffer of the audio at offset, and fewer than length bytes only where the audio ends.
func (stream *mpegStream) read(offset, length int64) []byte {
	length = min(length, stream.end-offset)
	if length <= 0 {
		return nil
	}
	if offset < stream.bufferStart || offset+length > stream.bufferStart+stream.bufferSize {
		size := min(int64(len(stream.buffer)), stream.end-offset)
		n, _ := stream.file.ReadAt(stream.buffer[:size], offset)
		stream.bufferStart, stream.bufferSize = offset, int64(n)
	}
	available := stream.bufferStart + stream.bufferSize - offset
	return stream.buffer[offset-stream.bufferStart:][:min(length, available)]
}

// audioStart skips a leading ID3v2 tag.
func (stream *mpegStream) audioStart() int64 {
	header := stream.read(0, 10)
	if len(header) < 10 || string(header[:3]) != "ID3" {
		return 0
	}
	size := int64(header[6])<<21 | int64(header[7])<<14 | int64(header[8])<<7 | int64(header[9])
	if header[5]&0x10 != 0 {
		size += 10 // footer
	}
	return 10 + size
}

func (stream *mpegStream) frameAt(offset int64) (mpegFrame, bool) {
	header := stream.read(offset, mpegHeaderSize)
	if len(header) < mpegHeaderSize {
		return mpegFrame{}, false
	}
	frame, ok := parseMPEGFrame(header)
	if !ok || stream.format.sampleRate != 0 && !frame.sameFormat(stream.format) {
		return mpegFrame{}, false
	}
	return frame, true
}

// sync finds the next frame at or after offset. Tags and damaged data can hold bytes that look like a frame header, so
// a frame only counts when another frame of the same format follows it or it is the last one in the file.
func (stream *mpegStream) sync(offset int64) (int64, mpegFrame, bool) {
	for ; offset+mpegHeaderSize <= stream.end; offset++ {
		frame, ok := stream.frameAt(offset)
		if !ok {
			continue
		}
		// One read covers both headers, so a false match does not cost a round trip.
		both := stream.read(offset, frame.size+mpegHeaderSize)
		if int64(len(both)) < frame.size+mpegHeaderSize {
			return offset, frame, true
		}
		if following, ok := parseMPEGFrame(both[frame.size:]); ok && following.sameFormat(frame) {
			return offset, frame, true
		}
	}
	return 0, mpegFrame{}, false
}

// A constant-bitrate file has the same bitrate at its start and in its middle.
const bitrateSampleFrames = 16

// constantBitrateFrames samples the stream and, when every sampled frame has the first frame's bitrate, returns the
// number of frames the stream holds. The count comes from the sampled frame sizes, not the nominal bitrate, because
// encoders that never pad frames write slightly fewer bytes per second than the bitrate says.
func (stream *mpegStream) constantBitrateFrames(start int64) (float64, bool) {
	var frames, size int64
	for _, offset := range []int64{start, start + (stream.end-start)/2} {
		offset, frame, ok := stream.sync(offset)
		for range bitrateSampleFrames {
			if !ok || frame.bitrate != stream.format.bitrate {
				return 0, false
			}
			frames, size = frames+1, size+frame.size
			offset += frame.size
			if offset+mpegHeaderSize > stream.end {
				break
			}
			frame, ok = stream.frameAt(offset)
		}
	}
	return float64(stream.end-start) * float64(frames) / float64(size), true
}

// audioEnd leaves out a trailing ID3v1 tag and the APE tag before it.
func audioEnd(file *os.File) int64 {
	info, err := file.Stat()
	if err != nil {
		return 0
	}
	end := info.Size()

	var tail [128 + 32]byte
	if end < int64(len(tail)) {
		return end
	}
	if _, err := file.ReadAt(tail[:], end-int64(len(tail))); err != nil {
		return end
	}
	footer := tail[128:]
	if string(tail[32:35]) == "TAG" {
		end -= 128
		footer = tail[:32]
	}
	if string(footer[:8]) == "APETAGEX" {
		size := int64(binary.LittleEndian.Uint32(footer[12:16]))
		if binary.LittleEndian.Uint32(footer[20:24])&(1<<31) != 0 {
			size += 32 // header
		}
		if size <= end {
			end -= size
		}
	}
	return end
}
