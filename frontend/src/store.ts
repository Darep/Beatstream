import { type StateCreator, type StoreMutatorIdentifier, create } from 'zustand';
import { persist } from 'zustand/middleware';

import { AppAudio } from 'utils/AppAudio';
import { songFilter } from 'utils/filter';
import { trackCompare } from 'utils/sort';

const DEFAULT_VOLUME = 25;
const DEFAULT_APP_NAV_WIDTH = 189;

interface PlayerState {
  /** Left sidebar width */
  appNavWidth: number;

  /** All songs */
  songs: Song[];

  /** Current sorted & filtered playlist of songs */
  playlist: Song[];

  /** Current song duration as parsed by the audio player */
  parsedDuration: number;

  /** Current song position in seconds */
  position: number;

  /** Repeat & shuffle states */
  repeat: boolean;
  shuffle: boolean;

  /** Current filter/search string */
  search: string;

  /** Currently playing song (if any) */
  song: Song | null;

  /** Current playlist sorting */
  sort: null | 'title' | 'album' | 'artist' | 'track_num' | 'length';
  sortDir: 'asc' | 'desc';

  /** Current state of the player */
  state: 'playing' | 'paused' | 'stopped';

  /** Current volume from 0 to 100 */
  volume: number;

  /** History of played songs */
  playHistory: Song[];
  playHistoryIndex: number;

  /** -- ACTIONS (EVENTS) -- */

  changePlaylist: (songs: Song[]) => void;
  changeVolume: (volume: number) => void;
  filterPlaylist: (search: string) => void;
  jumpToPosition: (position: number) => void;
  resetAppNavWidth: () => void;
  resizeAppNav: (width: number) => void;
  songsLoaded: (songs: Song[]) => void;
  sortPlaylist: (field: 'title' | 'album' | 'artist' | 'track_num' | 'length' | 'nice_length' | null) => void;
  playSongAtIndex: (index: number) => void;

  pause: () => void;
  play: () => void;

  toggleRepeat: () => void;
  toggleShuffle: () => void;

  nextSong: (force?: boolean) => void;
  prevSong: (force?: boolean) => void;
}

const PLAY_HISTORY_LIMIT = 200;

type WithLimitedHistory = <
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<PlayerState, Mps, Mcs>,
) => StateCreator<PlayerState, Mps, Mcs>;

const withLimitedHistory: WithLimitedHistory = (config: any) => (set: any, get: any, api: any) =>
  config(
    (...args: any) => {
      set(...args);
      const state = get();
      if (state.playHistory?.length > PLAY_HISTORY_LIMIT) {
        set({
          playHistory: state.playHistory.slice(-PLAY_HISTORY_LIMIT),
          playHistoryIndex: Math.min(state.playHistoryIndex, PLAY_HISTORY_LIMIT - 1),
        });
      }
    },
    get,
    api,
  );

