import React from 'react';
import type { FeedbackTipo, VotoUsuario } from '../../lib/feedback';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import api from '../../lib/api';
import { useToastStore } from '../../stores/toastStore';
import styles from './VoteButtons.module.css';

interface VoteButtonsProps {
  tipo: FeedbackTipo;
  itemNome: string;
  initialVoted?: VotoUsuario;
  onVoteChange?: (voted: VotoUsuario) => void;
  showLabel?: boolean;
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  tipo,
  itemNome,
  initialVoted = null,
  onVoteChange,
  showLabel = false
}) => {
  const [voted, setVoted] = React.useState<VotoUsuario>(initialVoted);
  const [loading, setLoading] = React.useState(false);
  const addToast = useToastStore(state => state.addToast);

  // Mantém sincronizado se a prop mudar
  React.useEffect(() => {
    setVoted(initialVoted);
  }, [initialVoted]);

  const handleVote = async (action: 'up' | 'down') => {
    if (loading) return;

    const gostou = action === 'up';
    const isUndoing = voted === action;
    const targetVoted = isUndoing ? null : action;

    setVoted(targetVoted);
    if (onVoteChange) onVoteChange(targetVoted);

    setLoading(true);

    try {
      if (isUndoing) {
        await api.delete(`/feedback/me/all?tipo=${tipo}&item_nome=${encodeURIComponent(itemNome)}`);
      } else {
        await api.post(`/feedback/${tipo}`, {
          item_nome: itemNome,
          gostou: gostou
        });
      }
    } catch (err) {
      setVoted(voted);
      if (onVoteChange) onVoteChange(voted);
      addToast('Nao foi possivel registrar sua avaliacao. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {showLabel && <span className={styles.label}>Curtir?</span>}
      
      <button
        type="button"
        className={`${styles.voteBtn} ${voted === 'up' ? styles.activeUp : ''}`}
        onClick={() => handleVote('up')}
        title={voted === 'up' ? 'Você curtiu isso' : 'Curtir (ajuda a IA recomendar mais)'}
        disabled={loading}
      >
        <ThumbsUp size={13} />
      </button>
      
      <button
        type="button"
        className={`${styles.voteBtn} ${voted === 'down' ? styles.activeDown : ''}`}
        onClick={() => handleVote('down')}
        title={voted === 'down' ? 'Você escondeu isso' : 'Esconder (impede a IA de recomendar)'}
        disabled={loading}
      >
        <ThumbsDown size={13} />
      </button>
    </div>
  );
};
export default VoteButtons;
