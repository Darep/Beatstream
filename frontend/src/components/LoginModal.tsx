import { type FormEvent, useState } from 'react';
import { mutate } from 'swr';

import { ApiError, request } from 'utils/api';

import styles from './LoginModal.module.css';
import { Modal } from './common/Modal';

export const LoginModal = () => {
  const [error, setError] = useState<string>();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const username = data.get('username');
    const password = data.get('password');

    try {
      const response = await request<{ username: string }>('/api/session', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });

      mutate('/api/session', response);
      mutate('/api/songs');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setError('Invalid username or password');
      }
    }

    return false;
  };

  return (
    <Modal>
      <form onSubmit={handleLogin}>
        <h2 className={styles.title}>Log in</h2>
        <div className={styles.fields}>
          <label>Username</label>
          <input id="username" name="username" type="text" tabIndex={1} />

          <label>Password</label>
          <input id="password" name="password" type="password" tabIndex={2} />

          {error ? (
            <>
              <span className={styles.error}>{error}</span>
            </>
          ) : null}

          <span>{/* grid spacer */}</span>
          <div>
            <input className="btn" type="submit" value="Log in" tabIndex={3} />
          </div>
        </div>
      </form>
    </Modal>
  );
};
