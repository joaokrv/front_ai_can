import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Trash2, ArrowRight, AlertTriangle, RotateCcw } from 'lucide-react';

import api from '../../lib/api';
import { useToastStore } from '../../stores/toastStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import styles from './HistoricoPage.module.css';

interface PlanoItem {
  id: number;
  nome: string;
  status: 'ativo' | 'arquivado';
  created_at: string;
}

interface PaginatedPlanos {
  itens: PlanoItem[];
  total: number;
  pagina: number;
  limite: number;
  paginas: number;
}

export const HistoricoPage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore(state => state.addToast);
  const [data, setData] = React.useState<PaginatedPlanos | null>(null);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // States para gerenciar deleção de planos
  const [selectedPlano, setSelectedPlano] = React.useState<PlanoItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const carregarPlanos = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<PaginatedPlanos>(`/planos?page=${page}&limit=9`);
      setData(res);
    } catch (err) {
      addToast('Erro ao carregar dados. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    carregarPlanos();
  }, [carregarPlanos]);

  // Função para deletar plano
  const handleDeletePlano = async () => {
    if (!selectedPlano) return;
    setIsDeleting(true);
    try {
      await api.delete(`/planos/${selectedPlano.id}`);
      setIsDeleteOpen(false);
      setSelectedPlano(null);
      addToast('Plano excluído com sucesso.', 'success');
      // Recarrega listagem (ajustando a página se deletar o último item de uma página)
      carregarPlanos();
    } catch (err) {
      addToast('Erro ao excluir o plano. Tente novamente.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };


  const handleReativarPlano = async (planoId: number, planoNome: string) => {
    try {
      await api.put(`/planos/${planoId}/ativar`);
      addToast(`Plano "${planoNome}" reativado com sucesso!`, 'success');
      carregarPlanos();
    } catch (err: any) {
      addToast(err.message || 'Erro ao reativar o plano. Tente novamente.', 'error');
    }
  };

  const formatarData = (isoStr: string) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Histórico de Planos</h1>
        <p className={styles.subtitle}>Consulte a grade completa de planejamentos que você gerou anteriormente no AICan.</p>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} variant="custom" height={160} />
          ))}
        </div>
      ) : data?.itens && data.itens.length > 0 ? (
        <>
          <div className={styles.grid}>
            {data.itens.map((plano) => {
              const isAtivo = plano.status === 'ativo';
              return (
                <div key={plano.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardMeta}>
                      <Badge variant={isAtivo ? 'active' : 'default'}>
                        {isAtivo ? 'Ativo' : 'Arquivado'}
                      </Badge>
                      <h3 className={styles.cardTitle}>{plano.nome}</h3>
                    </div>
                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className={styles.date}>Criado em {formatarData(plano.created_at)}</div>
                    
                    <div className={styles.cardFooter}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPlano(plano);
                          setIsDeleteOpen(true);
                        }}
                        style={{ color: 'var(--feedback-negative)', padding: 0 }}
                      >
                        <Trash2 size={14} />
                      </Button>

                      <div className={styles.btnGroup}>
                        {plano.status !== 'ativo' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleReativarPlano(plano.id, plano.nome)}
                            leftIcon={<RotateCcw size={12} />}
                          >
                            Reativar
                          </Button>
                        )}
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/plano/${plano.id}`)}
                          rightIcon={<ArrowRight size={12} />}
                        >
                          Visualizar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginação */}
          {data.paginas > 1 && (
            <div className={styles.pagination}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page <= 1}
                leftIcon={<ChevronLeft size={14} />}
              >
                Anterior
              </Button>
              <span>Página {data.pagina} de {data.paginas}</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.min(p + 1, data.paginas))}
                disabled={page >= data.paginas}
                rightIcon={<ChevronRight size={14} />}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Você ainda não gerou nenhum plano. Vá em "Novo Plano" para criar um!
        </div>
      )}

      {/* Modal de confirmação para deletar plano */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirmar exclusão de plano"
        footer={
          <div className={styles.btnGroup}>
            <Button onClick={() => setIsDeleteOpen(false)} variant="secondary" size="sm">
              Cancelar
            </Button>
            <Button 
              onClick={handleDeletePlano} 
              variant="danger" 
              size="sm"
              isLoading={isDeleting}
            >
              Excluir
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle size={24} style={{ color: 'var(--feedback-negative)', flexShrink: 0 }} />
          <div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Deletar o plano "{selectedPlano?.nome}"?
            </p>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
              Esta ação excluirá permanentemente todos os treinos, repetições, exercícios e refeições atrelados a este plano. 
              Você não poderá recuperá-lo no futuro.
            </p>
          </div>
        </div>
      </Modal>

    </div>
  );
};
export default HistoricoPage;