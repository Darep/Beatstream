import { usePlayerStore } from 'store';

export const RepeatButton = () => {
  const repeat = usePlayerStore((s) => s.repeat);
  const toggleRepeat = usePlayerStore((s) => s.toggleRepeat);

  return (
    <button
      className={repeat ? 'enabled' : undefined}
      id="repeat"
      type="button"
      onClick={() => toggleRepeat()}>
      Repeat <span className="status">{repeat ? 'On' : 'Off'}</span>
    </button>
  );
};
