interface Song {
  album: string;
  artist: string;
  length: number;
  nice_length: string;
  nice_title: string;
  path: string;
  title: string;
  track_num: number;
}

interface Playlist {
  id: string;
  name: string;
  username: string;
  songs: string[];
  created_at: string;
}
