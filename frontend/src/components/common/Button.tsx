import classNames from 'classnames';

import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant: 'primary' | 'secondary' | 'plain';
}

export const Button = ({ children, type = 'button', variant, ...props }: ButtonProps) => {
  const variantClass = styles[`button--${variant}`] ?? null;

  return (
    <button type={type} {...props} className={classNames(styles.button, variantClass, props.className)}>
      {children}
    </button>
  );
};
