import { useLastFM, useSession } from 'hooks/swr';
import { useState } from 'react';
import { mutate } from 'swr';
import { request } from 'utils/api';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import { PasswordChangeForm } from './PasswordChangeForm';
import styles from './SettingsModal.module.css';

type SettingsPanel = 'account' | 'connections';

export const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useSession();
  const [changingPassword, setChangingPassword] = useState(false);
  const [panel, setPanel] = useState<SettingsPanel>('account');
  const { data: lastFM } = useLastFM();
  const [busy, setBusy] = useState(false);
  const [lastFMError, setLastFMError] = useState('');

  const connect = async () => {
    const popup = window.open('', 'lastfm-auth', 'popup,width=900,height=700');
    if (!popup) {
      setLastFMError('Allow popups to connect to Last.fm');
      return;
    }

    setBusy(true);
    setLastFMError('');

    try {
      const { url } = await request<{ url: string }>('/api/lastfm/connect', { method: 'POST' });
      popup.location.href = url;
      await mutate('/api/lastfm');
    } catch (err) {
      popup.close();
      setLastFMError(err instanceof Error ? err.message : 'Could not connect to Last.fm');
    } finally {
      setBusy(false);
    }
  };

  const complete = async () => {
    setBusy(true);
    setLastFMError('');

    try {
      await request('/api/lastfm/complete', { method: 'POST' });
      await mutate('/api/lastfm');
    } catch (err) {
      setLastFMError(err instanceof Error ? err.message : 'Could not finish the Last.fm connection');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setLastFMError('');

    try {
      await request('/api/lastfm', { method: 'DELETE' });
      await mutate('/api/lastfm');
    } catch (err) {
      setLastFMError(err instanceof Error ? err.message : 'Could not disconnect from Last.fm');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal className={styles.dialog} onClose={onClose}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>Settings</p>
          <nav className={styles.nav} aria-label="Settings sections">
            <Button
              variant="plain"
              className={panel === 'account' ? styles.navItemActive : styles.navItem}
              aria-pressed={panel === 'account'}
              onClick={() => {
                setChangingPassword(false);
                setPanel('account');
              }}
            >
              Account
            </Button>
            <Button
              variant="plain"
              className={panel === 'connections' ? styles.navItemActive : styles.navItem}
              aria-pressed={panel === 'connections'}
              onClick={() => {
                setChangingPassword(false);
                setPanel('connections');
              }}
            >
              Connections
            </Button>
          </nav>
        </aside>

        <main className={styles.content}>
          {changingPassword ? (
            <div className={styles.panel}>
              <Button variant="plain" className={styles.backButton} onClick={() => setChangingPassword(false)}>
                <span aria-hidden="true">←</span> Account
              </Button>
              <header className={styles.header}>
                <h2>Change password</h2>
                <p className={styles.headerDescription}>Enter your current password, then choose a new one.</p>
              </header>
              <PasswordChangeForm onClose={() => setChangingPassword(false)} />
            </div>
          ) : panel === 'account' ? (
            <div className={styles.panel} key="account-panel">
              <header className={styles.header}>
                <h2>Account</h2>
              </header>

              <section className={styles.card}>
                <div className={styles.row}>
                  <div>
                    <strong>Username</strong>
                    <span>Your account identifier</span>
                  </div>
                  <code>{user?.username ?? '—'}</code>
                </div>
                <div className={styles.row}>
                  <div>
                    <strong>Password</strong>
                    <span>Update the password used to sign in</span>
                  </div>
                  <Button
                    id="change-password-link"
                    variant="secondary"
                    className={styles.action}
                    onClick={() => setChangingPassword(true)}
                  >
                    Change password
                  </Button>
                </div>
              </section>
            </div>
          ) : (
            <div className={styles.panel}>
              <header className={styles.header}>
                <h2>Connections</h2>
              </header>

              <p className={styles.sectionLabel}>Listening services</p>
              <section className={styles.integrationCard}>
                <div className={styles.integrationHeader}>
                  <span className={styles.lastFMLogo} aria-hidden="true">
                    last.fm
                  </span>
                  <div>
                    <strong>Last.fm</strong>
                    <span>Scrobble the music you play</span>
                  </div>
                  <span className={lastFM?.connected ? styles.statusConnected : styles.status}>
                    {!lastFM
                      ? 'Checking'
                      : !lastFM.configured
                        ? 'Unavailable'
                        : lastFM.connected
                          ? 'Connected'
                          : lastFM.pending
                            ? 'Pending'
                            : 'Not connected'}
                  </span>
                </div>

                <div className={styles.integrationBody}>
                  {!lastFM ? (
                    <p>Checking connection status&hellip;</p>
                  ) : !lastFM.configured ? (
                    <p>Last.fm is unavailable because this server has not configured API credentials.</p>
                  ) : !lastFM.connected && !lastFM.pending ? (
                    <>
                      <p>Connect your account to send new plays to your Last.fm profile.</p>
                      <Button
                        variant="secondary"
                        className={styles.primaryAction}
                        id="lastfm-connect"
                        disabled={busy}
                        onClick={connect}
                      >
                        {busy ? 'Connecting…' : 'Connect Last.fm'}
                      </Button>
                    </>
                  ) : lastFM.pending ? (
                    <>
                      <p>Finish authorization after approving Beatstream in the Last.fm window.</p>
                      <div className={styles.actions}>
                        <Button variant="secondary" className={styles.primaryAction} disabled={busy} onClick={complete}>
                          Finish connection
                        </Button>
                        <Button variant="secondary" className={styles.action} disabled={busy} onClick={connect}>
                          Restart
                        </Button>
                      </div>
                    </>
                  ) : lastFM.connected ? (
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}
                    >
                      <p>
                        Scrobbling as <strong>{lastFM.username}</strong>.
                      </p>
                      <Button disabled={busy} id="lastfm-disconnect" onClick={disconnect} variant="danger">
                        {busy ? 'Disconnecting…' : 'Disconnect'}
                      </Button>
                    </div>
                  ) : null}
                  {lastFMError ? (
                    <p className={styles.error} role="alert">
                      {lastFMError}
                    </p>
                  ) : null}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </Modal>
  );
};
