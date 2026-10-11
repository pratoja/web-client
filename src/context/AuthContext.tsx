import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, STORAGE_KEYS, setOnSessionExpired } from '../config/api';
import { connectSocket, disconnectSocket } from '../config/socket';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  type: 'CUSTOMER' | 'COMPANY' | 'DRIVER' | 'ADMIN';
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  termsAccepted: true;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partialUser: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function persistSession(user: AuthUser, accessToken: string, refreshToken: string) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  connectSocket(accessToken);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const userJson = localStorage.getItem(STORAGE_KEYS.user);
      const token = localStorage.getItem(STORAGE_KEYS.accessToken);
      if (userJson && token) {
        setUser(JSON.parse(userJson));
        connectSocket(token);
      }
    } finally {
      setIsLoading(false);
    }

    setOnSessionExpired(() => {
      setUser(null);
      disconnectSocket();
    });
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    persistSession(data.user, data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const register = async (input: RegisterInput) => {
    const { data } = await api.post('/auth/register/customer', input);
    persistSession(data.user, data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Mesmo que a chamada falhe, a sessão local é limpa de qualquer forma.
    }
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    disconnectSocket();
    setUser(null);
  };

  const updateUser = (partialUser: Partial<AuthUser>) => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, ...partialUser };
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
      return updated;
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated: !!user, login, register, logout, updateUser }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um <AuthProvider>');
  }
  return context;
}
