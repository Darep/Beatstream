import { useSession, useSongs } from 'hooks/swr';

import loading from 'assets/preloader.gif';

import styles from './AppLoader.module.css';

export const AppLoader = () => {
  const { isLoading: isLoadingSession, error: sessionError } = useSession();

  const { isLoading: isLoadingSongs, error: songsError } = useSongs({
    skip: isLoadingSession || sessionError,
  });

  if (!isLoadingSession && sessionError) {
    // don't render anything if session failed
    return null;
  }

  if (!isLoadingSession && !isLoadingSongs && !songsError) {
    return null;
  }

  return (
    <div className={styles.pageloader}>
      <div className={styles['pageloader__center']}>
        <p className={styles['loading']} style={{ background: loading }}>
          Loading&hellip;
        </p>
        <div className="notifications">
          {songsError ? (
            <div className="playlist-error">
              <i className="icon icon-notify"></i>
              <h3>Cannot load playlist</h3>
              <p>
                Could not load the current playlist. Please, try{' '}
                <em>something</em>.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
