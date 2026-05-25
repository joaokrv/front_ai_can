import { create } from 'zustand';
import api from '../lib/api';

export interface UserProfile {
  id: number;
  nome: string;
  email: string;
  idade?: number;
  altura?: number;
  peso?: number;
  sexo?: 'M' | 'F' | 'O' | 'N';
  objetivo?: 'perder' | 'ganhar' | 'hipertrofia' | 'definicao';
  local_treino?: 'academia' | 'casa' | 'arLivre';
  dias_disponiveis?: string[];
  duracao_sessao?: number;
  restricoes_alimentares?: string[];
  lesoes_cuidados?: string;
  nivel_experiencia?: 'iniciante' | 'intermediario' | 'avancado';
  onboarding_completo: boolean;
  aceite_termos_at: string;
  aceite_termos_versao: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<UserProfile>;
  register: (nome: string, email: string, password: string, aceito: boolean) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<UserProfile>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Escuta expiração de token para forçar deslogue limpo
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-expired', () => {
      set({ user: null, isAuthenticated: false, isLoading: false });
    });
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (email, password, remember) => {
      set({ isLoading: true });
      try {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const data = await api.request<{ access_token: string; refresh_token: string }>(
          '/auth/login',
          {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('accessToken', data.access_token);
        storage.setItem('refreshToken', data.refresh_token);

        const userProfile = await get().fetchMe();
        set({ user: userProfile, isAuthenticated: true });
        return userProfile;
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    register: async (nome, email, password, aceito) => {
      set({ isLoading: true });
      try {
        await api.post('/auth/register', {
          nome,
          email,
          password,
          aceite_termos: aceito
        });
      } finally {
        set({ isLoading: false });
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
        if (token) {
          await api.post('/auth/logout');
        }
      } catch (err) {
        // Silencia erro no logout
      } finally {
        // Limpa storage independentemente do sucesso do request
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    },

    fetchMe: async () => {
      try {
        const profile = await api.get<UserProfile>('/auth/me');
        set({ user: profile, isAuthenticated: true, isLoading: false });
        return profile;
      } catch (err) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        throw err;
      }
    },

    checkAuth: async () => {
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        await get().fetchMe();
      } catch (err) {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  };
});
