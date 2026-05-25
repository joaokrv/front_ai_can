import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Apple } from 'lucide-react';

import api from '../../lib/api';
import { sanitizeUrl } from '../../lib/api';
import { useToastStore } from '../../stores/toastStore';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { VoteButtons } from '../../components/feedback/VoteButtons';
import styles from './RefeicoesPage.module.css';

interface RefeicaoCat {
  id: number;
  nome: string;
  tipo: 'pre_treino' | 'pos_treino';
  ingredientes: string[];
  calorias: number;
  proteina_g: number;
  carboidrato_g: number;
  gordura_g: number;
  link_receita?: string;
}

interface PaginatedCat {
  itens: RefeicaoCat[];
  total: number;
  pagina: number;
  limite: number;
  paginas: number;
}

export const RefeicoesPage: React.FC = () => {
  const addToast = useToastStore(state => state.addToast);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  
  const [query, setQuery] = React.useState(initialQ);
  const [tipo, setTipo] = React.useState('');
  const [page, setPage] = React.useState(1);
  
  const [data, setData] = React.useState<PaginatedCat | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Efeito de Debounce no input de texto
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams(prev => {
        if (query) {
          prev.set('q', query);
        } else {
          prev.delete('q');
        }
        return prev;
      });
      setPage(1); // Reseta para primeira página ao buscar
    }, 400);

    return () => clearTimeout(handler);
  }, [query, setSearchParams]);

  // Carrega refeições do catálogo
  const buscarRefeicoes = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const qParam = searchParams.get('q') || '';
      let url = `/catalogo/refeicoes?page=${page}&limit=12`;
      if (qParam) url += `&q=${encodeURIComponent(qParam)}`;
      if (tipo) url += `&tipo=${encodeURIComponent(tipo)}`;

      const res = await api.get<PaginatedCat>(url);
      setData(res);
    } catch (err) {
      addToast('Erro ao carregar refeições. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, tipo, searchParams]);

  React.useEffect(() => {
    buscarRefeicoes();
  }, [buscarRefeicoes]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Catálogo Nutricional</h1>
        <p className={styles.subtitle}>Consulte as receitas e lanches de pré e pós-treino sugeridos pela IA do AICan e avalie seus prediletos.</p>
      </div>

      {/* Filtros */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrapper}>
          <Input
            type="text"
            placeholder="Buscar receita pelo nome ou ingrediente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        <div className={styles.selectWrapper}>
          <label htmlFor="tipo-select" className={styles.selectLabel}>Tipo de Refeição</label>
          <select
            id="tipo-select"
            className={styles.select}
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Pré e pós-treino</option>
            <option value="pre_treino">Pré-treino</option>
            <option value="pos_treino">Pós-treino</option>
          </select>
        </div>
      </div>

      {/* Grid de Refeições */}
      {isLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} variant="custom" height={220} />
          ))}
        </div>
      ) : data?.itens && data.itens.length > 0 ? (
        <>
          <div className={styles.grid}>
            {data.itens.map((ref) => {
              const isPre = ref.tipo === 'pre_treino';
              return (
                <div key={ref.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleArea}>
                      <h3 className={styles.cardTitle}>{ref.nome}</h3>
                      <Apple size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    </div>
                    <Badge variant={isPre ? 'info' : 'active'} className={styles.typeBadge}>
                      {isPre ? 'Pré-treino' : 'Pós-treino'}
                    </Badge>
                    
                    {ref.ingredientes && ref.ingredientes.length > 0 && (
                      <p className={styles.ingredientes}>
                        {ref.ingredientes.join(', ')}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {/* Grid de Macronutrientes */}
                    <div className={styles.macrosGrid}>
                      <div className={styles.macroItem}>
                        <span className={styles.macroValue}>{ref.calorias}</span>
                        <span className={styles.macroLabel}>Kcal</span>
                      </div>
                      <div className={styles.macroItem}>
                        <span className={styles.macroValue}>{ref.proteina_g}g</span>
                        <span className={styles.macroLabel}>Prot</span>
                      </div>
                      <div className={styles.macroItem}>
                        <span className={styles.macroValue}>{ref.carboidrato_g}g</span>
                        <span className={styles.macroLabel}>Carb</span>
                      </div>
                      <div className={styles.macroItem}>
                        <span className={styles.macroValue}>{ref.gordura_g}g</span>
                        <span className={styles.macroLabel}>Gord</span>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      {ref.link_receita ? (
                        <a
                          href={sanitizeUrl(ref.link_receita)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Acessar receita detalhada"
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
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
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Feedback IA</span>
                      )}
                      <VoteButtons tipo="refeicao" itemNome={ref.nome} />
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
          Nenhuma refeição encontrada com os filtros aplicados.
        </div>
      )}

    </div>
  );
};
export default RefeicoesPage;