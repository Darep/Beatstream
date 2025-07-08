import { useEffect, useRef } from 'react';
import { usePlayerStore } from 'store';

export const PlayPauseButton = () => {
  const isPlaying = usePlayerStore((s) => s.state === 'playing');
  const isPlaylistEmpty = usePlayerStore((s) => s.playlist.length === 0);
  const play = usePlayerStore((s) => s.play);
  const pause = usePlayerStore((s) => s.pause);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && buttonRef.current) {
        buttonRef.current.focus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      id="play-pause"
      className={isPlaying ? 'playing' : undefined}
      type="button"
      disabled={isPlaylistEmpty}
      onClick={() => (isPlaying ? pause() : play())}
    >
      Play/pause
    </button>
  );
};
