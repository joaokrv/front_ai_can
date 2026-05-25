import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Dumbbell, Sparkles, Play } from 'lucide-react';

import api from '../../lib/api';
import { sanitizeUrl } from '../../lib/api';
import { useToastStore } from '../../stores/toastStore';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { VoteButtons } from '../../components/feedback/VoteButtons';
import { ExerciseRow } from '../../components/plano/ExerciseRow';
import { Tabs } from '../../components/ui/Tabs';
import styles from './ExerciciosPage.module.css';

interface ExercicioCat {
  id: number;
  nome: string;
  grupo_muscular: string;
  descricao: string;
  video_url?: string;
}

interface PaginatedCat {
  itens: ExercicioCat[];
  total: number;
  pagina: number;
  limite: number;
  paginas: number;
}

const GRUPOS_MUSCULARES = [
  { value: '', label: 'Todos os grupos' },
  { value: 'peito', label: 'Peito' },
  { value: 'costas', label: 'Costas' },
  { value: 'pernas', label: 'Pernas / Coxas' },
  { value: 'ombros', label: 'Ombros' },
  { value: 'biceps', label: 'Bíceps' },
  { value: 'triceps', label: 'Tríceps' },
  { value: 'abdome', label: 'Abdômen' },
  { value: 'panturrilha', label: 'Panturrilhas' }
];

