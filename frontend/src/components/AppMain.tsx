import classnames from 'classnames';

import { SongList } from 'components/SongList';

import { usePlayerStore } from 'store';

import styles from './AppMain.module.css';

const PlaylistHeaderInfo = () => {
  const playlistLength = usePlayerStore((s) => s.playlist.length);

  return (
    <div className={styles['playlist-header__details']}>
      <h2 className={styles.title}>All music</h2>
      <p className={styles.meta}>
        <span className={styles.count}>
          {playlistLength.toLocaleString() ?? 0} song
          {playlistLength === 1 ? '' : 's'}
        </span>
      </p>
    </div>
  );
};

const PlaylistSearch = () => {
  const search = usePlayerStore((s) => s.search);
  const filterPlaylist = usePlayerStore((s) => s.filterPlaylist);

  const handleSearch = (searchString: string) => {
    // FIXME: debounce
    filterPlaylist(searchString);
  };

  return (
    <div className={styles.search}>
      <input
        id={styles.search}
        type="text"
        placeholder="Find songs"
        value={search}
        onChange={(e) => handleSearch(e.currentTarget.value)}
      />
      <button type="button" className={styles['search-clear']} onClick={() => filterPlaylist('')}>
        clear
      </button>
    </div>
  );
};

export const AppMain = ({ className }: { className?: string }) => {
  return (
    <div className={classnames(styles['app-main'], className)}>
      <div className={styles['playlist-header']}>
        <PlaylistHeaderInfo />
        <PlaylistSearch />
      </div>
      <div className={styles['grid-container']}>
        <SongList />
      </div>
    </div>
  );
};
