import { useLastFM } from 'hooks/swr';
import { useEffect, useRef } from 'react';
import { usePlayerStore } from 'store';
import { mutate } from 'swr';
import { ApiError, request } from 'utils/api';
import { createLastFMPlaybackTracker } from 'utils/LastFMPlayback';

export const LastFMScrobbler = () => {
  const { data: lastFM } = useLastFM();
  const scrobbledInstances = useRef(new Map<string, number>());

  useEffect(() => {
    if (!lastFM?.connected) return;

    const trackPlayback = createLastFMPlaybackTracker();
    let startedAt = 0;

    const sync = (player: ReturnType<typeof usePlayerStore.getState>) => {
      const { song, state, position, parsedDuration, playbackInstance } = player;
      if (!song?.artist || !song.title) return;

      const duration = parsedDuration || song.length || 0;
      const playback = trackPlayback({
        duration,
        instance: playbackInstance,
        now: performance.now(),
        position,
        state,
      });
      if (playback.started) {
        startedAt = Math.floor(Date.now() / 1000);
        void request('/api/lastfm/now-playing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artist: song.artist, track: song.title, album: song.album, duration }),
        }).catch((error: unknown) => {
          console.error(`Could not update Last.fm now playing for ${song.artist} — ${song.title}`, error);
          if (error instanceof ApiError && error.status === 409) void mutate('/api/lastfm');
        });
      }

      if (!playback.shouldScrobble || scrobbledInstances.current.get(lastFM.username) === playbackInstance) return;
      scrobbledInstances.current.set(lastFM.username, playbackInstance);
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
  }, [lastFM?.connected, lastFM?.username]);

  return null;
};
