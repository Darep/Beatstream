import { useLastFM } from 'hooks/swr';
import { useEffect } from 'react';
import { mutate } from 'swr';
import { usePlayerStore } from 'store';
import { ApiError, request } from 'utils/api';

const PLAYBACK_CLOCK_TOLERANCE = 1;

export const LastFMScrobbler = () => {
  const { data: lastFM } = useLastFM();

  useEffect(() => {
    if (!lastFM?.connected) return;

    const ignoredInstance = usePlayerStore.getState().playbackInstance;
    let currentInstance = ignoredInstance;
    let startedAt = 0;
    let playedSeconds = 0;
    let lastUpdate = Date.now();
    let lastPosition = 0;
    let previousState: ReturnType<typeof usePlayerStore.getState>['state'] = 'stopped';
    let scrobbled = false;

    const sync = (player: ReturnType<typeof usePlayerStore.getState>) => {
      const { song, state, position, parsedDuration, playbackInstance } = player;
      if (!song?.artist || !song.title) return;

      const now = Date.now();
      if (playbackInstance === ignoredInstance) {
        lastUpdate = now;
        lastPosition = position;
        previousState = state;
        return;
      }
      if (currentInstance === playbackInstance && previousState === 'playing') {
        const progress = position - lastPosition;
        const elapsed = (now - lastUpdate) / 1000;
        if (progress > 0 && progress <= elapsed + PLAYBACK_CLOCK_TOLERANCE) playedSeconds += progress;
      }
      lastUpdate = now;
      lastPosition = position;
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
        }).catch((error: unknown) => {
          console.error(`Could not update Last.fm now playing for ${song.artist} — ${song.title}`, error);
          if (error instanceof ApiError && error.status === 409) void mutate('/api/lastfm');
        });
      }

      if (
        currentInstance !== playbackInstance ||
        scrobbled ||
        duration <= 30 ||
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
      }).catch((error: unknown) => {
        console.error(`Could not scrobble ${song.artist} — ${song.title}`, error);
        if (error instanceof ApiError && error.status === 409) void mutate('/api/lastfm');
      });
    };

    sync(usePlayerStore.getState());
    return usePlayerStore.subscribe(sync);
  }, [lastFM?.connected]);

  return null;
};
