import { AppBottom } from 'components/AppBottom';
import { AppLoader } from 'components/AppLoader';
import { AppMain } from 'components/AppMain';
import { AppNav } from 'components/AppNav/AppNav';
import { AppTop } from 'components/AppTop';
import { LoginModal } from 'components/LoginModal';
import { MediaSession } from 'components/MediaSession';
import { useSession } from 'hooks/swr';

import styles from './App.module.css';

export const App = () => {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  return (
    <div className={styles.app}>
      {!isAuthenticated ? (
        <LoginModal />
      ) : (
        <>
          <AppTop className={styles['app-top']} />

          <main className={styles.main}>
            <AppNav className={styles.appNav} />
            <AppMain className={styles.appMain} />
          </main>

          <AppBottom className={styles['app-bottom']} />
        </>
      )}

      <AppLoader />

      <MediaSession />
    </div>
  );
};
