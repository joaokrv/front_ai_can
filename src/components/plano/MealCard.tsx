import React from 'react';
import { Apple } from 'lucide-react';
import { VoteButtons } from '../feedback/VoteButtons';
import styles from './MealCard.module.css';
import { sanitizeUrl } from '../../lib/api';

interface MealCardProps {
  nome: string;
  tipo: 'pre_treino' | 'pos_treino';
  ingredientes: string[];
  calorias: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
  initialVoted?: 'up' | 'down' | null;
  onVoteChange?: (voted: 'up' | 'down' | null) => void;
  linkReceita?: string;
}

export const MealCard: React.FC<MealCardProps> = ({
  nome,
  tipo,
  ingredientes = [],
  calorias,
  proteina,
  carboidrato,
  gordura,
  initialVoted = null,
  onVoteChange,
  linkReceita
}) => {
  const isPre = tipo === 'pre_treino';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={`${styles.typeLabel} ${isPre ? styles.preTreino : styles.posTreino}`}>
          <span className={styles.dot} />
          {isPre ? 'Pré-Treino' : 'Pós-Treino'}
        </span>
        <Apple size={14} style={{ color: 'var(--text-muted)' }} />
      </div>

      <div className={styles.body}>
        <h4 className={styles.title}>{nome}</h4>
        {ingredientes.length > 0 && (
          <p className={styles.ingredientes}>
            {ingredientes.join(', ')}
          </p>
        )}
      </div>

      {/* Grid de Macronutrientes */}
      <div className={styles.macrosGrid}>
        <div className={styles.macroItem}>
          <span className={styles.macroValue}>{calorias}</span>
          <span className={styles.macroLabel}>Kcal</span>
        </div>

        <div className={styles.macroItem}>
          <span className={styles.macroValue}>{proteina}g</span>
          <span className={styles.macroLabel}>Prot</span>
        </div>

        <div className={styles.macroItem}>
          <span className={styles.macroValue}>{carboidrato}g</span>
          <span className={styles.macroLabel}>Carb</span>
        </div>

        <div className={styles.macroItem}>
          <span className={styles.macroValue}>{gordura}g</span>
          <span className={styles.macroLabel}>Gord</span>
        </div>
      </div>

      {/* Seção inferior de Ações e Feedback */}
      <div className={styles.footer}>
        {linkReceita ? (
          <a
            href={sanitizeUrl(linkReceita)}
            target="_blank"
            rel="noopener noreferrer"
            title="Acessar receita detalhada"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem', 
              fontSize: '0.6875rem', 
              color: 'var(--accent-primary)',
              textDecoration: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Ver Receita ↗
          </a>
        ) : (
          <span className={styles.estimateLabel}>*valores estimados por IA</span>
        )}
        
        <VoteButtons
          tipo="refeicao"
          itemNome={nome}
          initialVoted={initialVoted}
          onVoteChange={onVoteChange}
        />
      </div>
    </div>
  );
};
export default MealCard;
