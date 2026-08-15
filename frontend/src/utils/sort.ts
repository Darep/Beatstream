import naturalsort from 'natural-compare-lite';

export const trackCompare = (sortcol: keyof Song) => (a: Song, b: Song) => {
  let x = a[sortcol];
  let y = b[sortcol];

  if (!x) {
    return 1;
  }
  if (!y) {
    return -1;
  }

  if (sortcol === 'album') {
    x = `${a.album.toLowerCase()} ${a.extension} ${a.disc_num ?? 0} ${a.track_num ?? 0}`;
    y = `${b.album.toLowerCase()} ${b.extension} ${b.disc_num ?? 0} ${b.track_num ?? 0}`;
  } else if (sortcol === 'artist') {
    x = `${a.artist.toLowerCase()} ${a.album.toLowerCase()} ${a.extension} ${a.disc_num ?? 0} ${a.track_num ?? 0}`;
    y = `${b.artist.toLowerCase()} ${b.album.toLowerCase()} ${b.extension} ${b.disc_num ?? 0} ${b.track_num ?? 0}`;
  } else if (sortcol === 'track_num') {
    x = `${a.disc_num ?? 0} ${a.track_num}`;
    y = `${b.disc_num ?? 0} ${b.track_num}`;
  }

  return naturalsort(x.toString(), y.toString());
};
