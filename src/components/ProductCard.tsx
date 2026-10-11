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
        gap: 12,
        backgroundColor: colors.surface,
        borderRadius: 14,
        border: `1px solid ${colors.border}`,
        padding: 12,
        marginBottom: 12,
        opacity: isAvailable ? 1 : 0.6,
      }}
    >
      {image ? (
        <img src={image.url} alt="" style={{ width: 84, height: 84, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 84, height: 84, borderRadius: 10, backgroundColor: colors.border, flexShrink: 0 }} />
      )}

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
          <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>{product.description}</div>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div>
            {hasPromo ? (
              <>
                <span style={{ fontSize: 13, color: colors.textMuted, textDecoration: 'line-through', marginRight: 6 }}>
                  {formatCurrency(product.price)}
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: colors.success }}>
                  {formatCurrency(product.promoPrice as number)}
                </span>
              </>
            ) : (
              <span style={{ fontSize: 15, fontWeight: 800, color: colors.text }}>{formatCurrency(product.price)}</span>
            )}
          </div>

          {!isAvailable ? (
            <span style={{ fontSize: 12, color: colors.danger, fontWeight: 600 }}>Indisponível</span>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              disabled={isAdding}
              style={{
                backgroundColor: colors.primary,
                border: 'none',
                borderRadius: 8,
                padding: '8px 14px',
                fontWeight: 700,
                fontSize: 13,
                cursor: isAdding ? 'default' : 'pointer',
                opacity: isAdding ? 0.6 : 1,
              }}
            >
              {isAdding ? '...' : quantityInCart > 0 ? `Adicionar (${quantityInCart} na sacola)` : 'Adicionar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
