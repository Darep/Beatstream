import { type FormEvent, useState } from 'react';

import { ApiError, request } from 'utils/api';

import { Button } from './common/Button';
import styles from './PasswordChangeForm.module.css';

export const PasswordChangeForm = ({ onClose }: { onClose: () => void }) => {
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
      setError(
        error instanceof ApiError && error.status === 401
          ? 'Current password is incorrect'
          : 'Could not change password',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fields}>
        <label className={styles.field} htmlFor="current-password">
          <span>Current password</span>
          <input
            autoComplete="current-password"
            required
            type="password"
            id="current-password"
            name="currentPassword"
          />
        </label>
        <label className={styles.field} htmlFor="new-password">
          <span>New password</span>
          <input autoComplete="new-password" required type="password" id="new-password" name="newPassword" />
        </label>
        <label className={styles.field} htmlFor="new-password-2">
          <span>Confirm password</span>
          <input autoComplete="new-password" required type="password" id="new-password-2" name="confirmPassword" />
        </label>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <footer className={styles.footer}>
        <Button variant="secondary" className={styles.secondaryAction} onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className={styles.primaryAction} disabled={saving}>
          {saving ? 'Saving…' : 'Update password'}
        </Button>
      </footer>
    </form>
  );
};
