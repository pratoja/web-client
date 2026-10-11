import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, extractApiErrorMessage } from '../config/api';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { CategoryChips } from '../components/CategoryChips';
import { BannerCarousel } from '../components/BannerCarousel';
import { Banner, Category, CompanyDetail, CompanyReview, Product } from '../types/catalog';

const ALL_CATEGORIES_ID = '__ALL__';

export function RestaurantPage() {
  const { companyId = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const cart = useCart();
  const favorites = useFavorites();

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL_CATEGORIES_ID);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [switchConfirm, setSwitchConfirm] = useState<Product | null>(null);

  const loadMenu = useCallback(async () => {
    try {
      const [companyResponse, categoriesResponse, productsResponse] = await Promise.all([
        api.get<CompanyDetail>(`/companies/${companyId}`),
        api.get<Category[]>(`/companies/${companyId}/categories`),
        api.get<Product[]>(`/companies/${companyId}/products`),
      ]);
      setCompany(companyResponse.data);
      setCategories(categoriesResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error, 'Não foi possível carregar o cardápio.'));
    }
  }, [companyId]);

  const loadBanners = useCallback(async () => {
    try {
      const { data } = await api.get<Banner[]>('/banners', { params: { companyId } });
      setBanners(data);
    } catch {
      setBanners([]);
    }
  }, [companyId]);

  const loadReviews = useCallback(async () => {
    try {
      const { data } = await api.get<CompanyReview[]>(`/reviews/company/${companyId}`);
      setReviews(data);
    } catch {
      setReviews([]);
    }
  }, [companyId]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadMenu(), loadBanners(), loadReviews()]).finally(() => setIsLoading(false));
  }, [loadMenu, loadBanners, loadReviews]);

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null;

  const visibleProducts =
    selectedCategoryId === ALL_CATEGORIES_ID ? products : products.filter((p) => p.categoryId === selectedCategoryId);

  function quantityOf(productId: string) {
    return cart.items.filter((item) => item.productId === productId).reduce((sum, item) => sum + item.quantity, 0);
  }

  function requireLogin() {
    navigate('/entrar', { state: { from: `/restaurante/${companyId}` } });
  }

  async function performAdd(productId: string) {
    setAddingProductId(productId);
    const result = await cart.addItem(productId);
    setAddingProductId(null);
    if (!result.ok && !result.conflict) {
      window.alert(result.message);
    }
  }

  async function handleAddProduct(product: Product) {
    if (!isAuthenticated) {
      requireLogin();
      return;
    }
    if (cart.companyId && cart.companyId !== companyId && cart.items.length > 0) {
      setSwitchConfirm(product);
      return;
    }
    await performAdd(product.id);
  }

  async function handleConfirmSwitch() {
    if (!switchConfirm) return;
    const product = switchConfirm;
    setSwitchConfirm(null);
    await cart.clearCart();
    await performAdd(product.id);
  }

  async function handleToggleFavorite(productId: string) {
    if (!isAuthenticated) {
      requireLogin();
      return;
    }
    const success = await favorites.toggleFavorite(productId);
    if (!success) {
      window.alert('Não foi possível atualizar seus favoritos. Tente novamente.');
    }
  }

  const showCartBar = cart.companyId === companyId && cart.totalItems > 0;

  const chipItems = [{ id: ALL_CATEGORIES_ID, name: 'Todos' }, ...categories];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 100 }}>
      <div style={{ padding: '20px 20px 0' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: colors.primaryDark, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
        >
          ‹ Voltar
        </button>
      </div>

      <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: colors.text, margin: 0 }}>{company?.tradeName ?? ''}</h1>
        {averageRating !== null ? (
          <span style={{ fontSize: 13, color: colors.textMuted }}>
            ⭐ {averageRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
          </span>
        ) : null}
      </div>

      {company?.bannerUrl ? (
        <img src={company.bannerUrl} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', marginTop: 14 }} />
      ) : null}

      <div style={{ marginTop: 14 }}>
        <BannerCarousel banners={banners} />
      </div>

      {isLoading ? (
        <p style={{ textAlign: 'center', color: colors.textMuted, marginTop: 40 }}>Carregando cardápio...</p>
      ) : errorMessage ? (
        <p style={{ textAlign: 'center', color: colors.danger, marginTop: 40 }}>{errorMessage}</p>
      ) : (
        <>
          <div style={{ marginTop: 16, marginBottom: 10 }}>
            <CategoryChips items={chipItems} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />
          </div>

          <div style={{ padding: '0 20px' }}>
            {visibleProducts.length === 0 ? (
              <p style={{ textAlign: 'center', color: colors.textMuted, marginTop: 24 }}>Nenhum produto nessa categoria ainda.</p>
            ) : (
              visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantityInCart={quantityOf(product.id)}
                  isAdding={addingProductId === product.id}
                  isFavorited={favorites.isFavorite(product.id)}
                  onAdd={() => handleAddProduct(product)}
                  onToggleFavorite={() => handleToggleFavorite(product.id)}
                />
              ))
            )}
          </div>
        </>
      )}

      {showCartBar ? (
        <div
          onClick={() => navigate('/sacola')}
          style={{
            position: 'fixed',
            left: 20,
            right: 20,
            bottom: 20,
            maxWidth: 1060,
            margin: '0 auto',
            backgroundColor: colors.primary,
            borderRadius: 14,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          }}
        >
          <span style={{ fontWeight: 700 }}>
            {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'itens'} · {formatCurrency(cart.subtotal)}
          </span>
          <span style={{ fontWeight: 800 }}>Ver sacola</span>
        </div>
      ) : null}

      {switchConfirm ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 24, maxWidth: 360 }}>
            <h3 style={{ marginTop: 0 }}>Trocar de restaurante?</h3>
            <p style={{ color: colors.textMuted, fontSize: 14 }}>
              Sua sacola tem itens de outro restaurante. Adicionar este item vai esvaziar a sacola atual.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSwitchConfirm(null)}
                style={{ border: 'none', background: 'none', color: colors.textMuted, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSwitch}
                style={{ border: 'none', background: colors.danger, color: '#fff', fontWeight: 700, padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}
              >
                Esvaziar e adicionar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
