import React from 'react';
import { Play } from 'lucide-react';
import { VoteButtons } from '../feedback/VoteButtons';
import styles from './ExerciseRow.module.css';
import { sanitizeUrl } from '../../lib/api';

interface ExerciseRowProps {
  ordem: string | number; // Ex: "A1" ou 1
  nome: string;
  series: number;
  repeticoes: string; // Ex: "10-12" ou "12"
  descanso: number; // em segundos
  initialVoted?: 'up' | 'down' | null;
  onVoteChange?: (voted: 'up' | 'down' | null) => void;
  videoUrl?: string;
}

export const ExerciseRow: React.FC<ExerciseRowProps> = ({
  ordem,
  nome,
  series,
  repeticoes,
  descanso,
  initialVoted = null,
  onVoteChange,
  videoUrl
}) => {
  // Formata o tempo de descanso
  const formatDescanso = (sec: number) => {
    if (!sec) return '—';
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    const remSec = sec % 60;
    return remSec > 0 ? `${min}m ${remSec}s` : `${min}m`;
  };

  return (
    <div className={styles.row}>
      <div className={styles.leftArea}>
        <div className={styles.orderBadge}>{ordem}</div>
        <div className={styles.nameInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={styles.name} title={nome}>
              {nome}
            </span>
            {videoUrl && (
              <a
                href={sanitizeUrl(videoUrl)}
                target="_blank"
                rel="noopener noreferrer"
                title="Assistir vídeo de execução"
                style={{ display: 'flex', alignItems: 'center', color: 'var(--accent-primary)', cursor: 'pointer', flexShrink: 0 }}
              >
                <Play size={12} fill="currentColor" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Metadados de Exercício */}
      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Séries</span>
          <span className={styles.metaValue}>{series}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Repetições</span>
          <span className={styles.metaValue}>{repeticoes}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Descanso</span>
          <span className={styles.metaValue}>{formatDescanso(descanso)}</span>
        </div>
      </div>

      {/* VoteButtons inline */}
      <div className={styles.actions}>
        <VoteButtons
          tipo="exercicio"
          itemNome={nome}
          initialVoted={initialVoted}
          onVoteChange={onVoteChange}
        />
      </div>
    </div>
  );
};
export default ExerciseRow;
