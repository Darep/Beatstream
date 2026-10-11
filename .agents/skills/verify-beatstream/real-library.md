# Real library

The demo WAVs carry no tags, so they cannot prove a change to metadata reading, library refresh, or format support.
For those changes, index the user's real library with both the base branch and the change and compare the results.

## Where the music is

`/home/ajk/Music` on `ajktux` is a CIFS mount of `//ajknasse/Multimedia/Musat` (about 45 GB). Check with
`findmnt -T ~/Music`: an empty local directory means the share is not mounted; ask the user to mount it. The share is
the user's collection, so mount it read-only and never write to it.

It holds about 5,900 indexable files (5,728 MP3, 73 FLAC, 65 Ogg, 29 M4A, 5 WAV, no AAC) plus 300 macOS `._*`
AppleDouble sidecars that both TagLib and mtag skip as zero-length. A full refresh takes about 2.5 minutes with a
warm share. A much slower refresh means the reader is pulling whole files over the network (for example, scanning
every MPEG frame); time the refresh for both builds.

## Compare base and head

```bash
S=.agents/skills/verify-beatstream/scripts
RUN_ID=head MUSIC_DIR=~/Music $S/beatstream.sh up
RUN_ID=base MUSIC_DIR=~/Music REF=master $S/beatstream.sh up   # builds master from a worktree in tmp/verify/base/src
```

For each instance, log in and refresh, then dump the library. This is a read-back of state, so calling the API is fine:

```bash
curl -s -c c.txt -u admin:admin -X POST "$URL/api/session" -o /dev/null
curl -s -b c.txt -X POST "$URL/api/songs/refresh" -o /dev/null --max-time 900
curl -s -b c.txt "$URL/api/songs" > head.json
python3 $S/compare-songs.py base.json head.json
```

Then search for each file below in the UI and double-click it. Capture the row and check that `#audio` plays.
Decode a disputed duration with `ffmpeg -v error -stats -i <file> -f null -` and compare against the last `time=`.

## Files that exercise edge cases

| Search | Path | What it exercises |
|---|---|---|
| `Talvikuningas` | `CMX/CMX - Talvikuningas/*.flac` | FLAC Vorbis comments, Finnish `ä` in titles, 10-minute track |
| `翼に乗せて` | `Tatsuro Yamashita/1977 - SPACY/*.flac` | Japanese titles in FLAC and in file names |
| `Melodies` | `Tatsuro Yamashita/1983 - Melodies/*.mp3` | Japanese titles in ID3v2 |
| `IOSYS` | `02 - ûéù¥ì¦é-æsò-é+éaé¦é=ôÉé±é+éóé½é_é¦é+ - IOSYS.mp3` | Mojibake file name, Japanese album tag `東方乙女囃子` |
| `No Funk About It` | `Eternal Erection/No Funk About It/*.ogg` | Ogg Vorbis comments |
| `Mount Eden Album` | `Mt Eden/Mount Eden Album/*.m4a` | MP4 atoms |
| `Stam1na` | `Stam1na/Uudet Kymmenen Käskyä/*.mp3` | ID3v2.4 UTF-16 frames with a single NUL terminator; Finnish `ä` |
| `Seith` | `Seith - Alas/*.mp3` | Same single-NUL UTF-16 frames (`Seith`, `Alas`) |
| `Metallica` | `Metallica - Death Magnetic - v.GHIII by D34DL1N3R/*.mp3` | Same single-NUL UTF-16 frames in title, artist, album |
| `Designer Drugs` | `Le Castle Vania/backupinthisremix.mp3` | ID3v2.2 `TP1` padded with NULs, which splits into empty values |
| `Porcupine Tree` | `Porcupine Tree/In Absentia/09 The Creator Has A Mastertape.mp3` | Same NUL-padded ID3v2.2 frames |
| `Kreator` | `Kreator/Live_Kreation-2CD-Promo-2003-AMRC/*.mp3` | Disc number only in an APE tag (CD1 and CD2) |
| `Green Day` | `Green_Day-21st_Century_Breakdown-(Retail)-2009-H3X/*.mp3` | Disc number only in an APE tag |
| `Kai Tracid` | `07. Kai Tracid - Conscious (A.S.Y.S. remix).mp3` | VBR without Xing header (decodes to 245 s) |
| `00000000000000235727` | `00000000000000235727_1.mp3` | VBR without Xing header (decodes to 251 s) |
| `Talova` | `Teknika b2b wallu - Talova.mp3` | 2.5-hour mix |
| `Calling Elvis` | `Dire Straits - 2000 - Sultans Of Swing/17 - Calling Elvis.mp3` | Damaged MP3: ~2,000 bad frames, decodes to 258 s, estimators say 216–545 s |

Upstream mtag v1.0.2 drops the last character of the single-NUL UTF-16 frames (`Stam1n`, `Seit`, `Metallic`), so
searching `Stam1na` loses the *Uudet Kymmenen Käskyä* album. `go.mod` replaces mtag with the `Darep/mtag` fork
(branch `fix/utf16-single-nul-terminator`), which fixes it; check these albums whenever that `replace` changes.

`Calling Elvis`, `Viva Las Vegas` (Dead Kennedys), and `Flat Beat` (Mr. Oizo) have damaged frames, so no reader gets
their duration exactly. Don't count a difference there as a regression unless the new value moves further from the
decoded duration.
