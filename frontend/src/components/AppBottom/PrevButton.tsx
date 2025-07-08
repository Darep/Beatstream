import { usePlayerStore } from 'store';

export const PrevButton = () => {
  const prevSong = usePlayerStore((s) => s.prevSong);
  const isPlaylistEmpty = usePlayerStore((s) => s.playlist.length === 0);

  return (
    <button id="prev" type="button" disabled={isPlaylistEmpty} onClick={() => prevSong(true)}>
      Prev
    </button>
  );
};
