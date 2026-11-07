import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, extractApiErrorMessage } from '../config/api';
import { colors } from '../theme/colors';
import { RestaurantCard } from '../components/RestaurantCard';
import { BannerCarousel } from '../components/BannerCarousel';
import { CategoryChips } from '../components/CategoryChips';
import { Banner, Category, RestaurantSummary } from '../types/catalog';

const TODOS_ID = 'todos';
const TODOS_CHIP = { id: TODOS_ID, name: 'Todos', imageUrl: null };

export function HomePage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cuisineCategories, setCuisineCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(TODOS_ID);
  // Localização do navegador (quando o cliente autoriza) — usada só para
  // mostrar a distância real até cada loja nos cards; sem ela, o card
  // simplesmente não mostra essa informação (nunca um valor inventado).
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setCoords(null),
      { timeout: 8000 },
    );
  }, []);

  const loadRestaurants = useCallback(async (location: { lat: number; lng: number } | null) => {
    try {
      const { data } = await api.get<RestaurantSummary[]>('/companies', {
        params: location ? { lat: location.lat, lng: location.lng } : undefined,
      });
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
      const { data } = await api.get<Category[]>('/cuisine-categories');
      setCuisineCategories(data);
    } catch {
      setCuisineCategories([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadRestaurants(coords), loadBanners(), loadCuisineCategories()]).finally(() =>
      setIsLoading(false),
    );
    // Só recarrega a lista de restaurantes quando a localização chega depois
    // (geolocalização é assíncrona) — banners/categorias não dependem dela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  const categoryChips = useMemo(() => [TODOS_CHIP, ...cuisineCategories], [cuisineCategories]);

  const selectedCategoryName = useMemo(
    () => cuisineCategories.find((category) => category.id === selectedCategoryId)?.name ?? null,
    [cuisineCategories, selectedCategoryId],
  );

  const filteredRestaurants = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return restaurants.filter((restaurant) => {
      const matchesSearch = search
        ? restaurant.tradeName.toLowerCase().includes(search) ||
          (restaurant.cuisineType?.toLowerCase().includes(search) ?? false)
        : true;
      const matchesCategory =
        selectedCategoryId === TODOS_ID ? true : restaurant.cuisineType === selectedCategoryName;
      return matchesSearch && matchesCategory;
    });
  }, [restaurants, searchText, selectedCategoryId, selectedCategoryName]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 0 60px' }}>
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: colors.text, margin: 0 }}>O que você quer comer hoje?</h1>
        <p style={{ color: colors.textMuted, marginTop: 6 }}>
          Veja os restaurantes e o cardápio sem precisar entrar — o login só é pedido na hora de fechar o pedido.
        </p>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 18,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 17,
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar restaurante ou tipo de comida..."
            style={{
              width: '100%',
              height: 50,
              borderRadius: 25,
              border: `1px solid ${colors.border}`,
              paddingLeft: 46,
              paddingRight: 16,
              fontSize: 15,
              boxSizing: 'border-box',
              backgroundColor: colors.surface,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }}
          />
        </div>
      </div>

      <BannerCarousel banners={banners} />

      <div style={{ marginBottom: 24 }}>
        <div style={{ padding: '0 20px', marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: colors.text }}>Categorias</h2>
        </div>
        <CategoryChips items={categoryChips} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />
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
