import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/format';
import { api, extractApiErrorMessage } from '../config/api';
import { useFavorites } from '../context/FavoritesContext';
import { FavoriteItem } from '../types/misc';

export function FavoritesPage() {
  const navigate = useNavigate();
  const favoritesContext = useFavorites();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    try {
      const { data } = await api.get<FavoriteItem[]>('/favorites/me');
      setFavorites(data);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, 'Não foi possível carregar seus favoritos.'));
    }
  }, []);

  useEffect(() => {
    loadFavorites().finally(() => setIsLoading(false));
  }, [loadFavorites]);

  async function handleRemove(favorite: FavoriteItem) {
    setRemovingId(favorite.productId);
    setFavorites((current) => current.filter((item) => item.id !== favorite.id));
    const success = await favoritesContext.removeFavorite(favorite.productId);
    if (!success) {
      setFavorites((current) => [...current, favorite]);
    }
    setRemovingId(null);
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 20px 60px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.text }}>Seus favoritos</h1>

      {isLoading ? (
        <p style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>Carregando favoritos...</p>
      ) : errorMessage ? (
        <p style={{ color: colors.danger, textAlign: 'center', marginTop: 40 }}>{errorMessage}</p>
      ) : favorites.length === 0 ? (
        <p style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>
          Você ainda não favoritou nenhum produto. Toque no coração de um item no cardápio para guardá-lo aqui.
        </p>
      ) : (
        favorites.map((item) => {
          const image = item.product.images.slice().sort((a, b) => a.sortOrder - b.sortOrder)[0];
          return (
            <div
              key={item.id}
              onClick={() => navigate(`/restaurante/${item.product.company.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 14, border: `1px solid ${colors.border}`, padding: 12, marginBottom: 12, cursor: 'pointer' }}
            >
              {image ? (
                <img src={image.url} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  {item.product.name.slice(0, 1)}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>{item.product.company.tradeName}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{item.product.name}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{formatCurrency(item.product.price)}</div>
                {!item.product.isAvailable ? <div style={{ fontSize: 11, color: colors.danger, fontWeight: 600 }}>Indisponível no momento</div> : null}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
                disabled={removingId === item.productId}
                style={{ border: 'none', background: 'none', color: colors.danger, fontSize: 18, cursor: 'pointer' }}
                aria-label="Remover"
              >
                ♥
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
