import { usePlayerStore } from "store";

export const NextButton = () => {
  const nextSong = usePlayerStore((s) => s.nextSong);
  const isPlaylistEmpty = usePlayerStore((s) => s.playlist.length === 0);

  return (
    <button
      id="next"
      type="button"
      disabled={isPlaylistEmpty}
      onClick={() => nextSong(true)}>
      Next
    </button>
  );
};
