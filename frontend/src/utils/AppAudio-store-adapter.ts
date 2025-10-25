/**
 * Adapter to hook the store to AppAudio events, and update state based on events.
 */
import { usePlayerStore } from 'store';

import { AppAudio } from './AppAudio';

const onTimeupdate = () => {
  usePlayerStore.setState({ position: AppAudio.audio.currentTime });
};

const onDurationchange = () => {
  usePlayerStore.setState({ parsedDuration: AppAudio.audio.duration });
};

const onPlay = () => {
  usePlayerStore.setState({ state: 'playing' });
};

const onPause = () => {
  usePlayerStore.setState({ state: 'paused' });
};

const onSongEnd = () => {
  usePlayerStore.getState().nextSong();
};

export const init = () => {
  AppAudio.audio.addEventListener('timeupdate', onTimeupdate);
  AppAudio.audio.addEventListener('durationchange', onDurationchange);
  AppAudio.audio.addEventListener('pause', onPause);
  AppAudio.audio.addEventListener('play', onPlay);
  AppAudio.audio.addEventListener('ended', onSongEnd);

  // sync volume on init
  AppAudio.setVolume(usePlayerStore.getState().volume);
};

export const destroy = () => {
  AppAudio.audio.removeEventListener('durationchange', onDurationchange);
  AppAudio.audio.removeEventListener('ended', onSongEnd);
  AppAudio.audio.removeEventListener('pause', onPause);
  AppAudio.audio.removeEventListener('play', onPlay);
  AppAudio.audio.removeEventListener('timeupdate', onTimeupdate);
};
