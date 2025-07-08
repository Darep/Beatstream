import { useState } from 'react';
import { usePlayerStore } from 'store';

import { Slider } from 'components/common/Slider';

import styles from './Seekbar.module.css';

export const Seekbar = () => {
  const currentPosition = usePlayerStore((s) => s.position);
  const song = usePlayerStore((s) => s.song);
  const jumpToPosition = usePlayerStore((s) => s.jumpToPosition);
  const parsedDuration = usePlayerStore((s) => s.parsedDuration);

  const [positionProxy, setPositionProxy] = useState<number | undefined>();

  return (
    <>
      <div className={styles.time}>
        <span className="elapsed">
          {niceTime(positionProxy ?? currentPosition)}
        </span>{' '}
        /{' '}
        <span className="duration">
          {niceTime(parsedDuration ?? song?.length)}
        </span>
      </div>
      <div className={styles.seekbar}>
        <Slider
          disabled={!song}
          max={song?.length}
          onStart={() => setPositionProxy(currentPosition)}
          onSlide={(v) => setPositionProxy(v)}
          onStop={(v) => {
            jumpToPosition(v);
            setPositionProxy(undefined);
          }}
          value={positionProxy ?? currentPosition}
        />
      </div>
    </>
  );
};

/** Returns a nicely formatted string like h:mm:ss or m:ss for given seconds */
function niceTime(seconds?: number) {
  if (typeof seconds !== 'number') {
    return '–';
  }

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const nice = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  if (hours) {
    return `${hours}:${nice}`;
  } else {
    return nice;
  }
}
