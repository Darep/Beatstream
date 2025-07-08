import classNames from 'classnames';
import { createPortal } from 'react-dom';

import styles from './Modal.module.css';

export const Modal = ({
  children,
  onClose,
  transparent,
}: {
  children: React.ReactNode;
  onClose?: () => void;
  transparent?: boolean;
}) => {
  const modalRoot = document.getElementById('dialog-root');

  if (!modalRoot) {
    throw new Error('Fatal error: #dialog-root not found');
  }

  return createPortal(
    <div className={classNames(styles['dialog-container'], transparent && styles['dialog-container--transparent'])}>
      <div className={styles.dialog} role="dialog">
        {onClose ? (
          <button className={styles.close} onClick={onClose}>
            &times;
          </button>
        ) : null}

        {children}
      </div>
    </div>,
    modalRoot,
  );
};
