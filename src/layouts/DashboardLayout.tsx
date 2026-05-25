import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { SearchPalette } from '../components/layout/SearchPalette';
import api from '../lib/api';
import styles from './DashboardLayout.module.css';

export const DashboardLayout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [user, setUser] = React.useState<{ nome: string; onboarding_completo: boolean } | null>(null);
  const [activePlanoId, setActivePlanoId] = React.useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);

  // Busca inicial rápida dos dados do usuário para verificar autenticação
  React.useEffect(() => {
    const fetchUser = async () => {
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.get<any>('/auth/me');
        setUser(data);

        // Se autenticado, busca o plano ativo mais recente
        const planosData = await api.get<any>('/planos?page=1&limit=5');
        if (planosData.itens && planosData.itens.length > 0) {
          const ativo = planosData.itens.find((p: any) => p.status === 'ativo');
          if (ativo) {
            setActivePlanoId(ativo.id);
          }
        }
      } catch (err) {
        // Se falhar de verdade (refresh expirado também), desloga
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Se estiver carregando, mostra skeleton ou loading
  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }} />
    );
  }

  // Guard de autenticação básica
  const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Guard de onboarding (se não preencheu, redireciona)
  if (user && !user.onboarding_completo) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className={styles.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} />
      
      <div className={styles.mainWrapper}>
        <Header 
          onSearchOpen={() => setIsSearchOpen(true)} 
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          userName={user?.nome} 
          activePlanoId={activePlanoId}
        />
        
        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>

      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