export const ExerciciosPage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore(state => state.addToast);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  
  const [query, setQuery] = React.useState(initialQ);
  const [grupo, setGrupo] = React.useState('');
  const [page, setPage] = React.useState(1);
  
  const [data, setData] = React.useState<PaginatedCat | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // States do plano ativo do usuário
  const [planoAtivo, setPlanoAtivo] = React.useState<any>(null);
  const [diaTreinoHoje, setDiaTreinoHoje] = React.useState<any>(null);
  const [loadingPlano, setLoadingPlano] = React.useState(true);
  const [userFeedbacks, setUserFeedbacks] = React.useState<Record<string, 'up' | 'down'>>({});

  const carregarFeedbacks = React.useCallback(async () => {
    try {
      const fbList = await api.get<{ itens: any[] }>('/feedback/me?limit=150');
      const fbMap: Record<string, 'up' | 'down'> = {};
      fbList.itens?.forEach(item => {
        fbMap[item.item_nome] = item.gostou ? 'up' : 'down';
      });
      setUserFeedbacks(fbMap);
    } catch (err) {
      console.error('Erro ao carregar feedbacks:', err);
    }
  }, []);

  React.useEffect(() => {
    carregarFeedbacks();
  }, [carregarFeedbacks]);


  const normalizarDia = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[-\s]/g, '');

  // Obtém o nome do dia atual em português, minúsculo
  const getDiaSemanaAtual = () => {
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    return dias[new Date().getDay()];
  };

  const obterProximoTreino = (diasPlano: any[]) => {
    const nomesDias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const hoje = new Date().getDay();
    for (let i = 1; i <= 7; i++) {
      const idx = (hoje + i) % 7;
      const nomeDia = nomesDias[idx];
      const treino = diasPlano.find(d => normalizarDia(d.identificacao).includes(normalizarDia(nomeDia)));
      if (treino) {
        return { diaNome: treino.identificacao, treino };
      }
    }
    return null;
  };

  // Carrega o plano ativo mais recente do usuário e busca o dia de hoje
  const carregarPlanoAtivo = React.useCallback(async () => {
    setLoadingPlano(true);
    try {
      const planosList = await api.get<any>('/planos?page=1&limit=5');
      const ativo = planosList.itens?.find((p: any) => p.status === 'ativo');
      if (ativo) {
        const planoDetalhado = await api.get<any>(`/planos/${ativo.id}`);
        setPlanoAtivo(planoDetalhado);

        const diaSemanaHoje = getDiaSemanaAtual();
        const treinoHoje = planoDetalhado.dias?.find(
          (d: any) => normalizarDia(d.identificacao).includes(normalizarDia(diaSemanaHoje))
        );
        setDiaTreinoHoje(treinoHoje || null);
      } else {
        setPlanoAtivo(null);
        setDiaTreinoHoje(null);
      }
    } catch (err) {
      addToast('Erro ao carregar dados. Tente novamente.', 'error');
    } finally {
      setLoadingPlano(false);
    }
  }, []);

  React.useEffect(() => {
    carregarPlanoAtivo();
  }, [carregarPlanoAtivo]);

  // Efeito de Debounce no input de texto da biblioteca
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

  // Carrega exercícios do catálogo
  const buscarExercicios = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const qParam = searchParams.get('q') || '';
      let url = `/catalogo/exercicios?page=${page}&limit=12`;
      if (qParam) url += `&q=${encodeURIComponent(qParam)}`;
      if (grupo) url += `&grupo_muscular=${encodeURIComponent(grupo)}`;

      const res = await api.get<PaginatedCat>(url);
      setData(res);
    } catch (err) {
      addToast('Erro ao carregar exercícios. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, grupo, searchParams]);

  React.useEffect(() => {
    buscarExercicios();
  }, [buscarExercicios]);

  // Define abas
  const tabItems = [
    {
      id: 'exercicios_dia',
      label: 'Exercícios do Dia',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          {loadingPlano ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Skeleton variant="text" width={180} height={16} />
              <Skeleton variant="custom" height={160} />
            </div>
          ) : planoAtivo ? (
            diaTreinoHoje && diaTreinoHoje.exercicios && diaTreinoHoje.exercicios.length > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Treino de Hoje</h2>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Foco Muscular: <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{diaTreinoHoje.foco_muscular}</span> · {diaTreinoHoje.identificacao}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/plano/${planoAtivo.id}`)}>
                    Ver Plano Completo
                  </Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {diaTreinoHoje.exercicios.map((ex: any, idx: number) => (
                    <ExerciseRow
                      key={ex.id}
                      ordem={`D${idx + 1}`}
                      nome={ex.nome}
                      series={ex.series}
                      repeticoes={ex.repeticoes}
                      descanso={ex.descanso_segundos}
                      videoUrl={ex.video_url}
                      initialVoted={userFeedbacks[ex.nome] || null}
                      onVoteChange={(val) => setUserFeedbacks(prev => ({ ...prev, [ex.nome]: val }))}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(212, 255, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                  <Sparkles size={24} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Hoje é seu Dia de Descanso!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '400px', lineHeight: '1.6' }}>
                  Nenhum exercício está programado para hoje. Aproveite para descansar, se hidratar e permitir a recuperação muscular adequada.
                </p>
                <Button onClick={() => navigate('/hoje')} variant="secondary">
                  Ir para o Dashboard
                </Button>
                {(() => {
                  const proximo = obterProximoTreino(planoAtivo.dias);
                  if (!proximo) return null;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '0.75rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Próximo Treino: <span style={{ color: 'var(--accent-primary)' }}>{proximo.diaNome}</span>
                        </h3>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Foco: {proximo.treino.foco_muscular}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {proximo.treino.exercicios?.map((ex: any, idx: number) => (
                          <ExerciseRow
                            key={ex.id}
                            ordem={`P${idx + 1}`}
                            nome={ex.nome}
                            series={ex.series}
                            repeticoes={ex.repeticoes}
                            descanso={ex.descanso_segundos}
                            videoUrl={ex.video_url}
                            initialVoted={userFeedbacks[ex.nome] || null}
                            onVoteChange={(val) => setUserFeedbacks(prev => ({ ...prev, [ex.nome]: val }))}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(212, 255, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <Dumbbell size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Nenhum plano de treinos ativo</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '400px', lineHeight: '1.6' }}>
                Você ainda não tem um planejamento de treinos e alimentação gerado pela nossa inteligência artificial.
              </p>
              <Button onClick={() => navigate('/preferencias')} variant="primary">
                Gerar Meu Plano de Treino
              </Button>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'biblioteca',
      label: 'Biblioteca de Exercícios',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Filtros */}
          <div className={styles.filtersBar}>
            <div className={styles.searchWrapper}>
              <Input
                type="text"
                placeholder="Buscar exercício pelo nome..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>

            <div className={styles.selectWrapper}>
              <label htmlFor="grupo-select" className={styles.selectLabel}>Grupo Muscular</label>
              <select
                id="grupo-select"
                className={styles.select}
                value={grupo}
                onChange={(e) => {
                  setGrupo(e.target.value);
                  setPage(1);
                }}
              >
                {GRUPOS_MUSCULARES.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid de Exercícios */}
          {isLoading ? (
            <div className={styles.grid}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} variant="custom" height={160} />
              ))}
            </div>
          ) : data?.itens && data.itens.length > 0 ? (
            <>
              <div className={styles.grid}>
                {data.itens.map((ex) => (
                  <div key={ex.id} className={styles.card}>
                    <div className={styles.cardBody}>
                      <div className={styles.cardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h3 className={styles.cardTitle}>{ex.nome}</h3>
                          {ex.video_url && (
                            <a
                              href={sanitizeUrl(ex.video_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Assistir tutorial em vídeo"
                              style={{ display: 'flex', color: 'var(--accent-primary)', cursor: 'pointer' }}
                            >
                              <Play size={12} fill="currentColor" />
                            </a>
                          )}
                        </div>
                        <Dumbbell size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <Badge variant="info">{ex.grupo_muscular}</Badge>
                      <p className={styles.cardDesc}>{ex.descricao}</p>
                    </div>

                    <div className={styles.cardFooter}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Feedback IA</span>
                      <VoteButtons
                        tipo="exercicio"
                        itemNome={ex.nome}
                        initialVoted={userFeedbacks[ex.nome] || null}
                        onVoteChange={(val) => setUserFeedbacks(prev => ({ ...prev, [ex.nome]: val }))}
                      />
                    </div>
                  </div>
                ))}
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
              Nenhum exercício encontrado com os filtros aplicados.
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Biblioteca & Exercícios</h1>
        <p className={styles.subtitle}>Confira os exercícios recomendados para hoje ou pesquise movimentos no nosso catálogo.</p>
      </div>

      {/* Abas */}
      <Tabs tabs={tabItems} variant="accent" />

    </div>
  );
};
export default ExerciciosPage;