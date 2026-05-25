import React from 'react';
import { buildTreinoItemNome } from '../../lib/feedback';
import type { VotoUsuario } from '../../lib/feedback';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Clock, BrainCircuit, ArrowRight, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { VoteButtons } from '../feedback/VoteButtons';
import styles from './TrainingCard.module.css';

interface TrainingCardProps {
  planoId: number;
  nomePlano: string;
  focoMuscular?: string;
  numExercicios: number;
  duracao: number;
  nivelExperiencia: string;
  onRegenerar?: () => void;
  isRegenerating?: boolean;
  initialVoted?: VotoUsuario;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({
  planoId,
  nomePlano,
  focoMuscular = 'Foco Geral',
  numExercicios,
  duracao,
  nivelExperiencia,
  onRegenerar,
  isRegenerating = false,
  initialVoted = null as VotoUsuario
}) => {
  const navigate = useNavigate();

const translateNivel = (level: string) => {
    switch (level.toLowerCase()) {
      case 'iniciante': return 'Iniciante';
      case 'intermediario': return 'Intermediário';
      case 'avancado': return 'Avançado';
      default: return level;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleArea}>
          <div className={styles.badgeGroup}>
            <span className={styles.monoLabel}>// Treino do Dia</span>
            <Badge variant="info">Gerado por IA</Badge>
          </div>
          <h3 className={styles.title}>{focoMuscular}</h3>
          <p className={styles.desc}>Plano ativo: {nomePlano}</p>
        </div>
      </div>

      {/* Grid de Informações de Volume e Dificuldade */}
      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <Clock size={16} className={styles.metaIcon} style={{ color: 'var(--accent-secondary)' }} />
          <span className={styles.metaValue}>{duracao} min</span>
          <span className={styles.metaLabel}>Duração</span>
        </div>

        <div className={styles.metaItem}>
          <Dumbbell size={16} className={styles.metaIcon} style={{ color: 'var(--accent-primary)' }} />
          <span className={styles.metaValue}>{numExercicios}</span>
          <span className={styles.metaLabel}>Exercícios</span>
        </div>

        <div className={styles.metaItem}>
          <BrainCircuit size={16} className={styles.metaIcon} style={{ color: 'var(--feedback-positive)' }} />
          <span className={styles.metaValue}>{translateNivel(nivelExperiencia)}</span>
          <span className={styles.metaLabel}>Nível IA</span>
        </div>
      </div>

      {/* Seção inferior de Ações e Votação */}
      <div className={styles.actionsArea}>
        <VoteButtons tipo="exercicio" itemNome={buildTreinoItemNome(focoMuscular ?? '', planoId)} showLabel initialVoted={initialVoted} />

        <div className={styles.actionsBtns}>
          {onRegenerar && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRegenerar}
              isLoading={isRegenerating}
              leftIcon={<RefreshCw size={12} />}
            >
              Regenerar
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/plano/${planoId}`)}
            rightIcon={<ArrowRight size={12} />}
          >
            Ver Plano Completo
          </Button>
        </div>
      </div>
    </div>
  );
};
export default TrainingCard;
