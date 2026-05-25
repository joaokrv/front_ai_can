import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'active' | 'info' | 'error';
  showDot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  showDot = true,
  className = '',
  ...props
}) => {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {showDot && <span className={styles.dot} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};

