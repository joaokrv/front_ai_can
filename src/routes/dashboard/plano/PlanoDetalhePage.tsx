import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileDown, 
  RefreshCw 
} from 'lucide-react';


import api from '../../../lib/api';
import { ExerciseRow } from '../../../components/plano/ExerciseRow';
import { MealCard } from '../../../components/plano/MealCard';
import { MacroDonut } from '../../../components/charts/MacroDonut';
import { Tabs } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import styles from './PlanoDetalhePage.module.css';
import { useToastStore } from '../../../stores/toastStore';

export const PlanoDetalhePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useToastStore(state => state.addToast);
  const [plano, setPlano] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [isTreinoFinalizado, setIsTreinoFinalizado] = React.useState(false);
  const [userFeedbacks, setUserFeedbacks] = React.useState<Record<string, 'up' | 'down'>>({});

  // Monitora se o treino de hoje já foi concluído para persistência
  React.useEffect(() => {
    if (plano) {
      const hojeStr = new Date().toISOString().split('T')[0];
      const finalizado = localStorage.getItem(`treino_finalizado_${plano.id}_${hojeStr}`);
      setIsTreinoFinalizado(finalizado === 'true');
    }
  }, [plano]);

  // Alterna o estado de finalização do treino e salva localmente
  const handleFinalizarTreino = () => {
    if (!plano) return;
    const hojeStr = new Date().toISOString().split('T')[0];
    const novoEstado = !isTreinoFinalizado;
    setIsTreinoFinalizado(novoEstado);
    if (novoEstado) {
      localStorage.setItem(`treino_finalizado_${plano.id}_${hojeStr}`, 'true');
      addToast('Treino concluído com sucesso! Excelente trabalho! 💪', 'success');
    } else {
      localStorage.removeItem(`treino_finalizado_${plano.id}_${hojeStr}`);
      addToast('Treino marcado como pendente.', 'info');
    }
  };

  const carregarDetalhesPlano = React.useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await api.get<any>(`/planos/${id}`);
      setPlano(data);

      const fbList = await api.get<{ itens: any[] }>(`/feedback/me?limit=150`);
      const fbMap: Record<string, 'up' | 'down'> = {};
      fbList.itens?.forEach(item => {
        fbMap[item.item_nome] = item.gostou ? 'up' : 'down';
      });
      setUserFeedbacks(fbMap);
    } catch (err) {
      addToast('Erro ao carregar os detalhes do plano.', 'error');
      // Em caso de erro (ex: 403 Forbidden), volta ao dashboard
      navigate('/hoje');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, addToast]);

  React.useEffect(() => {
    carregarDetalhesPlano();
  }, [carregarDetalhesPlano]);

  // Função para exportar PDF
  const handleExportPDF = async () => {
    if (!id || !plano) return;
    setIsExporting(true);
    addToast('Iniciando geração do PDF. Por favor, aguarde...', 'info', 3000);
    try {
      // Faz chamada POST para exportação de PDF que retorna os bytes como blob
      const blob = await api.post<Blob>(`/planos/${id}/export`);
      
      // Lógica de download de blob no navegador
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const nomeArquivo = plano.nome.replace(/\s+/g, '_').toLowerCase();
      link.setAttribute('download', `plano_${nomeArquivo}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpeza de recursos
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('PDF gerado e baixado com sucesso!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Erro ao exportar PDF do plano.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Função para regenerar plano
  const handleRegenerar = async () => {
    setIsRegenerating(true);
    addToast('Gerando novo plano com nossa IA...', 'info', 5000);
    try {
      const novoPlano = await api.post<{ plano: { rotina_id: number } }>('/sugestao');
      addToast('Novo plano gerado com sucesso pela IA!', 'success');
      navigate(`/plano/${novoPlano.plano?.rotina_id}`);
    } catch (err: any) {
      addToast(err.message || 'Erro ao regenerar plano de treino.', 'error');
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
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

  if (!plano) return null;

  // Formata data de criação
  const formatarData = (isoStr: string) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  // Calcula soma total de macros para o Donut
  const calcularTotalMacros = () => {
    let calorias = 0;
    let proteina = 0;
    let carboidrato = 0;
    let gordura = 0;

    plano.sugestoes_nutricionais?.forEach((meal: any) => {
      calorias += meal.calorias || 0;
      proteina += meal.proteina_g || 0;
      carboidrato += meal.carboidrato_g || 0;
      gordura += meal.gordura_g || 0;
    });

    return { calorias, proteina, carboidrato, gordura };
  };

  const totals = calcularTotalMacros();

  // Abas do conteúdo
  const tabItems = [
    {
      id: 'completo',
      label: 'Visão Completa',
      content: (
        <div className={styles.grid}>
          {/* Coluna Esquerda: Lista de Dias */}
          <div className={styles.leftColumn}>
            {plano.dias?.map((dia: any) => (
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
              {plano.sugestoes_nutricionais?.map((meal: any) => (
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
      label: 'Apenas Treino',
      content: (
        <div className={styles.leftColumn}>
          {plano.dias?.map((dia: any) => (
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
      label: 'Apenas Nutrição',
      content: (
        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <div className={styles.dayHeader}>
              <h4 className={styles.dayTitle}>Sugestões de Alimentação</h4>
            </div>
            {plano.sugestoes_nutricionais?.map((meal: any) => (
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
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header Actions */}
      <div className={styles.headerActions}>
        <div className={styles.breadcrumb}>
          <Link to="/hoje" className={styles.breadcrumbLink}>Hoje</Link> / Seu plano · {formatarData(plano.created_at)}
        </div>
        
        <div className={styles.btnGroup}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRegenerar}
            isLoading={isRegenerating}
            leftIcon={<RefreshCw size={12} />}
          >
            Regenerar
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPDF}
            isLoading={isExporting}
            leftIcon={<FileDown size={12} />}
          >
            Exportar PDF
          </Button>

          {isTreinoFinalizado ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleFinalizarTreino}
            >
              ✓ Treino Finalizado
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleFinalizarTreino}
            >
              Finalizar Treino
            </Button>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroHeader}>
          <h2 className={styles.heroTitle}>{plano.nome}</h2>
          <div className={styles.badgeGroup}>
            <Badge variant={plano.status === 'ativo' ? 'active' : 'default'}>
              Plano #{plano.id} · {plano.status}
            </Badge>
          </div>
        </div>
        
        {plano.explicacao_ia && (
          <div className={styles.explanation}>
            <p><strong>Por que este planejamento?</strong></p>
            <p style={{ marginTop: '0.25rem' }}>{plano.explicacao_ia}</p>
          </div>
        )}
      </div>

      {/* Abas Principais */}
      <Tabs tabs={tabItems} variant="accent" />



    </div>
  );
};
export default PlanoDetalhePage;
