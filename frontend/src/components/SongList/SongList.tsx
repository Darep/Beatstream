import { useEffect, useMemo } from 'react';

import { useSongs } from 'hooks/swr';

import { usePlayerStore } from 'store';

import { DataGrid } from './DataGrid';
import styles from './SongList.module.css';

export const SongList = () => {
  const playlist = usePlayerStore((s) => s.playlist);
  const playSongAtIndex = usePlayerStore((s) => s.playSongAtIndex);
  const search = usePlayerStore((s) => s.search);
  const song = usePlayerStore((s) => s.song);
  const sort = usePlayerStore((s) => s.sort);
  const sortDir = usePlayerStore((s) => s.sortDir);
  const songsLoaded = usePlayerStore((s) => s.songsLoaded);
  const sortPlaylist = usePlayerStore((s) => s.sortPlaylist);

  const { data: songs = [] } = useSongs();

  useEffect(() => {
    if (songs?.length > 0) {
      songsLoaded(songs);
    }
  }, [songs, songsLoaded]);

  const playingSongIndex = useMemo(() => {
    if (!song) {
      return undefined;
    } else {
      return playlist.findIndex((s) => s.path === song.path);
    }
  }, [song, playlist]);

  return (
    <>
      {playlist.length === 0 ? (
        search.trim() === '' ? (
          <div className={styles.empty}>No songs in playlist.</div>
        ) : (
          <div className={styles.empty}>No songs found.</div>
        )
      ) : (
        <DataGrid
          activeRow={playingSongIndex}
          items={playlist}
          sort={sort}
          sortDir={sortDir}
          onActivateRow={(row) => playSongAtIndex(row)}
          onSort={(column) => sortPlaylist(column)}
        />
      )}
    </>
  );
};
