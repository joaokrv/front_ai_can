import React from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  subtext?: string;
  delta?: string; // Ex: "+12%"
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  subtext,
  delta,
  className = ''
}) => {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.iconWrapper}>{icon}</span>}
      </div>
      
      <div className={styles.value}>{value}</div>
      
      {(subtext || delta) && (
        <div className={styles.subtext}>
          {delta && <span className={styles.positiveDelta}>{delta}</span>}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </div>
  );
};
export default StatCard;
