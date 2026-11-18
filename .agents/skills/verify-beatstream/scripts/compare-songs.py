#!/usr/bin/env python3
"""Compare two /api/songs dumps field by field.

    compare-songs.py <base.json> <head.json> [examples-per-field]

Prints files present in only one dump, counts per extension, and for each metadata field the number of differences
by extension with examples. Length differences are summarized as a histogram of head - base seconds.
"""
import collections
import json
import sys

FIELDS = ["title", "artist", "album", "track_num", "disc_num", "length"]

base = {s["path"]: s for s in json.load(open(sys.argv[1]))}
head = {s["path"]: s for s in json.load(open(sys.argv[2]))}
limit = int(sys.argv[3]) if len(sys.argv) > 3 else 10

print(f"base: {len(base)} songs, head: {len(head)} songs")
for sign, paths in (("-", base.keys() - head.keys()), ("+", head.keys() - base.keys())):
    for path in sorted(paths):
        print(f"  {sign} {path}")
print("by extension:", dict(collections.Counter(s["extension"] for s in head.values())))

for field in FIELDS:
    diffs = sorted(
        (path, base[path][field], head[path][field])
        for path in base.keys() & head.keys()
        if base[path][field] != head[path][field]
    )
    by_ext = collections.Counter(path.rsplit(".", 1)[-1].lower() for path, _, _ in diffs)
    print(f"\n== {field}: {len(diffs)} differences {dict(by_ext)}")
    if field == "length":
        deltas = collections.Counter((h or 0) - (b or 0) for _, b, h in diffs)
        print("   head - base seconds:", sorted(deltas.items()))
    for path, b, h in diffs[:limit]:
        print(f"  {path}\n     base={b!r}\n     head={h!r}")
