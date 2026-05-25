import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

export const AuthLayout: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* Lado Esquerdo: Marca & Destaques */}
      <div className={styles.heroPanel}>
        <div className={styles.logo}>
          AICan<span className={styles.logoAccent}>✦</span>
        </div>
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Gere treinos e refeições inteligentes com <span className={styles.heroTitleAccent}>IA</span>
          </h1>
          <p className={styles.heroText}>
            Planejamento inteligente e sob medida com base nos seus objetivos, preferências e restrições. Simples, rápido e 100% individualizado.
          </p>
        </div>

        <div className={styles.heroFooter}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>100%</span>
            <span className={styles.statLabel}>Personalizado</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>GPT-4 / Gemini</span>
            <span className={styles.statLabel}>Tecnologia de Ponta</span>
          </div>
        </div>
      </div>

      {/* Lado Direito: Formulário (Login / Registro) */}
      <div className={styles.formPanel}>
        <div className={styles.formWrapper}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
