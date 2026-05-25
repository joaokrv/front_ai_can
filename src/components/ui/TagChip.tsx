import React from 'react';
import styles from './TagChip.module.css';

interface TagChipProps {
  active?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  readonly?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const TagChip: React.FC<TagChipProps> = ({
  children,
  active = false,
  onRemove,
  onClick,
  readonly = false,
  className = ''
}) => {
  const chipClasses = [
    styles.chip,
    active ? styles.active : '',
    readonly ? styles.readonly : '',
    className
  ].filter(Boolean).join(' ');

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  return (
    <div
      className={chipClasses}
      onClick={!readonly ? onClick : undefined}
      role={!readonly && onClick ? 'button' : undefined}
    >
      {active && !onRemove && <span className={styles.dot} aria-hidden="true" />}
      <span>{children}</span>
      {onRemove && (
        <span
          className={styles.removeBtn}
          onClick={handleRemove}
          role="button"
          aria-label={`Remover ${children}`}
        >
          ×
        </span>
      )}
    </div>
  );
};
