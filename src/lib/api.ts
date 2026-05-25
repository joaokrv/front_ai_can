const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api/v1';


/** Aceita apenas URLs http/https para evitar javascript:/data: URI injection */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return trimmed;
  return '#';
}

interface RequestOptions extends RequestInit {
  bodyData?: any;
}

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private getAccessToken(): string | null {
    return sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
  }

  private setTokens(access: string, refresh: string, remember: boolean) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('accessToken', access);
    storage.setItem('refreshToken', refresh);
    if (remember) localStorage.setItem('rememberMe', '1');
  }

  private clearTokens() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${BASE_URL}${path}`;
    
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const token = this.getAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    let body = options.body;
    if (options.bodyData !== undefined) {
      body = JSON.stringify(options.bodyData);
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      body,
    };

    try {
      const response = await fetch(url, fetchOptions);

      if ((response.status === 401 || response.status === 403) && path !== '/auth/login' && path !== '/auth/refresh') {
        return this.handleUnauthorized<T>(path, options);
      }

      if (!response.ok) {
        let errorMessage = 'Ocorreu um erro no servidor';
        try {
          const errorData = await response.json();
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((err: any) => {
                const field = err.loc ? `${err.loc.join('.')}: ` : '';
                return `${field}${err.msg}`;
              })
              .join('; ');
          } else {
            errorMessage = errorData.detail || errorMessage;
          }
        } catch (e) {
          // Ignora falha de parse
        }
        throw new Error(errorMessage);
      }

      if (response.status === 204) {
        return {} as T;
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/pdf')) {
        const blob = await response.blob();
        return blob as unknown as T;
      }

      return await response.json() as T;
    } catch (error) {
      throw error;
    }
  }

  private async handleUnauthorized<T>(path: string, options: RequestOptions): Promise<T> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      window.dispatchEvent(new Event('auth-expired'));
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (this.isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        this.subscribeTokenRefresh((newAccessToken) => {
          const headers = new Headers(options.headers || {});
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          this.request<T>(path, { ...options, headers })
            .then(resolve)
            .catch(reject);
        });
      });
    }

    this.isRefreshing = true;

    try {
      // Chama rotação de refresh token no backend
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Refresh falhou');
      }

      const newTokens = await refreshResponse.json();
      const remember = !!localStorage.getItem('rememberMe');
      
      this.setTokens(newTokens.access_token, newTokens.refresh_token, remember);
      this.onRefreshed(newTokens.access_token);
      this.isRefreshing = false;

      const headers = new Headers(options.headers || {});
      headers.set('Authorization', `Bearer ${newTokens.access_token}`);
      return this.request<T>(path, { ...options, headers });
    } catch (err) {
      this.isRefreshing = false;
      this.clearTokens();
      window.dispatchEvent(new Event('auth-expired'));
      throw new Error('Sessão expirada. Faça login novamente.');
    }
  }

  get<T>(path: string, options: Omit<RequestOptions, 'method' | 'body' | 'bodyData'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, bodyData?: any, options: Omit<RequestOptions, 'method' | 'body' | 'bodyData'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', bodyData });
  }

  put<T>(path: string, bodyData?: any, options: Omit<RequestOptions, 'method' | 'body' | 'bodyData'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', bodyData });
  }

  delete<T>(path: string, options: Omit<RequestOptions, 'method' | 'body' | 'bodyData'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;


