import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import styles from './WeeklyBarChart.module.css';

interface ChartDataPoint {
  periodo: string; // Ex: "Jan", "Fev"
  planos: number;
}

interface WeeklyBarChartProps {
  data: ChartDataPoint[];
  title?: string;
  subTitle?: string;
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  data,
  title = 'Saturação de Geração',
  subTitle = 'Volume de planos criados mensalmente'
}) => {
  
  // Custom Tooltip para manter a identidade Obsidian
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          <p className={styles.tooltipValue}>
            {payload[0].value} {payload[0].value === 1 ? 'plano' : 'planos'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <div>
          <h4 className={styles.chartTitle}>{title}</h4>
          <span className={styles.chartSub}>{subTitle}</span>
        </div>
      </div>

      <div className={styles.canvasWrapper}>
        {data.length === 0 ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Sem dados suficientes
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <XAxis
                dataKey="periodo"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar
                dataKey="planos"
                fill="var(--accent-primary)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
export default WeeklyBarChart;
