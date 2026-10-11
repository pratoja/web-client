import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, extractApiErrorMessage } from '../config/api';
import { colors } from '../theme/colors';
import { RestaurantCard } from '../components/RestaurantCard';
import { BannerCarousel } from '../components/BannerCarousel';
import { Banner, RestaurantSummary } from '../types/catalog';

const TODOS = 'Todos';

export function HomePage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cuisineCategories, setCuisineCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(TODOS);

  const loadRestaurants = useCallback(async () => {
    try {
      const { data } = await api.get<RestaurantSummary[]>('/companies');
      setRestaurants(data);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, 'Não foi possível carregar os restaurantes.'));
    }
  }, []);

  const loadBanners = useCallback(async () => {
    try {
      const { data } = await api.get<Banner[]>('/banners');
      setBanners(data);
    } catch {
      setBanners([]);
    }
  }, []);

  const loadCuisineCategories = useCallback(async () => {
    try {
      const { data } = await api.get<{ id: string; name: string }[]>('/cuisine-categories');
      setCuisineCategories(data.map((category) => category.name));
    } catch {
      setCuisineCategories([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadRestaurants(), loadBanners(), loadCuisineCategories()]).finally(() => setIsLoading(false));
  }, [loadRestaurants, loadBanners, loadCuisineCategories]);

  const filteredRestaurants = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return restaurants.filter((restaurant) => {
      const matchesSearch = search
        ? restaurant.tradeName.toLowerCase().includes(search) ||
          (restaurant.cuisineType?.toLowerCase().includes(search) ?? false)
        : true;
      const matchesCategory = selectedCategory === TODOS ? true : restaurant.cuisineType === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [restaurants, searchText, selectedCategory]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 0 60px' }}>
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: colors.text, margin: 0 }}>O que você quer comer hoje?</h1>
        <p style={{ color: colors.textMuted, marginTop: 6 }}>
          Veja os restaurantes e o cardápio sem precisar entrar — o login só é pedido na hora de fechar o pedido.
        </p>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Buscar restaurante ou tipo de comida..."
          style={{
            width: '100%',
            height: 46,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            paddingLeft: 16,
            fontSize: 15,
            boxSizing: 'border-box',
          }}
        />
      </div>

      <BannerCarousel banners={banners} />

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 20px 4px' }}>
          {[TODOS, ...cuisineCategories].map((category) => {
            const isSelected = category === selectedCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                style={{
                  flexShrink: 0,
                  padding: '9px 18px',
                  borderRadius: 20,
                  border: `1px solid ${isSelected ? colors.primary : colors.border}`,
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  color: isSelected ? '#1A1A1A' : colors.text,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {isLoading ? (
          <p style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>Carregando restaurantes...</p>
        ) : errorMessage ? (
          <p style={{ color: colors.danger, textAlign: 'center', marginTop: 40 }}>{errorMessage}</p>
        ) : filteredRestaurants.length === 0 ? (
          <p style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>
            {restaurants.length === 0 ? 'Nenhum restaurante disponível no momento.' : 'Nenhum restaurante encontrado com esse filtro.'}
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} onClick={() => navigate(`/restaurante/${restaurant.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
