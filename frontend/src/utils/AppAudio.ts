/**
 * Simple singleton-ish abstraction around <audio>
 */
class AppAudio {
  audio: HTMLAudioElement;

  constructor() {
    this.audio = document.createElement('audio');
    this.audio.id = 'audio';
    this.audio.controls = true;

    document.body.appendChild(this.audio);
  }

  pause() {
    if (!this.audio.paused) {
      this.audio.pause();
    }
  }

  play() {
    if (this.audio.paused) {
      this.audio.play();
    }
  }

  playSong(uri: string) {
    const songUri = uri.startsWith('/api/songs/play')
      ? uri
      : `/api/songs/play?file=${encodeURIComponent(uri)}`;

    this.audio.src = songUri;
    this.audio.play();
  }

  seekTo(seconds: number) {
    this.audio.currentTime = seconds;
  }

  setVolume(volume: number) {
    this.audio.volume = volume / 100;
  }

  stop() {
    if (!this.audio.paused) {
      this.audio.pause();
      this.audio.src = '';
    }
  }
}

const instance = new AppAudio();

export { instance as AppAudio };
