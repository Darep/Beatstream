import classNames from 'classnames';
import { usePlayerStore } from 'store';

import { Slider } from 'components/common/Slider';

import styles from './Volume.module.css';

export const Volume = ({ className }: { className?: string }) => {
  const volume = usePlayerStore((s) => s.volume);
  const changeVolume = usePlayerStore((s) => s.changeVolume);

  return (
    <div className={classNames(styles.volume, className)}>
      <label className={styles['volume-label']} title={volume.toString()}>
        Volume
      </label>
      <div id={styles.volume}>
        <Slider onSlide={(v) => changeVolume(v)} onStop={(v) => changeVolume(v)} value={volume} />
      </div>
    </div>
  );
};
