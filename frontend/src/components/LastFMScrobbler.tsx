import { useLastFM } from 'hooks/swr';
import { useEffect, useRef } from 'react';
import { usePlayerStore } from 'store';
import { request } from 'utils/api';

export const LastFMScrobbler = () => {
  const { data: lastFM } = useLastFM();
  const song = usePlayerStore((state) => state.song);
  const state = usePlayerStore((state) => state.state);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.parsedDuration || state.song?.length || 0);
  const startedAt = useRef(0);
  const announced = useRef('');
  const scrobbled = useRef('');

  const id = song?.path ?? '';

  useEffect(() => {
    if (!lastFM?.connected || !song || state !== 'playing' || announced.current === id) return;
    announced.current = id;
    scrobbled.current = '';
    startedAt.current = Math.floor(Date.now() / 1000);
    void request('/api/lastfm/now-playing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artist: song.artist, track: song.title, album: song.album, duration }),
    }).catch(() => undefined);
  }, [duration, id, lastFM?.connected, song, state]);

  useEffect(() => {
    if (!lastFM?.connected || !song || !song.artist || !song.title || duration < 30 || scrobbled.current === id) return;
    const threshold = Math.min(240, duration / 2);
    if (!threshold || position < threshold) return;
    scrobbled.current = id;
    void request('/api/lastfm/scrobble', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artist: song.artist,
        track: song.title,
        album: song.album,
        duration,
        timestamp: startedAt.current,
      }),
    }).catch(() => undefined);
  }, [duration, id, lastFM?.connected, position, song]);

  return null;
};
