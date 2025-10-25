import { Modal } from './common/Modal';

export const PasswordChangeModal = () => {
  return (
    <Modal onClose={() => null}>
      <h2>Change password</h2>
      <label>Current password</label>
      <div className="form-field">
        <input type="password" id="current-password" />
      </div>
      <label>New password</label>
      <div className="form-field">
        <input type="password" id="new-password" />
      </div>
      <label>Confirm new password</label>
      <div className="form-field">
        <input type="password" id="new-password-2" />
      </div>
      <div className="form-field">
        <input type="submit" className="btn" value="Update Password" />
        <span className="loading ir" style={{ display: 'none' }}>
          Saving&hellip;
        </span>
      </div>
    </Modal>
  );
};
