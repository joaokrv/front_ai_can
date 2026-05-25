import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: '2rem',
      textAlign: 'center',
      gap: '1.5rem'
    }}>
      <HelpCircle size={64} style={{ color: 'var(--text-muted)', animation: 'pulseLogo 2s infinite' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Página não encontrada</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '360px', lineHeight: '1.6' }}>
          O endereço que você tentou acessar não existe ou foi removido de nossa plataforma.
        </p>
      </div>

      <Button
        variant="primary"
        onClick={() => navigate('/hoje')}
        leftIcon={<ArrowLeft size={16} />}
        style={{ marginTop: '1rem' }}
      >
        Voltar ao Dashboard
      </Button>
    </div>
  );
};
export default NotFoundPage;
