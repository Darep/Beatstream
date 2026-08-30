const PLAYBACK_CLOCK_TOLERANCE = 1;

type PlaybackUpdate = {
  duration: number;
  instance: number;
  now: number;
  position: number;
  state: 'playing' | 'paused' | 'stopped';
};

export const createLastFMPlaybackTracker = () => {
  let currentInstance: number | undefined;
  let lastPosition = 0;
  let lastUpdate = 0;
  let playedSeconds = 0;
  let previousState: PlaybackUpdate['state'] = 'stopped';
  let scrobbled = false;

  return ({ duration, instance, now, position, state }: PlaybackUpdate) => {
    if (currentInstance === instance && previousState === 'playing') {
      const progress = position - lastPosition;
      const elapsed = (now - lastUpdate) / 1000;
      if (progress > 0 && progress <= elapsed + PLAYBACK_CLOCK_TOLERANCE) playedSeconds += progress;
    }
    lastUpdate = now;
    lastPosition = position;
    previousState = state;

    const started = state === 'playing' && currentInstance !== instance;
    if (started) {
      currentInstance = instance;
      playedSeconds = 0;
      scrobbled = false;
    }

    const shouldScrobble =
      currentInstance === instance && !scrobbled && duration > 30 && playedSeconds >= Math.min(240, duration / 2);
    if (shouldScrobble) scrobbled = true;

    return { shouldScrobble, started };
  };
};
