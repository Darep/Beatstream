const PLAYBACK_CLOCK_TOLERANCE = 1;

type PlaybackUpdate = {
  duration: number;
  now: number;
  playbackCount: number;
  position: number;
  state: 'playing' | 'paused' | 'stopped';
};

export const createLastFMPlaybackTracker = () => {
  let currentPlaybackCount: number | undefined;
  let lastPosition = 0;
  let lastUpdate = 0;
  let playedSeconds = 0;
  let previousState: PlaybackUpdate['state'] = 'stopped';
  let scrobbled = false;

  return ({ duration, now, playbackCount, position, state }: PlaybackUpdate) => {
    if (currentPlaybackCount === playbackCount && previousState === 'playing') {
      const progress = position - lastPosition;
      const elapsed = (now - lastUpdate) / 1000;

      if (progress > 0 && progress <= elapsed + PLAYBACK_CLOCK_TOLERANCE) playedSeconds += progress;
    }

    lastUpdate = now;
    lastPosition = position;
    previousState = state;

    const started = state === 'playing' && currentPlaybackCount !== playbackCount;

    if (started) {
      currentPlaybackCount = playbackCount;
      playedSeconds = 0;
      scrobbled = false;
    }

    const shouldScrobble =
      currentPlaybackCount === playbackCount &&
      !scrobbled &&
      duration > 30 &&
      playedSeconds >= Math.min(240, duration / 2);

    if (shouldScrobble) scrobbled = true;

    return { shouldScrobble, started };
  };
};
