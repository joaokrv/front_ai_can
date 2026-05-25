import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './LegalPage.module.css';

export const PrivacidadePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Política de Privacidade</h1>
      <span className={styles.lastUpdated}>Última atualização: 24 de Maio de 2026</span>

      <div className={styles.content}>
        <h2>1. Introdução</h2>
        <p>
          Sua privacidade é importante para nós. Esta Política de Privacidade explica como o AICan
          coleta, utiliza, compartilha e protege suas informações pessoais ao usar nossa
          Plataforma.
        </p>

        <h2>2. Dados Coletados</h2>
        <p>
          Coletamos as informações que você nos fornece diretamente durante o registro e uso da
          Plataforma, incluindo:
        </p>
        <ul>
          <li><strong>Dados de Identificação:</strong> Nome, e-mail e senha.</li>
          <li><strong>Dados Físicos e de Saúde:</strong> Idade, peso, altura, biotipo, histórico de lesões, dieta e níveis de atividade física (fornecidos voluntariamente no Onboarding).</li>
        </ul>

        <h2>3. Uso das Informações</h2>
        <p>
          Utilizamos suas informações exclusivamente para:
        </p>
        <ul>
          <li>Gerar planos de treino e sugestões de refeições usando nossos algoritmos de Inteligência Artificial.</li>
          <li>Autenticar seu acesso e garantir a segurança de sua conta.</li>
          <li>Melhorar e personalizar sua experiência na Plataforma.</li>
        </ul>

        <h2>4. Compartilhamento de Dados</h2>
        <p>
          Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins comerciais. 
          Alguns dados não identificáveis poderão ser processados por APIs de Inteligência Artificial parceiras estritamente para a geração dos planos de treino e dietas, sob garantias rigorosas de privacidade.
        </p>

        <h2>5. Segurança dos Dados</h2>
        <p>
          Implementamos medidas técnicas e organizacionais de segurança para proteger seus dados contra acessos não autorizados, perdas ou alterações. No entanto, nenhum método de transmissão na internet é 100% seguro.
        </p>

        <h2>6. Seus Direitos (LGPD)</h2>
        <p>
          De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de acessar, corrigir, anonimizar ou excluir seus dados pessoais de nossa base de dados a qualquer momento.
        </p>
      </div>

      <button onClick={() => navigate(-1)} className={styles.backLink} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit'}}>
        <ArrowLeft size={16} />
        Voltar
      </button>
    </div>
  );
};

export default PrivacidadePage;
