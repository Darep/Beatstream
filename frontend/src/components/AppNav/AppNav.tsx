import classNames from 'classnames';
import { useRef, useState } from 'react';

import { useSongs, usePlaylists } from 'hooks/swr';
import { request } from 'utils/api';

import { usePlayerStore } from 'store';

import styles from './AppNav.module.css';

export const AppNav = ({ className }: { className?: string }) => {
  const { data: songs } = useSongs();
  const { data: playlists, mutate: mutatePlaylists, isLoading: isLoadingPlaylists } = usePlaylists();
  const width = usePlayerStore((s) => s.appNavWidth);
  const resize = usePlayerStore((s) => s.resizeAppNav);
  const resetWidth = usePlayerStore((s) => s.resetAppNavWidth);
  const [showPlaylistInput, setShowPlaylistInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [error, setError] = useState('');

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setError('Playlist name is required');
      return;
    }

    try {
      await request('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPlaylistName.trim() }),
      });
      
      setNewPlaylistName('');
      setShowPlaylistInput(false);
      setError('');
      mutatePlaylists();
    } catch (err) {
      setError('Failed to create playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) {
      return;
    }

    try {
      await request(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      });
      mutatePlaylists();
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreatePlaylist();
    } else if (e.key === 'Escape') {
      setShowPlaylistInput(false);
      setNewPlaylistName('');
      setError('');
    }
  };

  return (
    <div className={classNames(styles['app-nav'], className)} style={{ width }}>
      <section className={styles.common}>
        <ul>
          <li id="all-music">
            <a className={styles.active}>
              <span className="name">All music</span>
              <span className={styles.count}>{songs?.length.toLocaleString() ?? <>&ndash;</>}</span>
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
            {playlists?.map((playlist: Playlist) => (
              <li key={playlist.id} className={styles.playlist}>
                <a>
                  <span className="name">{playlist.name}</span>
                  <span className={styles.count}>{playlist.songs.length}</span>
                </a>
                <button 
                  onClick={() => handleDeletePlaylist(playlist.id)}
                  className={styles['delete-btn']}
                  title="Delete playlist"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {showPlaylistInput ? (
          <div className={styles['playlist-input']}>
            <input 
              type="text" 
              className={styles['new-list']} 
              name="list-name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Playlist name..."
              autoFocus
            />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles['input-actions']}>
              <button onClick={handleCreatePlaylist}>Create</button>
              <button onClick={() => setShowPlaylistInput(false)}>Cancel</button>
            </div>
          </div>
        ) : null}
      </section>
      <button 
        className="btn btn-new-list" 
        onClick={() => setShowPlaylistInput(true)}
        disabled={showPlaylistInput}
      >
        + New Playlist
      </button>

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
      }}
    />
  );
}
