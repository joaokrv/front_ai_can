import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import styles from './MacroDonut.module.css';

interface MacroDonutProps {
  calorias: number;
  proteina: number; // em gramas
  carboidrato: number;
  gordura: number;
}

export const MacroDonut: React.FC<MacroDonutProps> = ({
  calorias = 0,
  proteina = 0,
  carboidrato = 0,
  gordura = 0
}) => {
  
  // Dados estruturados para o PieChart
  const data = [
    { name: 'Proteínas', value: proteina, color: 'var(--accent-primary)' }, // Lima
    { name: 'Carboidratos', value: carboidrato, color: 'var(--accent-secondary)' }, // Cyan
    { name: 'Gorduras', value: gordura, color: '#FF7A00' } // Laranja/Rosa sutil
  ];

  const totalMacros = proteina + carboidrato + gordura;

  return (
    <div className={styles.donutContainer}>
      <span className={styles.title}>Divisão de Macronutrientes</span>

      <div className={styles.canvasWrapper}>
        {totalMacros === 0 ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            Sem dados
          </div>
        ) : (
          <PieChart width={180} height={180}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
          </PieChart>
        )}

        {/* Calorias no Centro */}
        <div className={styles.centerLabel}>
          <span className={styles.kcalValue}>{calorias}</span>
          <span className={styles.kcalLabel}>Kcal</span>
        </div>
      </div>

      {/* Legenda Customizada */}
      <div className={styles.legend}>
        {data.map((item) => {
          const percent = totalMacros > 0 ? Math.round((item.value / totalMacros) * 100) : 0;
          return (
            <div key={item.name} className={styles.legendItem}>
              <span className={styles.colorIndicator} style={{ backgroundColor: item.color }} />
              <span>{item.name} ({percent}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default MacroDonut;
