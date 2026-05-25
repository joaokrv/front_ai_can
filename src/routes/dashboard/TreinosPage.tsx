import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Sparkles, RefreshCw, FileDown } from 'lucide-react';

import api from '../../lib/api';
import { useToastStore } from '../../stores/toastStore';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ExerciseRow } from '../../components/plano/ExerciseRow';
import { MealCard } from '../../components/plano/MealCard';
import { MacroDonut } from '../../components/charts/MacroDonut';
import { Tabs } from '../../components/ui/Tabs';
import styles from './TreinosPage.module.css';

export const TreinosPage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore(state => state.addToast);
  const [planoAtivo, setPlanoAtivo] = React.useState<any>(null);
  const [loadingPlano, setLoadingPlano] = React.useState(true);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [userFeedbacks, setUserFeedbacks] = React.useState<Record<string, 'up' | 'down' | null>>({});

  const handleExportPDF = async () => {
    if (!planoAtivo) return;
    setIsExporting(true);
    try {
      const blob = await api.post<Blob>(`/planos/${planoAtivo.id}/export`);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const nomeArquivo = planoAtivo.nome.replace(/\s+/g, '_').toLowerCase();
      link.setAttribute('download', `plano_${nomeArquivo}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      addToast('Erro ao exportar o plano. Tente novamente.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Carrega o plano ativo mais recente do usuário
  const carregarPlanoAtivo = React.useCallback(async () => {
    setLoadingPlano(true);
    try {
      const planosList = await api.get<any>('/planos?page=1&limit=5');
      const ativo = planosList.itens?.find((p: any) => p.status === 'ativo');
      if (ativo) {
        const planoDetalhado = await api.get<any>(`/planos/${ativo.id}`);
        setPlanoAtivo(planoDetalhado);
      } else {
        setPlanoAtivo(null);
      }

      // Carrega feedbacks do usuário para refeições e exercícios
      const fbList = await api.get<{ itens: any[] }>('/feedback/me?limit=150');
      const fbMap: Record<string, 'up' | 'down'> = {};
      fbList.itens?.forEach(item => {
        fbMap[item.item_nome] = item.gostou ? 'up' : 'down';
      });
      setUserFeedbacks(fbMap);
    } catch (err) {
      addToast('Erro ao carregar dados. Tente novamente.', 'error');
    } finally {
      setLoadingPlano(false);
    }
  }, []);

  React.useEffect(() => {
    carregarPlanoAtivo();
  }, [carregarPlanoAtivo]);

  // Função para regenerar plano
  const handleRegenerar = async () => {
    setIsRegenerating(true);
    try {
      const novoPlano = await api.post<{ id: number }>('/sugestao');
      navigate(`/plano/${novoPlano.id}`);
    } catch (err) {
      addToast('Erro ao regenerar o plano. Tente novamente.', 'error');
      setIsRegenerating(false);
    }
  };

  if (loadingPlano) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Skeleton variant="text" width={180} height={16} />
        <Skeleton variant="custom" height={160} />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <Skeleton variant="custom" height={400} />
          <Skeleton variant="custom" height={400} />
        </div>
      </div>
    );
  }

  // Calcula soma total de macros para o Donut
  const calcularTotalMacros = () => {
    let calorias = 0;
    let proteina = 0;
    let carboidrato = 0;
    let gordura = 0;

    if (planoAtivo && planoAtivo.sugestoes_nutricionais) {
      planoAtivo.sugestoes_nutricionais.forEach((meal: any) => {
        calorias += meal.calorias || 0;
        proteina += meal.proteina_g || 0;
        carboidrato += meal.carboidrato_g || 0;
        gordura += meal.gordura_g || 0;
      });
    }

    return { calorias, proteina, carboidrato, gordura };
  };

  const totals = calcularTotalMacros();

  // Define as abas do plano ativo
  const tabItems = planoAtivo ? [
    {
      id: 'completo',
      label: 'Plano Completo',
      content: (
        <div className={styles.grid}>
          {/* Coluna Esquerda: Lista de Dias */}
          <div className={styles.leftColumn}>
            {planoAtivo.dias?.map((dia: any) => (
              <div key={dia.id} className={styles.dayBlock}>
                <div className={styles.dayHeader}>
                  <h4 className={styles.dayTitle}>{dia.identificacao}</h4>
                  <span className={styles.dayFoco}>Foco: {dia.foco_muscular}</span>
                </div>
                
                <div className={styles.exercisesList}>
                  {dia.exercicios?.map((ex: any, idx: number) => (
                    <ExerciseRow
                      key={ex.id}
                      ordem={`${dia.identificacao[0].toUpperCase()}${idx + 1}`}
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
            ))}
          </div>

          {/* Coluna Direita: Nutrição */}
          <div className={styles.rightColumn}>
            <MacroDonut
              calorias={totals.calorias}
              proteina={totals.proteina}
              carboidrato={totals.carboidrato}
              gordura={totals.gordura}
            />

            <div className={styles.dayBlock}>
              <div className={styles.dayHeader}>
                <h4 className={styles.dayTitle}>Plano Nutricional</h4>
              </div>
              {planoAtivo.sugestoes_nutricionais?.map((meal: any) => (
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
                  initialVoted={userFeedbacks[meal.nome] || null}
                  onVoteChange={(val) => setUserFeedbacks(prev => ({ ...prev, [meal.nome]: val }))}
                />
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'treino',
      label: 'Só Exercícios',
      content: (
        <div className={styles.leftColumn}>
          {planoAtivo.dias?.map((dia: any) => (
            <div key={dia.id} className={styles.dayBlock}>
              <div className={styles.dayHeader}>
                <h4 className={styles.dayTitle}>{dia.identificacao}</h4>
                <span className={styles.dayFoco}>Foco: {dia.foco_muscular}</span>
              </div>
              
              <div className={styles.exercisesList}>
                {dia.exercicios?.map((ex: any, idx: number) => (
                  <ExerciseRow
                    key={ex.id}
                    ordem={`${dia.identificacao[0].toUpperCase()}${idx + 1}`}
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
          ))}
        </div>
      )
    },
    {
      id: 'nutricao',
      label: 'Só Refeições',
      content: (
        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <div className={styles.dayHeader}>
              <h4 className={styles.dayTitle}>Distribuição Nutricional</h4>
            </div>
            {planoAtivo.sugestoes_nutricionais?.map((meal: any) => (
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
                initialVoted={userFeedbacks[meal.nome] || null}
                onVoteChange={(val) => setUserFeedbacks(prev => ({ ...prev, [meal.nome]: val }))}
              />
            ))}
          </div>
          <div className={styles.rightColumn} style={{ justifyContent: 'center' }}>
            <MacroDonut
              calorias={totals.calorias}
              proteina={totals.proteina}
              carboidrato={totals.carboidrato}
              gordura={totals.gordura}
            />
          </div>
        </div>
      )
    }
  ] : [];

  return (
    <div className={styles.container}>
      {planoAtivo ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: '1rem' }}>
            <div className={styles.header}>
              <h1 className={styles.title}>{planoAtivo.nome}</h1>
              <p className={styles.subtitle}>
                Visualize seu plano ativo completo de treinos e alimentação gerado pela IA.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportPDF}
                isLoading={isExporting}
                leftIcon={<FileDown size={12} />}
              >
                Exportar PDF
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleRegenerar}
                isLoading={isRegenerating}
                leftIcon={<RefreshCw size={12} />}
              >
                Regenerar Plano
              </Button>
              <Badge variant="active">
                Plano #{planoAtivo.id} · Ativo
              </Badge>
            </div>
          </div>

          <Tabs tabs={tabItems} variant="accent" />
        </>
      ) : (
        <div className={styles.noPlanoCard}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(212, 255, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
            <ClipboardList size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Nenhum plano de treinos ativo</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '400px', lineHeight: '1.6' }}>
            Você ainda não tem um planejamento de treinos e alimentação gerado pela nossa inteligência artificial.
          </p>
          <Button onClick={() => navigate('/preferencias')} variant="primary" rightIcon={<Sparkles size={14} />}>
            Gerar Meu Plano
          </Button>
        </div>
      )}
    </div>
  );
};
export default TreinosPage;