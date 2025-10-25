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
    x = `${a.album.toLowerCase()} ${a.track_num}`;
    y = `${b.album.toLowerCase()} ${b.track_num}`;
  } else if (sortcol === 'artist') {
    x = `${a.artist.toLowerCase()} ${a.album.toLowerCase()} ${a.track_num}`;
    y = `${b.artist.toLowerCase()} ${b.album.toLowerCase()} ${b.track_num}`;
  }

  return naturalsort(x.toString(), y.toString());
};
