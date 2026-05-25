import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Dumbbell, 
  Utensils, 
  TrendingUp, 
  ArrowRight 
} from 'lucide-react';


import api from '../../lib/api';
import { useToastStore } from '../../stores/toastStore';
import { TrainingCard } from '../../components/plano/TrainingCard';
import { MealCard } from '../../components/plano/MealCard';
import { StatCard } from '../../components/plano/StatCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import styles from './HojePage.module.css';

interface UserInfo {
  nome: string;
}export const HojePage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore(state => state.addToast);
  const [user, setUser] = React.useState<UserInfo | null>(null);
  const [planoAtivo, setPlanoAtivo] = React.useState<any>(null);
  const [diaTreinoHoje, setDiaTreinoHoje] = React.useState<any>(null);
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [totalPlanos, setTotalPlanos] = React.useState(0);
  const [feedbackTreinoAtual, setFeedbackTreinoAtual] = React.useState<'up' | 'down' | null>(null);

  // Obtém o nome do dia atual em português, minúsculo
  const getDiaSemanaAtual = () => {
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    return dias[new Date().getDay()];
  };

  const getDiaSemanaExtenso = () => {
    const opcoes: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date().toLocaleDateString('pt-BR', opcoes).toUpperCase();
  };

  const carregarDadosDashboard = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await api.get<UserInfo>('/auth/me');
      setUser(userData);

      const planosList = await api.get<any>('/planos?page=1&limit=5');
      setTotalPlanos(planosList.total || 0);

      const ativo = planosList.itens?.find((p: any) => p.status === 'ativo');

      if (ativo) {
        // Busca detalhes completos do plano ativo
        const planoDetalhado = await api.get<any>(`/planos/${ativo.id}`);
        setPlanoAtivo(planoDetalhado);

        // Identifica se tem treino programado para hoje
        const diaSemanaHoje = getDiaSemanaAtual();
        const treinoHoje = planoDetalhado.dias?.find(
          (d: any) => d.identificacao.toLowerCase() === diaSemanaHoje
        );

        if (treinoHoje) {
          setDiaTreinoHoje(treinoHoje);
        } else {
          // Se hoje for descanso, pega o primeiro dia cadastrado do plano como referência visual
          setDiaTreinoHoje(planoDetalhado.dias?.[0] || null);
        }

        // Busca feedback existente do usuário para o treino atual
        const focoMuscular = treinoHoje?.foco_muscular || planoDetalhado.dias?.[0]?.foco_muscular;
        if (focoMuscular) {
          const itemNome = `Treino ${focoMuscular} - Plano ${ativo.id}`;
          const fbList = await api.get<{ itens: Array<{ item_nome: string; gostou: boolean }> }>('/feedback/me?tipo=exercicio&limit=100');
          const existing = fbList.itens?.find((f: any) => f.item_nome === itemNome);
          if (existing) {
            setFeedbackTreinoAtual(existing.gostou ? 'up' : 'down');
          } else {
            setFeedbackTreinoAtual(null);
          }
        }
      } else {
        setPlanoAtivo(null);
        setDiaTreinoHoje(null);
      }
    } catch (err) {
      addToast('Erro ao carregar dados do dashboard.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    carregarDadosDashboard();
  }, [carregarDadosDashboard]);

  // Função para regenerar o plano ativo
  const handleRegenerarPlano = async () => {
    setIsRegenerating(true);
    addToast('Gerando novo plano com nossa IA...', 'info', 5000);
    try {
      const novoPlano = await api.post<{ plano: { rotina_id: number } }>('/sugestao');
      addToast('Novo plano gerado com sucesso!', 'success');
      navigate(`/plano/${novoPlano.plano?.rotina_id}`);
    } catch (err: any) {
      addToast(err.message || 'Erro ao gerar novo plano. Tente novamente.', 'error');
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className={styles.hero}>
          <Skeleton variant="text" width={240} height={20} />
          <Skeleton variant="title" width={320} height={36} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <Skeleton variant="custom" height={280} />
          <Skeleton variant="custom" height={280} />
        </div>
      </div>
    );
  }

  const hojeSemana = getDiaSemanaAtual();
  const diaSemanaHojeEhDeTreino = planoAtivo?.dias?.some(
    (d: any) => d.identificacao.toLowerCase() === hojeSemana
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Seção Hero */}
      <div className={styles.hero}>
        <span className={styles.date}>{getDiaSemanaExtenso()}</span>
        <h1 className={styles.heroTitle}>
          Bora, {user?.nome.split(' ')[0]}.{' '}
          {planoAtivo ? (
            diaSemanaHojeEhDeTreino ? (
              <>É dia de <span className={styles.heroTitleAccent}>{diaTreinoHoje?.foco_muscular}</span>.</>
            ) : (
              <>Hoje é seu dia de <span className={styles.heroTitleAccent}>Descanso</span>.</>
            )
          ) : (
            <>Crie seu <span className={styles.heroTitleAccent}>Primeiro Plano</span>!</>
          )}
        </h1>
      </div>

      {/* Grade de Estatísticas (KPIs Rápidos no Topo) */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Planos Gerados"
          value={totalPlanos}
          icon={<TrendingUp size={16} />}
          subtext="Histórico acumulado"
        />
        <StatCard
          label="Sessão Média"
          value={planoAtivo ? `${planoAtivo.duracao_sessao || 60}m` : '—'}
          icon={<Dumbbell size={16} />}
          subtext={planoAtivo ? `Foco em ${planoAtivo.local_treino === 'academia' ? 'Academia' : 'Casa'}` : 'Nenhum plano'}
        />
        <StatCard
          label="Nutrição Diária"
          value={planoAtivo?.sugestoes_nutricionais?.length || 0}
          icon={<Utensils size={16} />}
          subtext="Refeições cadastradas"
        />
      </div>

      {planoAtivo ? (
        <>
          {/* Grid de Conteúdo (Treino do dia + Refeições) */}
          <div className={styles.mainGrid}>
            <div className={styles.leftColumn}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Treino Programado</h2>
              </div>
              
              <TrainingCard
                planoId={planoAtivo.id}
                nomePlano={planoAtivo.nome}
                focoMuscular={diaTreinoHoje?.foco_muscular}
                numExercicios={diaTreinoHoje?.exercicios?.length || 0}
                duracao={planoAtivo.duracao_sessao || 60}
                nivelExperiencia={planoAtivo.nivel_experiencia || 'intermediario'}
                onRegenerar={handleRegenerarPlano}
                isRegenerating={isRegenerating}
                initialVoted={feedbackTreinoAtual}
              />
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Refeições do Dia</h2>
              </div>

              {planoAtivo.sugestoes_nutricionais && planoAtivo.sugestoes_nutricionais.length > 0 ? (
                <div className={styles.mealsCategoryGrid}>
                  {/* Coluna Pré-Treino */}
                  <div className={styles.mealCategoryColumn}>
                    <h3 className={styles.categoryTitle}>Pré-Treino</h3>
                    {planoAtivo.sugestoes_nutricionais
                      .filter((meal: any) => meal.tipo === 'pre_treino')
                      .map((meal: any) => (
                        <MealCard
                          key={meal.id}
                          nome={meal.nome}
                          tipo={meal.tipo}
                          ingredientes={meal.ingredientes || []}
                          calorias={meal.calorias}
                          proteina={meal.proteina_g}
                          carboidrato={meal.carboidrato_g}
                          gordura={meal.gordura_g}
                          linkReceita={meal.link_receita}
                        />
                      ))}
                    {planoAtivo.sugestoes_nutricionais.filter((meal: any) => meal.tipo === 'pre_treino').length === 0 && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sem pré-treino hoje.</div>
                    )}
                  </div>

                  {/* Coluna Pós-Treino */}
                  <div className={styles.mealCategoryColumn}>
                    <h3 className={styles.categoryTitle}>Pós-Treino</h3>
                    {planoAtivo.sugestoes_nutricionais
                      .filter((meal: any) => meal.tipo === 'pos_treino')
                      .map((meal: any) => (
                        <MealCard
                          key={meal.id}
                          nome={meal.nome}
                          tipo={meal.tipo}
                          ingredientes={meal.ingredientes || []}
                          calorias={meal.calorias}
                          proteina={meal.proteina_g}
                          carboidrato={meal.carboidrato_g}
                          gordura={meal.gordura_g}
                          linkReceita={meal.link_receita}
                        />
                      ))}
                    {planoAtivo.sugestoes_nutricionais.filter((meal: any) => meal.tipo === 'pos_treino').length === 0 && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sem pós-treino hoje.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sem refeições cadastradas.</div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.noPlanoCard}>
          <Sparkles size={48} style={{ color: 'var(--accent-primary)' }} />
          <h2 className={styles.noPlanoTitle}>Você ainda não possui um plano de treino ativo!</h2>
          <p className={styles.noPlanoText}>
            Insira suas preferências físicas, restrições alimentares e rotina de tempo para que nosso agente de IA gere o plano ideal para suas metas.
          </p>
          <Button 
            onClick={() => navigate('/onboarding')} 
            variant="primary" 
            rightIcon={<ArrowRight size={16} />}
          >
            Gerar Meu Primeiro Plano
          </Button>
        </div>
      )}

    </div>
  );
};
export default HojePage;
