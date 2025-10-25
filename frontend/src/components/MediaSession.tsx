import { useEffect } from 'react';
import { usePlayerStore } from 'store';

export const MediaSession = () => {
  const song = usePlayerStore((state) => state.song);
  const state = usePlayerStore((state) => state.state);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.parsedDuration);
  const play = usePlayerStore((state) => state.play);
  const pause = usePlayerStore((state) => state.pause);
  const nextSong = usePlayerStore((state) => state.nextSong);
  const prevSong = usePlayerStore((state) => state.prevSong);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      if (!song) {
        // Reset media session state
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
        navigator.mediaSession.setPositionState(undefined);

        // Remove action handlers
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        return;
      }

      // Set up action handlers
      navigator.mediaSession.setActionHandler('play', () => play());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => prevSong());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());

      // Update metadata
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album,
        // artwork: [{ src: song.artwork, sizes: '512x512', type: 'image/png' }],
      });

      // Update playback state
      navigator.mediaSession.playbackState = state === 'stopped' ? 'none' : state;

      // Update position state
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: 1.0,
        position: position,
      });
    }
  }, [song, state, position, duration, play, pause, nextSong, prevSong]);

  return null;
};
