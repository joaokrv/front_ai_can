import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './LegalPage.module.css';

export const TermosPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Termos de Uso</h1>
      <span className={styles.lastUpdated}>Última atualização: 24 de Maio de 2026</span>

      <div className={styles.content}>
        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e utilizar o AICan ("Plataforma"), você concorda em cumprir e ficar vinculado
          aos seguintes Termos de Uso. Se você não concordar com qualquer parte destes termos, não
          deverá utilizar nossos serviços.
        </p>

        <h2>2. Descrição do Serviço</h2>
        <p>
          O AICan é uma plataforma que utiliza inteligência artificial para gerar sugestões de
          treinos e refeições (pré e pós-treino) personalizadas com base nas informações
          fornecidas pelo usuário (peso, altura, objetivos, restrições, etc.).
        </p>

        <h2>3. Natureza das Sugestões e Isenção de Responsabilidade</h2>
        <p>
          <strong>Importante:</strong> As sugestões de treino e alimentação fornecidas pela
          Plataforma são geradas por algoritmos de Inteligência Artificial e têm caráter
          estritamente informativo. Elas <strong>não substituem</strong> o aconselhamento,
          diagnóstico ou tratamento de profissionais de saúde qualificados (como médicos,
          nutricionistas e educadores físicos). Sempre consulte um profissional antes de iniciar
          qualquer nova dieta ou rotina de exercícios.
        </p>

        <h2>4. Contas de Usuário</h2>
        <p>
          Para utilizar nossos serviços, você deve criar uma conta. Você é responsável por manter
          a confidencialidade das credenciais de sua conta e por todas as atividades que ocorram
          sob ela.
        </p>

        <h2>5. Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo, design, código, textos, gráficos e interfaces da Plataforma são de
          propriedade exclusiva do AICan e protegidos por leis de direitos autorais e propriedade
          intelectual.
        </p>

        <h2>6. Modificações nos Termos</h2>
        <p>
          Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos os
          usuários sobre mudanças significativas através da Plataforma ou via e-mail. O uso
          contínuo após tais modificações constitui aceitação dos novos termos.
        </p>
      </div>

      <button onClick={() => navigate(-1)} className={styles.backLink} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit'}}>
        <ArrowLeft size={16} />
        Voltar
      </button>
    </div>
  );
};

export default TermosPage;