export const usePlayerStore = create<PlayerState>()(
  withLimitedHistory(
    persist(
      (set) => ({
        appNavWidth: DEFAULT_APP_NAV_WIDTH,
        parsedDuration: 0,
        playlist: [] as Song[],
        position: 0,
        repeat: false,
        search: '',
        shuffle: false,
        song: null,
        songs: [] as Song[],
        sort: 'artist',
        sortDir: 'asc',
        state: 'stopped',
        volume: DEFAULT_VOLUME,
        playHistory: [],
        playHistoryIndex: -1,

        nextSong: (force = false) => set(changeSong(1, { force })),
        prevSong: (force = false) => set(changeSong(-1, { force })),
        resetAppNavWidth: () => set({ appNavWidth: DEFAULT_APP_NAV_WIDTH }),
        resizeAppNav: (width: number) => set({ appNavWidth: width }),
        toggleRepeat: () => set((state) => ({ repeat: !state.repeat })),
        toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

        changePlaylist: (songs: Song[]) =>
          set((state) => {
            return {
              playlist: state.sort ? songs.sort(trackCompare(state.sort)) : songs,
            };
          }),

        changeVolume: (volume: number) => {
          AppAudio.setVolume(volume);
          return set({ volume });
        },

        filterPlaylist: (search: string) => {
          return set((state) => {
            return {
              playlist: state.songs.filter((s) => songFilter(s, search)),
              search,
            };
          });
        },

        jumpToPosition: (position: number) => {
          AppAudio.seekTo(position);
          return set({ position });
        },

        pause: () => {
          AppAudio.pause();
          return set({ state: 'paused' });
        },

        playSongAtIndex: (index: number) =>
          set((state) => {
            const song = state.playlist[index];

            if (!song) {
              return {};
            }

            AppAudio.playSong(song.path);

            // Add song to history
            const newHistory = state.playHistory.slice(0, state.playHistoryIndex + 1);
            newHistory.push(song);

            return {
              song,
              state: 'playing',
              playHistory: newHistory,
              playHistoryIndex: newHistory.length - 1,
            };
          }),

        play: () =>
          set((state) => {
            if (!state.song && (!state.playlist || state.playlist.length === 0)) {
              // Playlist seems to be empty, do nothing
              return {};
            }

            const song = state.song ?? state.playlist[0];

            if (!song) {
              // No song to play, do nothing
              return {};
            }

            AppAudio.playSong(song.path);

            // if we were playing something before, play & seek to previous position
            if (state.song && state.position > 0) {
              AppAudio.seekTo(state.position);
            }

            return {
              song,
              state: 'playing',
            };
          }),

        sortPlaylist: (field) =>
          set((state) => {
            const sortField = field === 'nice_length' ? 'length' : field;

            const sortDir = sortField === state.sort && state.sortDir === 'asc' ? 'desc' : 'asc';

            const sortedPlaylist = sortField
              ? [...state.playlist].sort((a, b) =>
                  sortDir === 'desc' ? trackCompare(sortField)(b, a) : trackCompare(sortField)(a, b),
                )
              : state.playlist;

            return {
              playlist: sortedPlaylist,
              sort: sortField,
              sortDir,
            };
          }),

        songsLoaded: (songs: Song[]) =>
          set((state) => {
            if (state.playlist.length === 0) {
              const sortedPlaylist = state.sort
                ? songs.sort((a, b) =>
                    state.sortDir === 'desc' ? trackCompare(state.sort!)(b, a) : trackCompare(state.sort!)(a, b),
                  )
                : songs;

              return { playlist: sortedPlaylist, songs };
            } else {
              return { songs };
            }
          }),
      }),
      {
        name: 'player-storage',
        partialize: (state) =>
          // persist this data:
          ({
            appNavWidth: state.appNavWidth,
            parsedDuration: state.parsedDuration,
            position: state.position,
            repeat: state.repeat,
            shuffle: state.shuffle,
            song: state.song,
            volume: state.volume,
          }),
      },
    ),
  ),
);

/**
 * Logic to choose the next or prev song.
 */
function changeSong(direction: -1 | 1, { force } = { force: false }): (state: PlayerState) => Partial<PlayerState> {
  return (state: PlayerState) => {
    let nextSong: Song | undefined;
    const shouldWrap = state.repeat || force;
    let newHistory: Partial<Pick<PlayerState, 'playHistory' | 'playHistoryIndex'>> = {};

    if (state.shuffle && state.playlist.length > 2) {
      // Shuffle enabled, and we have more than 2 songs
      if (direction === -1) {
        // Get previous song from history
        const prevIndex = state.playHistoryIndex + direction;
        if (prevIndex >= 0) {
          nextSong = state.playHistory[prevIndex];
          newHistory = { playHistoryIndex: prevIndex };
        } else {
          // If no previous history, do nothing
          return {};
        }
      } else {
        if (state.playHistory.length - 1 > state.playHistoryIndex) {
          // If going forward and we have future history, use that
          const nextIndex = state.playHistoryIndex + direction;
          nextSong = state.playHistory[nextIndex];
          newHistory = { playHistoryIndex: nextIndex };
        }
        if (!nextSong) {
          // Choose a next song at random
          let randomIndex = Math.floor(Math.random() * state.playlist.length);
          nextSong = state.playlist[randomIndex];

          // If the next random song was the current song, try at random again
          if (state.song === nextSong) {
            randomIndex = Math.floor(Math.random() * state.playlist.length);
            nextSong = state.playlist[randomIndex];
          }

          if (nextSong) {
            const playHistory = state.playHistory.slice(0, state.playHistoryIndex + 1);
            playHistory.push(nextSong);
            newHistory = { playHistory, playHistoryIndex: playHistory.length - 1 };
          }
        }
      }
    } else if (!state.song) {
      // No song playing
      if (!state.playlist || state.playlist.length === 0) {
        // Playlist seems to be empty, do nothing
        return {};
      }

      // we aren't playing anything, so play first or last song depending on the direction
      nextSong = state.playlist[direction === -1 ? state.playlist.length - 1 : 0];
    } else {
      // Normal playback, no shuffle or such
      const currentIndex = state.playlist.indexOf(state.song);
      const nextIndex = currentIndex + direction;

      nextSong = state.playlist[nextIndex];

      if (!nextSong && shouldWrap) {
        nextSong = state.playlist[direction === -1 ? state.playlist.length - 1 : 0];
      }
    }

    if (nextSong?.path) {
      AppAudio.playSong(nextSong.path);

      return {
        song: nextSong,
        ...newHistory,
      };
    }

    return { song: nextSong };
  };
}
