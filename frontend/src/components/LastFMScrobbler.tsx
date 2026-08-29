import { useLastFM } from 'hooks/swr';
import { useEffect } from 'react';
import { usePlayerStore } from 'store';
import { request } from 'utils/api';

export const LastFMScrobbler = () => {
  const { data: lastFM } = useLastFM();

  useEffect(() => {
    if (!lastFM?.connected) return;

    const ignoredInstance = usePlayerStore.getState().playbackInstance;
    let currentInstance = ignoredInstance;
    let startedAt = 0;
    let playedSeconds = 0;
    let lastUpdate = Date.now();
    let previousState: ReturnType<typeof usePlayerStore.getState>['state'] = 'stopped';
    let scrobbled = false;

    const sync = (player: ReturnType<typeof usePlayerStore.getState>) => {
      const { song, state, parsedDuration, playbackInstance } = player;
      if (!song?.artist || !song.title) return;

      const now = Date.now();
      if (playbackInstance === ignoredInstance) {
        lastUpdate = now;
        previousState = state;
        return;
      }
      if (currentInstance === playbackInstance && previousState === 'playing') {
        playedSeconds += (now - lastUpdate) / 1000;
      }
      lastUpdate = now;
      previousState = state;

      const duration = parsedDuration || song.length || 0;
      if (state === 'playing' && currentInstance !== playbackInstance) {
        currentInstance = playbackInstance;
        startedAt = Math.floor(Date.now() / 1000);
        playedSeconds = 0;
        scrobbled = false;
        void request('/api/lastfm/now-playing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artist: song.artist, track: song.title, album: song.album, duration }),
        }).catch(() => undefined);
      }

      if (
        currentInstance !== playbackInstance ||
        scrobbled ||
        duration < 30 ||
        playedSeconds < Math.min(240, duration / 2)
      )
        return;
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
