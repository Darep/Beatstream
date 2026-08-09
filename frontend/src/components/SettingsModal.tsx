import { useState } from 'react';

import { useSession } from 'hooks/swr';

import { PasswordChangeModal } from './PasswordChangeModal';
import { Button } from './common/Button';
import { Modal } from './common/Modal';

export const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useSession();
  const [changingPassword, setChangingPassword] = useState(false);

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
          <button className="btn btn-lastfm not-ok" id="lastfm-connect" tabIndex={4}>
            Connect to Last.fm
          </button>
          <p className="connecting" style={{ display: 'none' }}>
            <i className="icon-loading" />
            Connecting&hellip;
          </p>
          <p className="ok" style={{ display: 'none' }}>
            Connected
            <button className="btn" id="lastfm-disconnect" tabIndex={4}>
              Remove connection
            </button>
          </p>
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
