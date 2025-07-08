export const songFilter = (song: Song, search: string) => {
  if (search.trim() === '') {
    return true;
  }

  const searchStr = search.toLowerCase();
  const parts = searchStr.split(' ');

  return parts.every((s) => {
    if (
      !s ||
      (song.title && song.title.toLowerCase().includes(s)) ||
      (song.artist && song.artist.toLowerCase().includes(s)) ||
      (song.album && song.album.toLowerCase().includes(s)) ||
      (!song.title &&
        !song.artist &&
        !song.album &&
        song.path.toLowerCase().includes(s))
    ) {
      return true;
    } else {
      return false;
    }
  });
};
