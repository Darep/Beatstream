import classNames from 'classnames';
import { useRef } from 'react';

import { useSongs } from 'hooks/swr';

import { usePlayerStore } from 'store';

import styles from './AppNav.module.css';

export const AppNav = ({ className }: { className?: string }) => {
  const { data: songs } = useSongs();
  const width = usePlayerStore((s) => s.appNavWidth);
  const resize = usePlayerStore((s) => s.resizeAppNav);
  const resetWidth = usePlayerStore((s) => s.resetAppNavWidth);

  const isLoadingPlaylists = false;
  const showPlaylistInput = false;
  const playlists = [] as Song[][];

  return (
    <div className={classNames(styles['app-nav'], className)} style={{ width }}>
      <section className={styles.common}>
        <ul>
          <li id="all-music">
            <a className={styles.active}>
              <span className="name">All music</span>
              <span className={styles.count}>
                {songs?.length.toLocaleString() ?? <>&ndash;</>}
              </span>
            </a>
          </li>
          {/* <li className="artists">
                <a>
                    <span className="name">Artists</span>
                </a>
            </li>
            <li className="albums">
                <a>
                    <span className="name">Albums</span>
                </a>
            </li> */}
        </ul>
      </section>
      <section className={styles.playlists}>
        {isLoadingPlaylists ? <p className="loading">Loading...</p> : null}
        {!playlists?.length ? (
          <p className="none">No playlists, yet.</p>
        ) : (
          <ul>
            {playlists?.map((p) => (
              <li className={styles.playlist}>{p.length}</li>
            ))}
          </ul>
        )}
        {showPlaylistInput ? (
          <div className={styles['playlist-input']}>
            <input
              type="text"
              className={styles['new-list']}
              name="list-name"
            />
            <p className={styles.error}>Sorry, that name is no good</p>
          </div>
        ) : null}
      </section>
      {/* <a className="btn btn-new-list">+ New Playlist</a> */}

      <Resizer width={width} onChange={(v) => resize(v)} onReset={resetWidth} />
    </div>
  );
};

function Resizer({
  width,
  onChange,
  onReset,
}: {
  width: number;
  onChange: (value: number) => void;
  onReset: () => void;
}) {
  const startWidthRef = useRef(0);
  const startXRef = useRef(0);

  return (
    <div
      className={styles.resizer}
      onDoubleClick={() => onReset()}
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        target.setPointerCapture(event.pointerId);
        event.preventDefault();

        // save start
        startWidthRef.current = width;
        startXRef.current = event.clientX;
      }}
      onPointerMove={(event) => {
        const target = event.target as HTMLElement;
        if (target.hasPointerCapture(event.pointerId)) {
          // calculate new width based on start position
          const change = event.clientX - startXRef.current;
          onChange(startWidthRef.current + change);
        }
      }}
      onPointerUp={(event) => {
        const target = event.target as HTMLElement;
        if (target.hasPointerCapture(event.pointerId)) {
          target.releasePointerCapture(event.pointerId);
        }
      }}></div>
  );
}
