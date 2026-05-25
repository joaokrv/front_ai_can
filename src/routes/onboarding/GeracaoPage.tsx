import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

import api from '../../lib/api';
import { Stepper } from '../../components/forms/Stepper';
import { Button } from '../../components/ui/Button';
import styles from './GeracaoPage.module.css';
import { useToastStore } from '../../stores/toastStore';

const LOADING_MESSAGES = [
  'Analisando seus dados físicos e metabolismo...',
  'Filtrando o catálogo com base em suas restrições alimentares...',
  'Montando divisões de treinos adaptadas ao seu local de preferência...',
  'Calculando macronutrientes para o pré e o pós-treino...',
  'Estruturando volumes de séries e repetições por exercício...',
  'Ajustando intensidades e tempos de descanso...',
  'Consultando o Gemini para otimizar a harmonia do plano...',
  'Finalizando os detalhes do seu plano exclusivo...'
];

export const GeracaoPage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore(state => state.addToast);
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(true);

  // Função para chamar a geração do plano no backend
  const dispararGeracaoPlano = React.useCallback(async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Dispara geração do plano de treino + refeições no backend
      const resposta = await api.post<{ plano: { rotina_id: number } }>('/sugestao');

      addToast('Plano gerado com sucesso pela nossa IA!', 'success');
      navigate(`/plano/${resposta.plano?.rotina_id}`);
    } catch (err: any) {
      const finalError = err.message || 'Não foi possível contatar o motor de Inteligência Artificial. Verifique sua conexão ou tente novamente.';
      setErrorMsg(finalError);
      addToast(finalError, 'error');
      setIsGenerating(false);
    }
  }, [navigate, addToast]);

  React.useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  React.useEffect(() => {
    dispararGeracaoPlano();
  }, [dispararGeracaoPlano]);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {isGenerating ? (
          <>
            <Stepper currentStep={3} steps={['Conta', 'Preferências', 'Geração IA']} />
            
            <div className={styles.loadingArea}>
              <div className={styles.spinnerGlow} />
              <div className={styles.logoIcon}>
                AICan<span className={styles.logoAccent}>✦</span>
              </div>
            </div>

            <div className={styles.statusArea}>
              <h2 className={styles.title}>Criando seu planejamento</h2>
              <p className={styles.message} key={currentMessageIndex}>
                {LOADING_MESSAGES[currentMessageIndex]}
              </p>
            </div>
          </>
        ) : (
          <div className={styles.errorCard}>
            <h2 className={styles.errorTitle}>Falha na Geração com IA</h2>
            <p className={styles.errorText}>
              {errorMsg}
            </p>
            
            <div className={styles.errorActions}>
              <Button 
                onClick={dispararGeracaoPlano} 
                variant="primary" 
                leftIcon={<RefreshCw size={14} />}
              >
                Tentar Novamente
              </Button>
              <Button 
                onClick={() => navigate('/hoje')} 
                variant="secondary"
                leftIcon={<LayoutDashboard size={14} />}
              >
                Pular para Dashboard
              </Button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
export default GeracaoPage;
