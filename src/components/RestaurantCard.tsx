import React from 'react';
import { colors } from '../theme/colors';
import { RestaurantSummary } from '../types/catalog';

export function RestaurantCard({ restaurant, onClick }: { restaurant: RestaurantSummary; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 14,
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {restaurant.bannerUrl ? (
        <img
          src={restaurant.bannerUrl}
          alt={restaurant.tradeName}
          style={{ width: '100%', height: 130, objectFit: 'cover', backgroundColor: colors.border }}
        />
      ) : (
        <div style={{ width: '100%', height: 130, backgroundColor: colors.border }} />
      )}
      <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        {restaurant.logoUrl ? (
          <img
            src={restaurant.logoUrl}
            alt=""
            style={{ width: 40, height: 40, borderRadius: 20, objectFit: 'cover', flexShrink: 0 }}
          />
        ) : null}
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
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
        </div>
      </div>
    </div>
  );
}
