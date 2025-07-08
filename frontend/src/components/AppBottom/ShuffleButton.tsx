import { usePlayerStore } from 'store';

export const ShuffleButton = () => {
  const shuffle = usePlayerStore((s) => s.shuffle);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);

  return (
    <button
      className={shuffle ? 'enabled' : undefined}
      id="shuffle"
      type="button"
      onClick={() => toggleShuffle()}>
      Shuffle <span className="status">{shuffle ? 'On' : 'Off'}</span>
    </button>
  );
};
