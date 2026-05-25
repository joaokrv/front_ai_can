import React from 'react';
import styles from './DurationSlider.module.css';

interface DurationSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const DurationSlider = React.forwardRef<HTMLInputElement, DurationSliderProps>(
  ({ label, value, onChange, min = 15, max = 300, step = 5, className = '', ...props }, ref) => {
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    };

    // Formata o tempo para uma string amigável (ex: 1h 15min)
    const formatDuration = (mins: number) => {
      if (mins < 60) return `${mins} min`;
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return remainingMins > 0 ? `${hrs}h ${remainingMins}min` : `${hrs}h`;
    };

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          <span className={styles.value}>{formatDuration(value)}</span>
        </div>
        <div className={styles.sliderWrapper}>
          <span className={styles.limits}>{min}m</span>
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            className={`${styles.slider} ${className}`}
            {...props}
          />
          <span className={styles.limits}>{max}m</span>
        </div>
      </div>
    );
  }
);

DurationSlider.displayName = 'DurationSlider';
export default DurationSlider;
