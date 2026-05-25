import React from 'react';
import styles from './Stepper.module.css';

interface StepperProps {
  currentStep: number; // 1-indexed (1, 2, 3)
  steps: string[];
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  // Calcula a largura da linha de progresso
  const getProgressWidth = () => {
    if (currentStep <= 1) return '0%';
    if (currentStep >= steps.length) return '100%';
    return `${((currentStep - 1) / (steps.length - 1)) * 100}%`;
  };

  return (
    <div className={styles.stepper}>
      <div className={styles.line}>
        <div className={styles.lineProgress} style={{ width: getProgressWidth() }} />
      </div>

      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        const circleClass = [
          styles.circle,
          isActive ? styles.activeCircle : '',
          isCompleted ? styles.completedCircle : ''
        ].filter(Boolean).join(' ');

        const labelClass = [
          styles.label,
          isActive ? styles.activeLabel : '',
          isCompleted ? styles.completedLabel : ''
        ].filter(Boolean).join(' ');

        return (
          <div key={label} className={styles.step}>
            <div className={circleClass}>
              {isCompleted ? '✓' : stepNum}
            </div>
            <span className={labelClass}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};
