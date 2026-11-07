import React from 'react';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/format';
import { Product } from '../types/catalog';

interface Props {
  product: Product;
  quantityInCart: number;
  isAdding: boolean;
  isFavorited: boolean;
  onAdd: () => void;
  onToggleFavorite: () => void;
}

export function ProductCard({ product, quantityInCart, isAdding, isFavorited, onAdd, onToggleFavorite }: Props) {
  const image = (product.images ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const hasPromo = product.promoPrice != null && Number(product.promoPrice) > 0;
  const isAvailable = product.isAvailable !== false;

  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        backgroundColor: colors.surface,
        borderRadius: 16,
        border: `1px solid ${colors.border}`,
        padding: 14,
        marginBottom: 12,
        opacity: isAvailable ? 1 : 0.6,
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>{product.name}</div>
          <button
            type="button"
            onClick={onToggleFavorite}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: isFavorited ? colors.danger : colors.textMuted,
              flexShrink: 0,
            }}
            aria-label="Favoritar"
          >
            {isFavorited ? '♥' : '♡'}
          </button>
        </div>
        {product.description ? (
          <div
            style={{
              fontSize: 13,
              color: colors.textMuted,
              marginTop: 4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description}
          </div>
        ) : null}

        <div style={{ marginTop: 10 }}>
          {hasPromo ? (
            <>
              <span style={{ fontSize: 13, color: colors.textMuted, textDecoration: 'line-through', marginRight: 6 }}>
                {formatCurrency(product.price)}
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, color: colors.success }}>
                {formatCurrency(product.promoPrice as number)}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 16, fontWeight: 800, color: colors.text }}>{formatCurrency(product.price)}</span>
          )}
        </div>

        {!isAvailable ? (
          <span style={{ fontSize: 12, color: colors.danger, fontWeight: 600 }}>Indisponível</span>
        ) : null}
      </div>

      {/* Imagem à direita com o botão "+" sobreposto no canto — igual ao
          visual do iFood — mesmo quando a loja não cadastrou foto (mostra
          um quadrado neutro no lugar, pra não quebrar o alinhamento). */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {image ? (
          <img
            src={image.url}
            alt=""
            style={{ width: 100, height: 100, borderRadius: 14, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: 100, height: 100, borderRadius: 14, backgroundColor: colors.border }} />
        )}

        {quantityInCart > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: -8,
              left: -8,
              minWidth: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: colors.dark,
              color: colors.onDark,
              fontSize: 11,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 5px',
            }}
          >
            {quantityInCart}
          </span>
        ) : null}

        {isAvailable ? (
          <button
            type="button"
            onClick={onAdd}
            disabled={isAdding}
            aria-label="Adicionar"
            style={{
              position: 'absolute',
              bottom: -10,
              right: -10,
              width: 32,
              height: 32,
              borderRadius: 16,
              border: `2px solid ${colors.surface}`,
              backgroundColor: colors.primary,
              color: '#1A1A1A',
              fontWeight: 800,
              fontSize: 18,
              lineHeight: '28px',
              textAlign: 'center',
              padding: 0,
              cursor: isAdding ? 'default' : 'pointer',
              opacity: isAdding ? 0.6 : 1,
              boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
            }}
          >
            {isAdding ? '…' : '+'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
