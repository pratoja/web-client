import axios from 'axios';
import { API_URL } from './env';

export const STORAGE_KEYS = {
  accessToken: '@pratoja-loja:accessToken',
  refreshToken: '@pratoja-loja:refreshToken',
  user: '@pratoja-loja:user',
};

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

function resolveQueue(token: string | null, error?: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
}

let onSessionExpired: (() => void) | null = null;
export function setOnSessionExpired(handler: () => void) {
  onSessionExpired = handler;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    if (status !== 401 || isAuthRoute || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
      if (!refreshToken) throw new Error('Sem refresh token salvo');

      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);

      resolveQueue(data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(null, refreshError);
      localStorage.removeItem(STORAGE_KEYS.accessToken);
      localStorage.removeItem(STORAGE_KEYS.refreshToken);
      localStorage.removeItem(STORAGE_KEYS.user);
      onSessionExpired?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function extractApiErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.') {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: { message?: string } } | undefined;
    if (data?.error?.message) return data.error.message;
    if (error.message === 'Network Error') {
      return 'Não foi possível conectar ao servidor. Tente novamente em instantes.';
    }
  }
  return fallback;
}
