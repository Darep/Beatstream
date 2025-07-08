import classNames from 'classnames';
import { useRef, useState } from 'react';
import { mutate } from 'swr';

import { useSession } from 'hooks/swr';
import { request } from 'utils/api';

import preloader from 'assets/preloader.gif';

import styles from './AppTop.module.css';
import { SettingsModal } from './SettingsModal';
import { Button } from './common/Button';

export const AppTop = ({ className }: { className?: string }) => {
  const { user } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openModalName, setOpenModalName] = useState<'settings'>();
  const [isRefreshDone, setIsRefreshDone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | undefined>();
  const refreshDoneTimer = useRef<number>();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    if (refreshDoneTimer.current) {
      clearTimeout(refreshDoneTimer.current);
    }

    try {
      const data = await request<Song[]>('/api/songs/refresh', {
        method: 'POST',
      });

      setIsRefreshDone(true);
      mutate('/api/songs', data);

      refreshDoneTimer.current = window.setTimeout(
        () => setIsRefreshDone(false),
        5000,
      );
    } catch (error) {
      setRefreshError(error!.toString());
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await request('/api/session', { method: 'DELETE' });
    window.location.reload();
  };

  return (
    <header className={classNames(styles['app-top'], className)}>
      <h1 className="logo">Beatstream</h1>

      <div className="right">
        <div className="status-bar">
          {isRefreshing ? (
            <div className="media-library-refresh">
              <img src={preloader} alt="" />
              <span>Refreshing media library&hellip;</span>
            </div>
          ) : isRefreshDone ? (
            <div className="media-library-refresh-done">
              <i className="icon-tick"></i>
              <span>Done!</span>
            </div>
          ) : refreshError ? (
            <div className="media-library-refresh-fail">
              <i className="icon-notify"></i>
              <span title={refreshError}>Refresh failed!</span>{' '}
              <Button
                variant="plain"
                onClick={() => {
                  setRefreshError(undefined);
                }}>
                &times;
              </Button>
            </div>
          ) : null}
        </div>
        <div className="dropdown" id="user-menu">
          <Button
            className="dropdown-toggle username"
            id="menu-toggle"
            variant="plain"
            onClick={toggleDropdown}>
            {user?.username ?? <>&hellip;</>}
          </Button>
          {dropdownOpen ? (
            <ul className="dropdown-menu" role="menu">
              <li>
                <Button
                  id="settings-link"
                  variant="plain"
                  onClick={() => {
                    setOpenModalName('settings');
                    setDropdownOpen(false);
                  }}>
                  Settings&hellip;
                </Button>
              </li>
              <li>
                <Button
                  id="refresh-link"
                  variant="plain"
                  onClick={() => {
                    handleRefresh();
                    setDropdownOpen(false);
                  }}>
                  Refresh media library&hellip;
                </Button>
              </li>
              <li className="divider">
                <hr />
              </li>
              <li>
                <Button
                  id="logout-link"
                  variant="plain"
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}>
                  Log out
                </Button>
              </li>
            </ul>
          ) : null}

          {openModalName === 'settings' ? (
            <SettingsModal onClose={() => setOpenModalName(undefined)} />
          ) : null}
        </div>
      </div>
    </header>
  );
};
