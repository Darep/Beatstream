import classNames from 'classnames';
import { createPortal } from 'react-dom';

import styles from './Modal.module.css';

export const Modal = ({
  children,
  className,
  onClose,
  transparent,
}: {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  transparent?: boolean;
}) => {
  const modalRoot = document.getElementById('dialog-root');

  if (!modalRoot) {
    throw new Error('Fatal error: #dialog-root not found');
  }

  return createPortal(
    <div className={classNames(styles['dialog-container'], transparent && styles['dialog-container--transparent'])}>
      <div className={classNames(styles.dialog, className)} role="dialog" aria-modal="true">
        {onClose ? (
          <button type="button" className={styles.close} aria-label="Close dialog" onClick={onClose}>
            &times;
          </button>
        ) : null}

        {children}
      </div>
    </div>,
    modalRoot,
  );
};
