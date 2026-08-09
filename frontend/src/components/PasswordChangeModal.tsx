import { type FormEvent, useState } from 'react';

import { ApiError, request } from 'utils/api';

import { Modal } from './common/Modal';

export const PasswordChangeModal = ({ onClose }: { onClose: () => void }) => {
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const currentPassword = String(data.get('currentPassword'));
    const newPassword = String(data.get('newPassword'));

    if (newPassword !== data.get('confirmPassword')) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);
    setError(undefined);
    try {
      await request('/api/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      onClose();
    } catch (error) {
      setError(error instanceof ApiError && error.status === 401 ? 'Current password is incorrect' : 'Could not change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2>Change password</h2>
        <label htmlFor="current-password">Current password</label>
        <div className="form-field">
          <input required type="password" id="current-password" name="currentPassword" />
        </div>
        <label htmlFor="new-password">New password</label>
        <div className="form-field">
          <input required type="password" id="new-password" name="newPassword" />
        </div>
        <label htmlFor="new-password-2">Confirm new password</label>
        <div className="form-field">
          <input required type="password" id="new-password-2" name="confirmPassword" />
        </div>
        {error ? <p>{error}</p> : null}
        <div className="form-field">
          <input disabled={saving} type="submit" className="btn" value={saving ? 'Saving…' : 'Update Password'} />
        </div>
      </form>
    </Modal>
  );
};
