import React from 'react';
import styles from './DaySelector.module.css';

// Dias válidos espelhando o backend
export type DiaSemana = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';

interface DaySelectorProps {
  label?: string;
  selectedDays: DiaSemana[];
  onChange?: (days: DiaSemana[]) => void;
  readonly?: boolean;
}

const DIAS_MAPPING: { key: DiaSemana; label: string; tooltip: string }[] = [
  { key: 'segunda', label: 'S', tooltip: 'Segunda-feira' },
  { key: 'terca', label: 'T', tooltip: 'Terça-feira' },
  { key: 'quarta', label: 'Q', tooltip: 'Quarta-feira' },
  { key: 'quinta', label: 'Q', tooltip: 'Quinta-feira' },
  { key: 'sexta', label: 'S', tooltip: 'Sexta-feira' },
  { key: 'sabado', label: 'S', tooltip: 'Sábado' },
  { key: 'domingo', label: 'D', tooltip: 'Domingo' }
];

export const DaySelector: React.FC<DaySelectorProps> = ({
  label,
  selectedDays = [],
  onChange,
  readonly = false
}) => {
  const handleToggleDay = (day: DiaSemana) => {
    if (readonly || !onChange) return;

    if (selectedDays.includes(day)) {
      // Remove se já selecionado (garante que tenha pelo menos 1 dia selecionado se quiser, mas permitimos deixar vazio)
      onChange(selectedDays.filter(d => d !== day));
    } else {
      // Adiciona mantendo a ordem da semana
      const order = DIAS_MAPPING.map(d => d.key);
      const newDays = [...selectedDays, day].sort((a, b) => order.indexOf(a) - order.indexOf(b));
      onChange(newDays);
    }
  };

  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.daysGrid}>
        {DIAS_MAPPING.map((day) => {
          const isSelected = selectedDays.includes(day.key);
          const btnClass = [
            styles.dayBtn,
            isSelected ? styles.activeDay : '',
            readonly ? styles.readonly : ''
          ].filter(Boolean).join(' ');

          return (
            <button
              key={day.key}
              type="button"
              className={btnClass}
              onClick={() => handleToggleDay(day.key)}
              title={day.tooltip}
              disabled={readonly}
            >
              {day.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default DaySelector;
