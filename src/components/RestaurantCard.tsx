import React from 'react';
import { colors } from '../theme/colors';
import { RestaurantSummary } from '../types/catalog';

export function RestaurantCard({ restaurant, onClick }: { restaurant: RestaurantSummary; onClick: () => void }) {
  // Só mostra nota/tempo/distância quando o dado é real (nunca inventamos
  // número) — cada um aparece sozinho se os outros ainda não existirem.
  const hasRating = restaurant.averageRating != null && (restaurant.reviewCount ?? 0) > 0;
  const hasTime = restaurant.estimatedMinutes != null;
  const hasDistance = restaurant.distanceKm != null;
  const hasInfoRow = hasRating || hasTime || hasDistance;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ position: 'relative' }}>
        {restaurant.bannerUrl ? (
          <img
            src={restaurant.bannerUrl}
            alt={restaurant.tradeName}
            style={{ width: '100%', height: 140, objectFit: 'cover', backgroundColor: colors.border }}
          />
        ) : (
          <div style={{ width: '100%', height: 140, backgroundColor: colors.border }} />
        )}
        {restaurant.logoUrl ? (
          <img
            src={restaurant.logoUrl}
            alt=""
            style={{
              position: 'absolute',
              bottom: -20,
              left: 14,
              width: 52,
              height: 52,
              borderRadius: 14,
              objectFit: 'cover',
              border: `3px solid ${colors.surface}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              backgroundColor: colors.surface,
            }}
          />
        ) : null}
      </div>
      <div style={{ padding: '28px 14px 14px' }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: colors.text,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {restaurant.tradeName}
        </div>
        {restaurant.cuisineType ? (
          <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>{restaurant.cuisineType}</div>
        ) : null}

        {hasInfoRow ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 8,
              fontSize: 13,
              fontWeight: 600,
              color: colors.textMuted,
              flexWrap: 'wrap',
            }}
          >
            {hasRating ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: colors.text }}>
                ⭐ {restaurant.averageRating!.toFixed(1)}
              </span>
            ) : null}
            {hasTime ? <span>⏱️ {restaurant.estimatedMinutes} min</span> : null}
            {hasDistance ? <span>📍 {restaurant.distanceKm!.toFixed(1)} km</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
