import { useLastFM, useSession } from 'hooks/swr';
import { useState } from 'react';
import { mutate } from 'swr';
import { request } from 'utils/api';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import { PasswordChangeModal } from './PasswordChangeModal';

export const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useSession();
  const [changingPassword, setChangingPassword] = useState(false);
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

  if (changingPassword) {
    return <PasswordChangeModal onClose={onClose} />;
  }

  return (
    <Modal onClose={onClose}>
      <h2>Settings</h2>
      <section>
        <label htmlFor="username">Username</label>
        <div className="form-field">
          <input className="settings-username" type="text" disabled id="username" value={user?.username ?? ''} />
        </div>
        <label htmlFor="change-password-link">Password</label>
        <div className="form-field">
          <p>
            <Button id="change-password-link" variant="plain" onClick={() => setChangingPassword(true)}>
              Change password&hellip;
            </Button>
          </p>
        </div>
      </section>
      <section>
        <label htmlFor="lastfm-connect">Last.fm</label>
        <div className="form-field">
          {!lastFM?.configured ? (
            <p>Set LASTFM_API_KEY and LASTFM_API_SECRET to enable Last.fm.</p>
          ) : lastFM?.configured && !lastFM.connected && !lastFM.pending ? (
            <Button
              variant="secondary"
              className="btn btn-lastfm not-ok"
              id="lastfm-connect"
              disabled={busy}
              onClick={connect}
            >
              Connect to Last.fm
            </Button>
          ) : lastFM?.pending ? (
            <p>
              Authorize Beatstream in the opened window, then{' '}
              <Button variant="secondary" className="btn" disabled={busy} onClick={complete}>
                Finish connection
              </Button>{' '}
              or{' '}
              <Button variant="secondary" className="btn" disabled={busy} onClick={connect}>
                Restart authorization
              </Button>
            </p>
          ) : lastFM?.connected ? (
            <p className="ok">
              Connected as {lastFM.username}{' '}
              <Button variant="secondary" className="btn" id="lastfm-disconnect" disabled={busy} onClick={disconnect}>
                Remove connection
              </Button>
            </p>
          ) : null}
          {lastFMError ? <p>{lastFMError}</p> : null}
        </div>
      </section>
      <div className="right">
        <input type="submit" className="btn-orange" value="Save" />
        <span className="loading ir" style={{ display: 'none' }}>
          Saving&hellip;
        </span>
      </div>
    </Modal>
  );
};
