import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Trash2, 
  Sparkles, 
  AlertTriangle 
} from 'lucide-react';


import api from '../../lib/api';
import { parsePlanoIdFromItemNome } from '../../lib/feedback';
import type { FeedbackItem } from '../../lib/feedback';
import { useToastStore } from '../../stores/toastStore';
import { StatCard } from '../../components/plano/StatCard';
import { TagChip } from '../../components/ui/TagChip';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import styles from './AfinidadePage.module.css';

interface FeedbackStats {
  taxa_satisfacao: number;
  total_feedbacks: number;
}

export const AfinidadePage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore(state => state.addToast);
  const [feedbacks, setFeedbacks] = React.useState<FeedbackItem[]>([]);

  const [stats, setStats] = React.useState<FeedbackStats>({ taxa_satisfacao: 100, total_feedbacks: 0 });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isResetOpen, setIsResetOpen] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  const carregarFeedbacks = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const fbList = await api.get<{ itens: FeedbackItem[] }>('/feedback/me?limit=100');
      setFeedbacks(fbList.itens || []);

      const fbStats = await api.get<FeedbackStats>('/feedback/stats');
      setStats(fbStats);
    } catch (err) {
      addToast('Erro ao carregar dados. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    carregarFeedbacks();
  }, [carregarFeedbacks]);

  // Remove um feedback individual
  const handleRemoveFeedback = async (id: number) => {
    try {
      await api.delete(`/feedback/${id}`);
      // Atualiza estado local
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      // Recarrega estatísticas
      const fbStats = await api.get<FeedbackStats>('/feedback/stats');
      setStats(fbStats);
    } catch (err) {
      addToast('Erro ao remover avaliação. Tente novamente.', 'error');
    }
  };

  // Reseta todo o aprendizado da IA
  const handleResetAprendizado = async () => {
    setIsResetting(true);
    try {
      // Deleta todos os feedbacks no backend
      await api.delete('/feedback/me/all');
      setFeedbacks([]);
      setStats({ taxa_satisfacao: 100, total_feedbacks: 0 });
      setIsResetOpen(false);
      addToast('Aprendizado zerado com sucesso.', 'success');
    } catch (err) {
      addToast('Erro ao zerar o aprendizado. Tente novamente.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Skeleton variant="text" width={180} height={16} />
        <Skeleton variant="custom" height={140} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <Skeleton variant="custom" height={260} />
          <Skeleton variant="custom" height={260} />
        </div>
      </div>
    );
  }

  // Separa feedbacks curtidos vs. rejeitados por tipo
  const filterFeedbacks = (tipo?: 'exercicio' | 'refeicao') => {
    const list = tipo ? feedbacks.filter(f => f.tipo === tipo) : feedbacks;
    const curtidos = list.filter(f => f.gostou);
    const rejeitados = list.filter(f => !f.gostou);
    return { curtidos, rejeitados };
  };

  const renderAffinityGrid = (tipo?: 'exercicio' | 'refeicao') => {
    const { curtidos, rejeitados } = filterFeedbacks(tipo);

    return (
      <div className={styles.affinityGrid}>
        {/* Coluna Curtidos */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <ThumbsUp size={16} className={styles.likedTitle} />
            <h3 className={`${styles.columnTitle} ${styles.likedTitle}`}>Sugestões Curtidas</h3>
          </div>
          <div className={styles.tagsWrapper}>
            {curtidos.length > 0 ? (
              curtidos.map(item => {
                const planoId = parsePlanoIdFromItemNome(item.item_nome);
                return (
                  <TagChip
                    key={item.id}
                    onRemove={() => handleRemoveFeedback(item.id)}
                    onClick={planoId !== null ? () => navigate(`/plano/${planoId}`) : undefined}
                  >
                    {item.item_nome}
                  </TagChip>
                );
              })

            ) : (
              <span className={styles.emptyState}>Nenhuma sugestão curtida nesta categoria.</span>
            )}
          </div>
        </div>

        {/* Coluna Ocultados */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <ThumbsDown size={16} className={styles.dislikedTitle} />
            <h3 className={`${styles.columnTitle} ${styles.dislikedTitle}`}>Sugestões Ocultadas</h3>
          </div>
          <div className={styles.tagsWrapper}>
            {rejeitados.length > 0 ? (
              rejeitados.map(item => {
                const planoId = parsePlanoIdFromItemNome(item.item_nome);
                return (
                  <TagChip
                    key={item.id}
                    onRemove={() => handleRemoveFeedback(item.id)}
                    onClick={planoId !== null ? () => navigate(`/plano/${planoId}`) : undefined}
                  >
                    {item.item_nome}
                  </TagChip>
                );
              })

            ) : (
              <span className={styles.emptyState}>Nenhuma sugestão ocultada nesta categoria.</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabItems = [
    { id: 'tudo', label: 'Tudo', content: renderAffinityGrid() },
    { id: 'treinos', label: 'Exercícios', content: renderAffinityGrid('exercicio') },
    { id: 'refeicoes', label: 'Nutrição', content: renderAffinityGrid('refeicao') }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header Actions */}
      <div className={styles.headerActions}>
        <div className={styles.breadcrumb}>
          <Link to="/hoje" className={styles.breadcrumbLink}>Hoje</Link> / Afinidade
        </div>
        
        <div className={styles.btnGroup}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsResetOpen(true)}
            leftIcon={<Trash2 size={12} />}
          >
            Zerar Aprendizado
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/onboarding')}
            leftIcon={<Sparkles size={12} />}
          >
            Refazer Onboarding
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className={styles.hero}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
          <h2 className={styles.heroTitle}>Afinidade & Aprendizado da IA</h2>
        </div>
        <p className={styles.heroDesc}>
          Aqui você gerencia o que a inteligência artificial aprendeu sobre suas preferências físicas e alimentares. 
          Itens curtidos (▲) serão priorizados nas próximas gerações de planos. 
          Itens ocultados (▼) serão completamente evitados.
        </p>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <StatCard
          label="Total de Avaliações"
          value={stats.total_feedbacks}
          icon={<Heart size={16} />}
          subtext="Votos de curtir/ocultar computados"
        />
        <StatCard
          label="Taxa de Satisfação"
          value={`${stats.taxa_satisfacao}%`}
          icon={<ThumbsUp size={16} />}
          subtext="Média de aceitação dos planos"
        />
      </div>

      {/* Abas de Filtros */}
      <Tabs tabs={tabItems} variant="accent" />

      {/* Modal de confirmação para resetar aprendizado */}
      <Modal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Confirmar exclusão de aprendizado"
        footer={
          <div className={styles.btnGroup}>
            <Button onClick={() => setIsResetOpen(false)} variant="secondary" size="sm">
              Cancelar
            </Button>
            <Button 
              onClick={handleResetAprendizado} 
              variant="danger" 
              size="sm"
              isLoading={isResetting}
            >
              Apagar Tudo
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={24} style={{ color: 'var(--feedback-negative)', flexShrink: 0 }} />
          <div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Esta ação é permanente e irreversível!
            </p>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
              Ao apagar o aprendizado, todas as suas curtidas e rejeições de exercícios e refeições serão deletadas do banco. 
              A IA do AICan voltará a gerar sugestões baseadas no perfil padrão.
            </p>
          </div>
        </div>
      </Modal>

    </div>
  );
};
export default AfinidadePage;