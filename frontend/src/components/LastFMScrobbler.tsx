import { useLastFM } from 'hooks/swr';
import { useEffect } from 'react';
import { usePlayerStore } from 'store';
import { request } from 'utils/api';

export const LastFMScrobbler = () => {
  const { data: lastFM } = useLastFM();

  useEffect(() => {
    if (!lastFM?.connected) return;

    let currentTrack = '';
    let startedAt = 0;
    let scrobbled = false;

    const sync = (player: ReturnType<typeof usePlayerStore.getState>) => {
      const { song, state, position, parsedDuration } = player;
      if (!song?.artist || !song.title) return;

      const duration = parsedDuration || song.length || 0;
      if (state === 'playing' && currentTrack !== song.path) {
        currentTrack = song.path;
        startedAt = Math.floor(Date.now() / 1000);
        scrobbled = false;
        void request('/api/lastfm/now-playing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artist: song.artist, track: song.title, album: song.album, duration }),
        }).catch(() => undefined);
      }

      if (currentTrack !== song.path || scrobbled || duration < 30 || position < Math.min(240, duration / 2)) return;
      scrobbled = true;
      void request('/api/lastfm/scrobble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist: song.artist,
          track: song.title,
          album: song.album,
          duration,
          timestamp: startedAt,
        }),
      }).catch(() => undefined);
    };

    sync(usePlayerStore.getState());
    return usePlayerStore.subscribe(sync);
  }, [lastFM?.connected]);

  return null;
};
