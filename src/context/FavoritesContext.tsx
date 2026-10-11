import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../config/api';
import { useAuth } from './AuthContext';
import { FavoriteItem } from '../types/misc';

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isLoading: boolean;
  isFavorite: (productId: string) => boolean;
  addFavorite: (productId: string) => Promise<boolean>;
  removeFavorite: (productId: string) => Promise<boolean>;
  toggleFavorite: (productId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<FavoriteItem[]>('/favorites/me');
      setFavoriteIds(new Set(data.map((item) => item.productId)));
    } catch {
      // Sem conexão ou sessão inválida — mantém o que já tinha em memória.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setFavoriteIds(new Set());
    }
  }, [isAuthenticated, refresh]);

  const isFavorite = useCallback((productId: string) => favoriteIds.has(productId), [favoriteIds]);

  async function addFavorite(productId: string): Promise<boolean> {
    setFavoriteIds((current) => new Set(current).add(productId));
    try {
      await api.post('/favorites', { productId });
      return true;
    } catch {
      setFavoriteIds((current) => {
        const next = new Set(current);
        next.delete(productId);
        return next;
      });
      return false;
    }
  }

  async function removeFavorite(productId: string): Promise<boolean> {
    let hadIt = false;
    setFavoriteIds((current) => {
      hadIt = current.has(productId);
      const next = new Set(current);
      next.delete(productId);
      return next;
    });
    try {
      await api.delete(`/favorites/${productId}`);
      return true;
    } catch {
      if (hadIt) {
        setFavoriteIds((current) => new Set(current).add(productId));
      }
      return false;
    }
  }

  async function toggleFavorite(productId: string): Promise<boolean> {
    return favoriteIds.has(productId) ? removeFavorite(productId) : addFavorite(productId);
  }

  const value = useMemo<FavoritesContextValue>(
    () => ({ favoriteIds, isLoading, isFavorite, addFavorite, removeFavorite, toggleFavorite, refresh }),
    [favoriteIds, isLoading, isFavorite, refresh],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites precisa ser usado dentro de um FavoritesProvider');
  }
  return context;
}
