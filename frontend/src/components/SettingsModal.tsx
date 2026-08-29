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
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const connect = async () => {
    const popup = window.open('', 'lastfm-auth', 'popup,width=900,height=700');
    if (!popup) {
      setError('Allow popups to connect to Last.fm');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { url } = await request<{ url: string }>('/api/lastfm/connect', { method: 'POST' });
      popup.location.href = url;
      setPending(true);
    } catch (err) {
      popup.close();
      setError(err instanceof Error ? err.message : 'Could not connect to Last.fm');
    } finally {
      setBusy(false);
    }
  };

  const complete = async () => {
    setBusy(true);
    setError('');
    try {
      await request('/api/lastfm/complete', { method: 'POST' });
      setPending(false);
      await mutate('/api/lastfm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not finish the Last.fm connection');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setError('');
    try {
      await request('/api/lastfm', { method: 'DELETE' });
      await mutate('/api/lastfm');
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
        <label>Username</label>
        <div className="form-field">
          <input
            className="settings-username"
            type="text"
            disabled
            id="username"
            value={user?.username ?? ''}
            tabIndex={1}
          />
        </div>
        <label>Password</label>
        <div className="form-field">
          <p>
            <Button id="change-password-link" tabIndex={3} variant="plain" onClick={() => setChangingPassword(true)}>
              Change password&hellip;
            </Button>
          </p>
        </div>
      </section>
      <section>
        <label>Last.fm</label>
        <div className="form-field">
          {!lastFM?.configured ? <p>Set LASTFM_API_KEY and LASTFM_API_SECRET to enable Last.fm.</p> : null}
          {lastFM?.configured && !lastFM.connected && !pending ? (
            <Button
              variant="secondary"
              className="btn btn-lastfm not-ok"
              id="lastfm-connect"
              tabIndex={4}
              disabled={busy}
              onClick={connect}
            >
              Connect to Last.fm
            </Button>
          ) : null}
          {pending ? (
            <p>
              Authorize Beatstream in the opened window, then{' '}
              <Button variant="secondary" className="btn" tabIndex={4} disabled={busy} onClick={complete}>
                Finish connection
              </Button>
            </p>
          ) : null}
          {lastFM?.connected ? (
            <p className="ok">
              Connected as {lastFM.username}{' '}
              <Button
                variant="secondary"
                className="btn"
                id="lastfm-disconnect"
                tabIndex={4}
                disabled={busy}
                onClick={disconnect}
              >
                Remove connection
              </Button>
            </p>
          ) : null}
          {error ? <p>{error}</p> : null}
        </div>
      </section>
      <div className="right">
        <input type="submit" className="btn-orange" value="Save" tabIndex={5} />
        <span className="loading ir" style={{ display: 'none' }}>
          Saving...
        </span>
      </div>
    </Modal>
  );
};
