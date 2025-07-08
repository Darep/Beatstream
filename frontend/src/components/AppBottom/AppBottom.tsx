import { EventManager } from 'EventManager';
import classNames from 'classnames';

import { usePlayerStore } from 'store';

import styles from './AppBottom.module.css';
import { NextButton } from './NextButton';
import { PlayPauseButton } from './PlayPauseButton';
import { PrevButton } from './PrevButton';
import { RepeatButton } from './RepeatButton';
import { Seekbar } from './Seekbar';
import { ShuffleButton } from './ShuffleButton';
import { Volume } from './Volume';

export const AppBottom = ({ className }: { className?: string }) => {
  const song = usePlayerStore((s) => s.song);

  const scrollToCurrentSong = () => {
    EventManager.trigger('show-nowplaying');
  };

  return (
    <div className={classNames(styles['app-bottom'], className)}>
      <div className={styles['current-song']}>
        <span className="label">Current song:</span>{' '}
        <span
          className={styles['current-song__song-name']}
          onClick={scrollToCurrentSong}>
          {song?.nice_title ?? 'No song playing'}
        </span>
      </div>
      <div className={styles.controls}>
        <div className={styles['playback-buttons']}>
          <PrevButton />
          <PlayPauseButton />
          <NextButton />
        </div>
        <Volume />
        <Seekbar />
        <div className={styles['playback-options']}>
          <RepeatButton />
          <ShuffleButton />
        </div>
      </div>
    </div>
  );
};
