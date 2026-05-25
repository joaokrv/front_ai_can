import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Páginas de Autenticação
import { LoginPage } from './routes/auth/LoginPage';
import { RegistroPage } from './routes/auth/RegistroPage';

// Páginas de Onboarding
import { OnboardingPage } from './routes/onboarding/OnboardingPage';
import { GeracaoPage } from './routes/onboarding/GeracaoPage';

// Páginas do Dashboard
import { HojePage } from './routes/dashboard/HojePage';
import { TreinosPage } from './routes/dashboard/TreinosPage';
import { RefeicoesPage } from './routes/dashboard/RefeicoesPage';
import { AfinidadePage } from './routes/dashboard/AfinidadePage';
import { HistoricoPage } from './routes/dashboard/HistoricoPage';
import { PerfilPage } from './routes/dashboard/PerfilPage';
import { PlanoDetalhePage } from './routes/dashboard/plano/PlanoDetalhePage';
import { PreferenciasPage } from './routes/dashboard/PreferenciasPage';
import { ExerciciosPage } from './routes/dashboard/ExerciciosPage';

// Páginas Legais
import { TermosPage } from './routes/legal/TermosPage';
import { PrivacidadePage } from './routes/legal/PrivacidadePage';

// Página 404
import { NotFoundPage } from './routes/NotFoundPage';

// Componente global de notificações
import { ToastContainer } from './components/ui/Toast';

export const App: React.FC = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Redirecionamento da raiz */}
          <Route path="/" element={<Navigate to="/hoje" replace />} />

          {/* Rotas Públicas (Autenticação Split-screen) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
          </Route>

          {/* Rotas de Onboarding (Layout Próprio) */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/onboarding/geracao" element={<GeracaoPage />} />

          {/* Rotas Protegidas (Sidebar + Header) */}
          <Route element={<DashboardLayout />}>
            <Route path="/hoje" element={<HojePage />} />
            <Route path="/treinos" element={<TreinosPage />} />
            <Route path="/refeicoes" element={<RefeicoesPage />} />
            <Route path="/afinidade" element={<AfinidadePage />} />
            <Route path="/historico" element={<HistoricoPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/plano/:id" element={<PlanoDetalhePage />} />
            <Route path="/preferencias" element={<PreferenciasPage />} />
            <Route path="/exercicios" element={<ExerciciosPage />} />
          </Route>

          {/* Rotas Legais */}
          <Route path="/termos-de-uso" element={<TermosPage />} />
          <Route path="/politica-de-privacidade" element={<PrivacidadePage />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  );
};

export default App;
